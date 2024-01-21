<template>
  <div>
    <header class="header">
      <img class="area-logo" src="../assets/area_logo.png" alt="Logo area">
    </header>
    <div class="apk-page">
      <a :href="apkDownloadLink" class="download-link">Télécharger l'APK</a>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      apkDownloadLink: process.env.SERVER_URL + '/mobile-apk'
    }
  }
}
</script>

<style scoped>
.apk-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}
.download-link {
  color: black;
  text-decoration: none;
  margin-bottom: 10%;
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
