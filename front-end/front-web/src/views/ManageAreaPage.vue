<template>
  <div class="area-page">
    <Header/>
    <div class="manage-area">
      <div class="title">History of your Areas</div>
      <div v-for="(widget, index) in widgets" :key="index">
        <WidgetManageArea
          :widget="widget"
          @deleteWidget="() => deleteWidget(index)"
          @areaDeleted="fetchAreas"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/HeaderArea.vue'
import WidgetManageArea from '@/components/WidgetManageArea.vue'
import axios from 'axios'

export default {
  name: 'ManageAreaPage',
  components: {
    Header,
    WidgetManageArea
  },
  data () {
    return {
      temp: []
    }
  },
  computed: {
    widgets () {
      if (this.temp.areas !== undefined) {
        return this.temp.areas
      }
      return []
    }
  },
  methods: {
    deleteWidget (index) {
      this.$store.commit('deleteFromHistory', index)
    },
    async fetchAreas () {
      try {
        const apiUrl = process.env.SERVER_URL + '/users/UserArea'
        const token = localStorage.getItem('userToken')
        const response = await axios.get(apiUrl, { headers: { Authorization: `Bearer ${token}` } })
        this.temp = response.data
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
  },
  async created () {
    await this.fetchAreas()
  }
}
</script>

<style scoped>
.area-page {
  height: 100vh;
  background-color: white;
  overflow-y: auto;
}
.title {
  font-size: 4rem;
  margin-top: 4%;
  margin-bottom: 4%;
}
.manage-area {
  max-height: calc(100vh - Xpx);
  overflow-y: auto;
  padding-bottom: 30px;
}
</style>
