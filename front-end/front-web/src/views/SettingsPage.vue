<template>
  <div class="settings-page">
    <Header/>
    <div class="account-info">
      <span class="title">Account info:</span>
      <div class="container">
        <input class="input username-button" placeholder="Username">
        <input class="input email-button" placeholder="Email">
        <input class="input password-button" placeholder="Password">
      </div>
      <button class="save">Save changes</button>
    </div>
  </div>
</template>

<script>
import Header from '@/components/HeaderArea.vue'

export default {
  name: 'SettingsPage',
  components: {
    Header
  }
}
</script>

<style scoped>
.settings-page {
  height: 100vh;
  background-color: white;
}
.account-info {
  display: flex;
  flex-direction: column;
  margin: auto;
  margin-top: 100px;
  width: 40%;
}
.title {
  font-size: 3rem;
  align-self: flex-start;
}
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.input {
  margin-top: 25px;
  width: 98%;
  height: 40px;
  align-items: left;
  font-size: 1rem;
}
.save {
  width: 100%;
  height: 50px;
  border-radius: 10px;
  border: none;
  margin-top: 20px;
}
</style>
