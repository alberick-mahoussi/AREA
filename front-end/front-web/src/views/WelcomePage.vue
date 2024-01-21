<template>
  <div class="welcome">
    <Header/>
    <img class="area-logo" src="../assets/area_logo.png">
    <h1>Welcome to Area</h1>
    <h2>The customizable workflow who connect all of your networks</h2>
    <router-link to="/login">
      <button class="button">Login</button>
    </router-link>
    <router-link to="/register">
      <button class="button">Register</button>
    </router-link>
  </div>
</template>

<script>
import Header from '@/components/HeaderWelcome.vue'

export default {
  components: {
    Header
  }
}
</script>

<style scoped>
h1 {
  font-weight: normal;
  font-size: 5rem;
  margin-top: 5%;
  margin-bottom: 4%;
}
.button {
  width: 12%;
  margin-top: 6%;
  margin-right: 2%;
  margin-left: 2%;
  background-color: white;
  padding: 1%;
  border: 1px solid rgb(174 174 174);
  border-radius: 20px;
  cursor: pointer;
  font-size: 1.2rem;
}
.area-logo {
  margin-top: 7%;
}
</style>
