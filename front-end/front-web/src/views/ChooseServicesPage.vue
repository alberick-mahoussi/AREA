<template>
  <div class="services-page">
    <Header/>
    <div class="top">
      <router-link to="/create">
        <button class="back">Back</button>
      </router-link>
      <div class="select">Choose a service</div>
    </div>
    <div class="content">
      <input type="text" v-model="searchQuery" class="search-bar" placeholder="Search service"/>
      <div class="services-row" v-for="(row, rowIndex) in serviceRows" :key="rowIndex">
        <div v-for="(service, serviceIndex) in row" :key="serviceIndex" class="router-link" @click="handleServiceClick(service.serviceId)">
          <div class="square-button">
            <img :src="service.picture" alt="Service Image" class="service-image"/>
            <div class="button-label">{{ service.name }}</div>
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
  name: 'Service',
  components: {
    Header
  },
  data () {
    return {
      searchQuery: '',
      servicesToHide: []
    }
  },
  async created () {
    try {
      const apiUrl = process.env.SERVER_URL + '/users/ListServiceDiseabled'
      const token = localStorage.getItem('userToken')
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      this.servicesToHide = response.data
      this.addServicesToHide()
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  },
  computed: {
    services () {
      return this.$store.state.servicesData.server.services
    },
    servicesToDisplay () {
      return this.services
        .filter((service) => !this.servicesToHide.includes(service.name))
    },
    filteredServices () {
      const query = this.searchQuery.toLowerCase()
      return this.servicesToDisplay
        .filter((service) => service.name.toLowerCase().includes(query))
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
    addServicesToHide () {
      const services = this.$store.state.servicesData.server.services
      if (this.$store.state.choice === 'action') {
        this.servicesToHide = this.servicesToHide.concat(
          services
            .filter(service => service.actions.length === 0)
            .map(service => service.name)
        )
      } else if (this.$store.state.choice === 'reaction') {
        this.servicesToHide = this.servicesToHide.concat(
          services
            .filter(service => service.reactions.length === 0)
            .map(service => service.name)
        )
      }
    },
    checkAuthentication (service) {
      return service.authentification === false
    },
    async handleServiceClick (serviceIndex) {
      localStorage.setItem('serviceIndex', serviceIndex)
      const service = this.services[serviceIndex]
      if (this.checkAuthentication(service)) {
        this.$router.push('/actions/' + serviceIndex)
      }
      try {
        const token = localStorage.getItem('userToken')
        const url = process.env.SERVER_URL + '/users/AuthenticatorChecker'
        const name = service.name
        const headers = {'Authorization': `Bearer ${token}`}
        const response = await axios.post(url, { name: name }, { headers })
        const isAuthenticated = response.data.authentification === true
        if (isAuthenticated) {
          this.$router.push('/actions/' + serviceIndex)
        } else {
          switch (service.name) {
            case 'Github':
              this.githubConnect()
              break
            case 'Gitlab':
              this.gitlabConnect()
              break
            case 'Outlook':
              this.OutlookConnect()
              break
            case 'Gmail':
              this.connectGoogle()
              break
            case 'Google Calendar':
              this.connectGoogle()
              break
            case 'Notion':
              this.notionConnect()
              break
            case 'Discord':
              this.DiscordConnect()
              break
            case 'Spotify':
              this.SpotifyConnect()
              break
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      }
    },
    clearCookies () {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
      })
    },
    async githubConnect () {
      this.clearCookies()
      const id = process.env.GITHUB_CLIENT_ID
      const redirecturl = process.env.GITHUB_CALLBACK
      const scope = 'notifications user repo:status public_repo read:org project repo admin:repo_hook admin:org_hook'
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${id}&redirect_uri=${redirecturl}&scope=${scope}&prompt=login`
      window.location.href = authUrl
    },
    async gitlabConnect () {
      this.clearCookies()
      const id = process.env.GITLAB_CLIENT_ID
      const redirecturl = process.env.GITLAB_CALLBACK
      const scope = 'api read_user read_repository write_repository read_registry write_registry read_observability write_observability profile email'
      const authUrl = `https://gitlab.com/oauth/authorize?client_id=${id}&redirect_uri=${redirecturl}&response_type=code&scope=${scope}&prompt=login`
      window.location.href = authUrl
    },
    async OutlookConnect () {
      this.clearCookies()

      const ClientID = process.env.MICROSOFT_CLIENT_ID
      const redirectUrl = process.env.MICROSOFT_CALLBACK_AUTH
      const endpoint = 'https://login.microsoftonline.com/901cb4ca-b862-4029-9306-e5cd0f6d9f86/oauth2/v2.0/authorize'
      const scope = 'user.read calendars.readWrite contacts.readWrite mail.Read mail.readWrite mail.Send'
      const authUrl = `${endpoint}?client_id=${ClientID}&redirect_uri=${redirectUrl}&response_type=code&scope=${encodeURIComponent(scope)}`
      window.location.href = authUrl
    },
    connectGoogle () {
      this.clearCookies()
      const scope = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar.events https://mail.google.com/ https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.events.owned'
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=973428460281-p0ei044cjjulfptp592b1s8fv16ah1pn.apps.googleusercontent.com&redirect_uri=http://localhost:8081/gmail&response_type=code&scope=${scope}&prompt=login`
      window.location.href = authUrl
    },
    async notionConnect () {
      this.clearCookies()
      const authUrl = process.env.NOTION_AUTH_URL
      window.location.href = authUrl
    },
    async SpotifyConnect () {
      this.clearCookies()
      const clientid = process.env.SPOTIFY_CLIENT_ID
      const url = process.env.SPOTIFY_AUTH_URL
      const scope = 'user-read-private user-read-email playlist-modify-private playlist-modify-public'
      const authUrl = `${url}?client_id=${clientid}&response_type=code&redirect_uri=http://localhost:8081/spotify&scope=${scope}`
      window.location.href = authUrl
    },
    async DiscordConnect () {
      this.clearCookies()
      const authurl = process.env.DISCORD_AUTH_URL
      window.location.href = authurl
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
  margin-right: 37%;
  font-size: 4rem;
}
.search-bar {
  width: 600px;
  height: 60px;
  border: 1px solid rgb(174 174 174);
  border-radius: 20px;
  font-size: 2rem;
  text-align: center;
}
.content {
  margin-top: 2%;
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
}
.square-button {
  width: 260px;
  height: 230px;
  border: 1px solid rgb(174 174 174);
  border-radius: 5px;
  cursor: pointer;
}
.square-button:hover {
  border: 1px solid black;
}
.router-link {
  text-decoration: none;
  color: black;
  margin-left: 2%;
  margin-right: 2%;
}
.service-image {
  max-width: 50%;
  max-height: 50%;
  border-radius: 5px;
  margin-top: 13%;
  margin-bottom: 9%;
}
.button-label {
  font-size: 1.5rem;
}
</style>
