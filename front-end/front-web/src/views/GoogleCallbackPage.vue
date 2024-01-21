<template>
  <div>
    <header class="header">
      <img class="area-logo" src="../assets/area_logo.png" alt="Logo area">
    </header>
    <div class="google-page"></div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  async created () {
    const code = this.$route.query.code
    const id = process.env.GOOGLE_WEB_ID
    const secret = process.env.GOOGLE_WEB_SECRET
    const url = process.env.GOOGLE_CALLBACK

    try {
      const response = await axios.post('https://oauth2.googleapis.com/token',
        {
          code: code,
          client_id: id,
          client_secret: secret,
          redirect_uri: url,
          grant_type: 'authorization_code'
        }
      )
      const token = response.data.access_token
      try {
        const response = await axios.post('http://localhost:8080/google/SigninGoogle',
          {
            Token: token
          })
        localStorage.setItem('userToken', response.data.access_token)
        this.$router.push('/create')
      } catch (error) {
        console.error('Erreur lors de la récupération du jeton d\'accès:', error)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du jeton d\'accès:', error.data.error)
    }
  }
}
</script>

<style scoped>
.google-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}
.area-logo {
  width: 100px;
  padding: 0.5%;
}
.header {
  text-align: left;
  background-color: white;
  border-bottom: 1px solid;
}
</style>
