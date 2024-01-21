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
    const token = this.storedValue = localStorage.getItem('userToken')
    const headers = {'Authorization': `Bearer ${token}`}
    try {
      await axios.post(`http://localhost:8080/gitlab/GitlabAuthregister`, { code }, { headers })
      const serviceIndex = localStorage.getItem('serviceIndex')
      this.$router.push('/actions/' + serviceIndex)
    } catch (error) {
      console.error(
        "Erreur lors de l'échange du code contre le token :",
        error.message,
        error.response.data.error_description
      )
      throw new Error("Erreur lors de l'échange du code contre le token")
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
