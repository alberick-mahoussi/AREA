<template>
    <div>
      <header class="header">
        <img class="area-logo" src="../assets/area_logo.png" alt="Logo area">
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
      const response = await axios.post('http://localhost:8080/microsoft/SigninMicrosoft',
        {
          code: mycode
        })
      localStorage.setItem('userToken', response.data.access_token)
      this.$router.push('/create')
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
