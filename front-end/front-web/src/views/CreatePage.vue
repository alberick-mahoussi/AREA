<template>
  <div class="area-page">
    <Header/>
    <div class="top">
      <div class="hello">Welcome {{ username }}</div>
    </div>
    <div class="content">
      <div class="container">
        <button type="button" class="first-service" @click="selectAction" :class="{ 'with-image': $store.state.service1 }">
          <img class="img1" v-if="$store.state.service1" :src="$store.state.servicesData.server.services[$store.state.service1].picture" alt="Service 1"/>
          {{$store.state.service1 ? $store.state.servicesData.server.services[$store.state.service1].name : 'First Service'}}
        </button>
        <DeleteButton v-if="$store.state.service1" ref="deleteButton" @delete="onDeleteService1" class="position-absolute"/>
      </div>
      <div class="arrow"></div>
      <div class="container">
        <button type="button" class="second-service" @click="selectReaction" :disabled="$store.state.action === null" :class="{ 'with-image': $store.state.service2, 'service-disable': $store.state.action === null}">
          <img class="img2" v-if="$store.state.service2" :src="$store.state.servicesData.server.services[$store.state.service2].picture" alt="Service 2"/>
          {{$store.state.service2 ? $store.state.servicesData.server.services[$store.state.service2].name : 'Second Service'}}
        </button>
        <DeleteButton v-if="$store.state.service2" ref="deleteButton" @delete="onDeleteService2" class="position-absolute"/>
      </div>
      <button type="button" class="finish" @click="finishCreation" :disabled="$store.state.reaction === null" :class="{ 'finish-disable': $store.state.reaction === null }">Finish</button>
      <div v-if="showDetailPopup" class="popup">
        <p>Area created</p>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/HeaderArea.vue'
import DeleteButton from '@/components/DeleteButton.vue'
import axios from 'axios'

export default {
  created () {
    this.fetchUserData()
    this.$store.dispatch('fetchServicesData')
  },
  data () {
    return {
      showDetailPopup: false,
      username: ''
    }
  },
  methods: {
    async fetchUserData () {
      try {
        const apiUrl = process.env.SERVER_URL + '/users/me'
        const token = localStorage.getItem('userToken')
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        this.username = response.data.user.username
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    },
    selectAction () {
      this.$store.commit('setChoice', 'action')
      this.loadDataAndNavigate()
    },
    selectReaction () {
      if (this.$store.state.service1) {
        this.$store.commit('setChoice', 'reaction')
        this.loadDataAndNavigate()
      } else {
        console.log("Veuillez d'abord choisir le premier service.")
      }
    },
    loadDataAndNavigate () {
      this.$store.dispatch('fetchServicesData')
      this.$router.push('/services')
    },
    async finishCreation () {
      this.$store.commit('getStateOfArea')
      if (this.$store.state.completeArea) {
        const area = {
          ActionId: this.$store.state.action.toString(),
          ActionName: this.$store.state.servicesData.server.services[this.$store.state.service1].name,
          ActionParam: this.$store.state.params1,
          ReactionId: this.$store.state.reaction.toString(),
          ReactionName: this.$store.state.servicesData.server.services[this.$store.state.service2].name,
          ReactionParam: this.$store.state.params2
        }
        try {
          const apiUrl = process.env.SERVER_URL + '/users/CreateArea'
          const token = localStorage.getItem('userToken')
          const headers = {'Authorization': `Bearer ${token}`}
          await axios.post(apiUrl, area, { headers })
        } catch (error) {
          console.error('Error:', error)
        }
        this.$store.commit('addToHistory', area)
        this.openDetailPopup()
      }
    },
    onDeleteService1 () {
      if (this.$store.state.service2) {
        this.$store.state.service2 = null
        this.$store.state.reaction = null
        this.$store.state.completeArea = null
      }
      this.$store.state.service1 = null
      this.$store.state.action = null
    },
    onDeleteService2 () {
      this.$store.state.service2 = null
      this.$store.state.reaction = null
      this.$store.state.completeArea = null
    },
    openDetailPopup () {
      this.showDetailPopup = true

      setTimeout(() => {
        this.closeDetailPopup()
      }, 3000)
    },
    closeDetailPopup () {
      this.showDetailPopup = false
    }
  },
  name: 'AreaPage',
  components: {
    Header,
    DeleteButton
  }
}
</script>

<style scoped>
.area-page {
  height: 100vh;
  background-color: white;
  overflow-y: auto;
  padding-bottom: 300px;
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6%;
}
.hello {
  margin-left: 6%;
  font-size: 2rem;
}
.content {
  margin-top: 2%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}
.first-service, .second-service {
  width: 700px;
  height: 130px;
  border: 3px solid rgb(174 174 174);
  margin-bottom: 5%;
  margin-top: 5%;
  border-radius: 10px;
  cursor: pointer;
  font-size: 2.5rem;
  text-align: center;
  background: none;
}
.first-service:hover, .second-service:hover {
  border: 4px solid black;
}
.finish {
  width: 450px;
  height: 80px;
  border: 1px solid rgb(174 174 174);
  margin-top: 2%;
  border-radius: 50px;
  font-size: 1.5rem;
  cursor: pointer;
  background: none;
}
.finish:hover {
  border: 2px solid black;
}
.finish-disable {
  cursor: default;
  opacity: 0.6;
}
.finish-disable:hover {
  border: 1px solid rgb(174 174 174);
}
.arrow {
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 35px solid black;
}
.img1, .img2 {
  margin-left: 10%;
  margin-right: 15%;
  width: 70px;
}
.first-service.with-image, .second-service.with-image {
  display: flex;
  align-items: center;
}
.container {
  display: flex;
  align-items: center;
}
.position-absolute {
  position: absolute;
  margin-left: 630px;
}
.popup {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  margin-top: 1.5%;
  padding-left: 1%;
  padding-right: 1%;
  background-color: #fefefe;
  border: 2px solid green;
  border-radius: 5px;
  position: relative;
}
.service-disable {
  cursor: default;
  opacity: 0.6;
}
.service-disable:hover {
  border: 3px solid rgb(174 174 174);
}
</style>
