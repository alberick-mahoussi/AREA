<template>
  <div class="container">
    <div class="widget">
      <div class="image">
        <img class="first-logo" :src="serviceImageUrl(widget.Action_Service)"/>
        <span class="action-description">{{ getActionNameById(widget.Action_Service, widget.Action_Id) }}</span>
        <img class="arrow" src="@/assets/arrow.png">
        <img class="second-logo" :src="serviceImageUrl(widget.Reaction_Service)"/>
        <span class="reaction-description">{{ getReactionNameById(widget.Reaction_Service, widget.Reaction_Id) }}</span>
      </div>
    </div>
    <div>
      <DeleteButton class="bin" ref="deleteButton" @delete="onDeleteWidget"/>
      <div v-if="tooltipVisible" class="tooltip" :style="{ top: tooltipTop + 'px', left: tooltipLeft + 'px' }">
        {{ tooltipText }}
      </div>
    </div>
  </div>
</template>

<script>
import DeleteButton from './DeleteButton.vue'
import axios from 'axios'

export default {
  name: 'WidgetManageArea',
  components: {
    DeleteButton
  },
  props: {
    widget: {
      type: Object,
      isActive: true
    }
  },
  data () {
    return {
      tooltipVisible: false,
      tooltipText: '',
      tooltipTop: 0,
      tooltipLeft: 0
    }
  },
  methods: {
    serviceImageUrl (serviceName) {
      const servicesData = this.$store.state.servicesData.server.services
      const service = servicesData.find((s) => s.name === serviceName)
      return service ? service.picture : ''
    },
    getActionNameById (actionName, actionId) {
      const servicesData = this.$store.state.servicesData.server.services
      const service = servicesData.find((s) => s.name === actionName)
      if (service && service.actions) {
        const action = service.actions.find((a) => a.serviceId === actionId)
        return action ? action.name : ''
      }
      return ''
    },
    getReactionNameById (reactionName, reactionId) {
      const servicesData = this.$store.state.servicesData.server.services
      const service = servicesData.find((s) => s.name === reactionName)
      if (service && service.reactions) {
        const reaction = service.reactions.find((a) => a.serviceId === reactionId)
        return reaction ? reaction.name : ''
      }
      return ''
    },
    toggleButton (event) {
      event.stopPropagation()
      this.widget.isActive = !this.widget.isActive
    },
    async onDeleteWidget () {
      try {
        const apiUrl = process.env.SERVER_URL + '/users/DeleteArea'
        const token = localStorage.getItem('userToken')
        const headers = {'Authorization': `Bearer ${token}`}
        await axios.post(apiUrl, { areaId: this.widget.Id }, { headers })
        this.$emit('areaDeleted')
      } catch (error) {
        console.error('Error posting area removal:', error)
      }
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2%;
}
.widget {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 60%;
  height: 100px;
  background-color: white;
  border: 2px solid rgb(174, 174, 174);
  border-radius: 20px;
  box-shadow: 3px 5px 5px grey;
}
.image {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}
.first-logo {
  margin-left: 150px;
  margin-right: 20px;
  height: 80%;
}
.second-logo {
  height: 80%;
  margin-right: 20px;
}
.arrow {
  margin-left: 150px;
  margin-right: 125px;
  height: 80%;
}
.tooltip {
  position: absolute;
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 5px;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}
.bin {
  padding-left: 40px;
  padding-top: 10px;
}
</style>
