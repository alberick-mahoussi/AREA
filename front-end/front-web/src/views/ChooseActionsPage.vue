<template>
  <div class="actions-page">
    <Header/>
    <div class="top">
      <router-link to="/services">
        <button class="back">Back</button>
      </router-link>
      <div class="select">{{ selectText }}</div>
    </div>
    <div class="content">
      <div class="services-row" v-for="(row, rowIndex) in serviceRows" :key="rowIndex">
        <div v-for="(action, actionIndex) in row" :key="actionIndex" class="buttons">
          <router-link class="router-link" :to="{
            name: 'ConfirmActionPage',
            params: {
              serviceIndex: $route.params.serviceIndex,
              actionIndex: actionIndex + rowIndex * 5
            }
          }">
            <div class="square-button">
              <div class="button-label">{{ formatActionName(action.name) }}</div>
              <div class="action-description" v-show="hoveredActionIndex === actionIndex + rowIndex * 5">{{ action.description }}</div>
              <span class="action-info" @mouseover="setHoveredAction(actionIndex + rowIndex * 5)" @mouseout="setHoveredAction(null)">ℹ️</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/HeaderArea.vue'

export default {
  name: 'Areas',
  components: {
    Header
  },
  data () {
    return {
      hoveredActionIndex: null
    }
  },
  methods: {
    formatActionName (name) {
      return name.replace(/_/g, ' ')
    },
    setHoveredAction (index) {
      this.hoveredActionIndex = index
    }
  },
  computed: {
    services () {
      return this.$store.state.servicesData.server.services
    },
    selectText () {
      return this.$store.state.choice === 'action' ? 'Choose an action' : 'Choose a reaction'
    },
    serviceRows () {
      const rows = []
      const actionsPerPage = 5
      const serviceIndex = this.$route.params.serviceIndex
      const serviceArea = this.$store.state.choice === 'action' ? this.services[serviceIndex].actions : this.services[serviceIndex].reactions

      for (let i = 0; i < serviceArea.length; i += actionsPerPage) {
        rows.push(serviceArea.slice(i, i + actionsPerPage))
      }
      return rows
    }
  }
}
</script>

<style scoped>
.actions-page {
  height: 100vh;
  background-color: white;
  overflow-y: auto;
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 2rem;
  margin-top: 4%;
}
.back {
  width: 130px;
  height: 50px;
  margin-left: 100px;
  border: 1px solid rgb(174 174 174);
  border-radius: 20px;
  font-size: 1.5rem;
  cursor: pointer;
}
.select {
  margin-right: 36%;
  font-size: 4rem;
}
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.services-row {
  width: 80%;
  margin-top: 1%;
  display: flex;
  justify-content: center;
}
.square-button {
  width: 260px;
  height: 230px;
  border: 1px solid rgb(174 174 174);
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.square-button:hover {
  border: 1px solid black;
}
.router-link {
  text-decoration: none;
  color: black;
}
.buttons {
  margin-left: 2%;
  margin-right: 2%;
  margin-top: 3%;
}
.button-label {
  margin-top: 30%;
  font-size: 1.5rem;
}
.action-info {
  margin-bottom: 5px;
  font-size: 1.5rem;
}
.action-description {
  position: fixed;
  margin-left: 130px;
  margin-top: 150px;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border: 1px solid black;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transition: opacity 0.3s, transform 0.3s
}
</style>
