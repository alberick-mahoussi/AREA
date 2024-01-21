<template>
  <div class="services-page">
    <Header/>
    <div class="top">
      <button class="back" @click="goBack">Back</button>
      <div class="title">Confirm your action</div>
    </div>
    <div class="content">
      <div class="input-group" v-for="(param, index) in parameters" :key="index">
        <label :for="'input' + index">{{ param.name }}:</label>
        <input :id="'input' + index" v-model="param.value" @keyup.enter="confirmAction"/>
      </div>
      <button class="confirm" @click="confirmAction">Confirm</button>
    </div>
  </div>
</template>

<script>
import Header from '@/components/HeaderArea.vue'

export default {
  name: 'Service',
  components: {
    Header
  },
  methods: {
    isConfirmButtonDisabled () {
      return this.parameters.some(param => param.value.trim() === '')
    },
    goBack () {
      const serviceIndex = this.$route.params.serviceIndex
      this.$router.push(`/actions/${serviceIndex}`)
    },
    confirmAction () {
      if (this.isConfirmButtonDisabled() === false) {
        const serviceIndex = this.serviceIndex
        const actionIndex = this.actionIndex
        const parameters = this.parameters.map(param => param.value)
        if (this.$store.state.choice === 'action') {
          this.$store.commit('setService1', {
            service1: serviceIndex,
            action: actionIndex,
            params1: parameters
          })
        } else {
          this.$store.commit('setService2', {
            service2: serviceIndex,
            reaction: actionIndex,
            params2: parameters
          })
        }
        this.$router.push('/create')
      }
    }
  },
  computed: {
    services () {
      return this.$store.state.servicesData.server.services
    },
    parameters () {
      const serviceIndex = this.$route.params.serviceIndex
      const actionIndex = this.$route.params.actionIndex
      const choice = this.$store.state.choice
      const service = this.services[serviceIndex]
      const area = choice === 'action' ? service.actions : service.reactions
      return area[actionIndex].parameters.map(param => ({
        name: param,
        value: ''
      }))
    }
  },
  props: ['serviceIndex', 'actionIndex']
}
</script>

<style scoped>
.services-page {
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
.title {
  margin-right: 37%;
  font-size: 4rem;
}
.content {
  margin-top: 3%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.confirm {
  width: 500px;
  height: 90px;
  border: 1px solid rgb(174 174 174);
  margin-top: 5%;
  border-radius: 50px;
  cursor: pointer;
  font-size: 2.5rem;
}
.input-group {
  margin-bottom: 1%;
  display: flex;
  flex-direction: column;
}
label {
  margin-bottom: 5px;
  text-align: left;
}
input {
  width: 300px;
  height: 30px;
  padding: 8px;
  font-size: 1rem;
  border: 1px solid rgb(174 174 174);
  border-radius: 5px;
}
</style>
