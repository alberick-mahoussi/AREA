<template>
    <div>
      <header class="header">
        <img class="area-logo" src="../../assets/area_logo.png" alt="Logo area">
      </header>
      <div class="github-page">
      </div>
    </div>
  </template>

<script>
import axios from 'axios'
export default {
  async created () {
    const code = this.$route.query.code
    const token = localStorage.getItem('userToken')
    const headers = {'Authorization': `Bearer ${token}`}
    console.log(code)
    try {
      await axios.post('http://localhost:8080/discord/DiscordAuthregister',
        { code }, { headers })
      const serviceIndex = localStorage.getItem('serviceIndex')
      this.$router.push('/actions/' + serviceIndex)
    } catch (error) {
      console.error('Erreur lors de la récupération du jeton d\'accès:', error)
    }
  }
}
</script>

  <style scoped>
  .github-page {
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
