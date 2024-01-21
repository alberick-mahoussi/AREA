<template>
    <div>
      <header class="header">
        <img class="area-logo" src="../../assets/area_logo.png" alt="Logo area">
      </header>
      <div class="google-page"></div>
    </div>
  </template>

<script>
import axios from 'axios'

export default {
  async created () {
    const code = this.$route.query.code
    console.log('CODE\n')
    console.log(code)
    const id = process.env.GOOGLE_WEB_ID
    const secret = process.env.GOOGLE_WEB_SECRET
    const url = process.env.GOOGLE_CALLBACK_AUTH
    const token = this.storedValue = localStorage.getItem('userToken')
    const headers = {'Authorization': `Bearer ${token}`}

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
      console.log(token)
      const Token = token
      try {
        await axios.post('http://localhost:8080/google/RegisterGoogle',
          {
            Token
          }, { headers })
      } catch (error) {
        console.error('Erreur lors de la récupération du jeton d\'accès:', error)
      }
      const serviceIndex = localStorage.getItem('serviceIndex')
      this.$router.push('/actions/' + serviceIndex)
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
