<template>
  <div>
    <header class="header">
      <router-link to="/create">
        <button class="area-button"><img class="area-logo" src="../assets/area_logo.png" alt="Back to home page"></button>
      </router-link>
      <div class="navigation">
        <router-link to="/create">
          <button class="navigation-button">Create</button>
        </router-link>
        <router-link to="/manage">
          <button class="navigation-button">History</button>
        </router-link>
        <router-link to="/edit-services">
          <button class="navigation-button">Services</button>
        </router-link>
        <router-link to="/profile">
          <button class="navigation-button">Profile</button>
        </router-link>
      </div>
      <button class="deconnexion-button" @click="logout">Disconnect</button>
    </header>
  </div>
</template>

<script>
export default {
  methods: {
    logout () {
      localStorage.removeItem('userToken')
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.area-button {
  border: none;
  background: none;
  cursor: pointer;
}
.area-logo {
  width: 120px;
  margin-top: 6px;
  padding: 2%;
}
.header {
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  background-color: white;
  box-shadow: 0px 5px 0px rgba(0, 0, 0, 0.1);
}
.deconnexion-button {
  border: none;
  background: none;
  cursor: pointer;
  margin-right: 8px;
}
.navigation {
  width: 420px;
}
.navigation-button {
  border: none;
  background: none;
  padding: 1%;
  cursor: pointer;
  margin: 0 20px;
}
</style>
