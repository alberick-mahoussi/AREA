<template>
  <div class="services-page">
    <Header/>
    <div class="top">
      <input type="text" v-model="searchQuery" class="search-bar" placeholder="Search service"/>
      <button class="save-button" @click="saveChanges">Save</button>
    </div>
      <div class="content">
      <div class="services-row" v-for="(row, rowIndex) in serviceRows" :key="rowIndex">
        <div v-for="(service, serviceIndex) in row" :key="serviceIndex" class="list-services">
          <div class="square-button">
            <img :src="service.picture" alt="Service Image" class="service-image"/>
            <div class="service-label">{{ service.name }}</div>
            <label :class="{ 'switch-active': servicesState[service.name] }" class="switch">
              <input type="checkbox" :checked="servicesState[service.name]" @change="updateCheckboxState(service)">
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/HeaderArea.vue'
import axios from 'axios'

export default {
  name: 'Edit-Services',
  components: {
    Header
  },
  data () {
    return {
      searchQuery: '',
      servicesState: {}
    }
  },
  async created () {
    this.services.forEach(service => {
      this.$set(this.servicesState, service.name, true)
    })
    try {
      const apiUrl = process.env.SERVER_URL + '/users/ListServiceDiseabled'
      const token = localStorage.getItem('userToken')
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      response.data.forEach(disabledService => {
        if (this.servicesState.hasOwnProperty(disabledService)) {
          this.servicesState[disabledService] = false
        }
      })
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  },
  computed: {
    services () {
      return this.$store.state.servicesData.server.services
    },
    filteredServices () {
      const query = this.searchQuery.toLowerCase()
      return this.services.filter(service => service.name.toLowerCase().includes(query))
    },
    serviceRows () {
      const rows = []
      const servicesPerPage = 5

      for (let i = 0; i < this.filteredServices.length; i += servicesPerPage) {
        rows.push(this.filteredServices.slice(i, i + servicesPerPage))
      }
      return rows
    }
  },
  methods: {
    updateCheckboxState (service) {
      this.$set(this.servicesState, service.name, !this.servicesState[service.name])
    },
    async saveChanges () {
      const servicesToSave = this.filteredServices.filter(service => !this.servicesState[service.name])
      const serviceDiseableDto = {ServiceDiseable: servicesToSave.map((service) => service.name)}
      const url = process.env.SERVER_URL + '/users/DiseableService'
      const token = localStorage.getItem('userToken')
      const headers = {
        'Authorization': `Bearer ${token}`
      }
      try {
        await axios.post(url, serviceDiseableDto, { headers })
      } catch (error) {
        console.error(`Erreur ${error.response.status}: ${error.response.data}`)
      }
    }
  }
}
</script>

<style scoped>
.services-page {
  height: 100vh;
  background-color: white;
  overflow-y: auto;
  padding-bottom: 300px;
}
.top {
  display: flex;
  justify-content: space-between;
  margin-top: 4%;
  margin-bottom: 1%;
}
.search-bar {
  margin-left: 34%;
  width: 600px;
  height: 70px;
  border: 1px solid rgb(174 174 174);
  border-radius: 20px;
  font-size: 3rem;
  text-align: center;
}
.save-button {
  margin-right: 10%;
  padding: 22px;
  font-size: 24px;
  cursor: pointer;
  color: #fff;
  background-color: black;
  border: none;
  border-radius: 15px;
  box-shadow: 0 9px #999;
}
.save-button:active {
  box-shadow: 0 5px #666;
  transform: translateY(4px);
}
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}
.services-row {
  width: 80%;
  margin-top: 3%;
  display: flex;
  justify-content: center;
  text-decoration: none;
  color: black;
  margin-left: 2%;
  margin-right: 2%;
}
.square-button {
  width: 260px;
  height: 230px;
  border: 1px solid rgb(174 174 174);
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.list-services {
  text-decoration: none;
  color: black;
  margin-left: 2%;
  margin-right: 2%;
}
.service-image {
  max-width: 30%;
  border-radius: 5px;
  margin-top: 10%;
  margin-bottom: 10%;
}
.switch {
  position: relative;
  display: inline-block;
  margin-top: 10%;
  width: 60px;
  height: 34px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}
input:checked + .slider {
  background-color: black;
}
input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}
.slider.round {
  border-radius: 34px;
}
.slider.round:before {
  border-radius: 50%;
}
.switch-active .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}
</style>
