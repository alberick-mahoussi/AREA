<template>
  <div>
    <header class="header">
      <router-link to="/">
        <button class="area-button"><img class="area-logo" src="../assets/area_logo.png" alt="Back to menu"></button>
      </router-link>
    </header>
  </div>
</template>

<script>
export default {
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
  padding: 3%;
}
.header {
  text-align: left;
  background-color: white;
  box-shadow: 0px 5px 0px rgba(0, 0, 0, 0.1);
}
</style>
