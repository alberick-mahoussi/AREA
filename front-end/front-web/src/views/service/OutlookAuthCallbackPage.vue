<template>
    <div>
      <header class="header">
        <img class="area-logo" src="../../assets/area_logo.png" alt="Logo area">
      </header>
      <div class="outlook">
      </div>
    </div>
</template>

<script>
import axios from 'axios'

export default {
  async created () {
    try {
      const mycode = this.$route.query.code
      const token = this.storedValue = localStorage.getItem('userToken')
      console.log(token)
      const headers = {'Authorization': `Bearer ${token}`}
      await axios.post('http://localhost:8080/microsoft/RegisterOutlook',
        {
          code: mycode
        }, { headers })
    } catch (error) {
      console.error(
        "Erreur lors de l'échange du code contre le token :",
        error.message,
        error.response.data.error_description
      )
      throw new Error("Erreur lors de l'échange du code contre le token")
    }
    const serviceIndex = localStorage.getItem('serviceIndex')
    this.$router.push('/actions/' + serviceIndex)
  }
}
</script>

<style scoped>
.outlook {
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
