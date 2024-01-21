<template>
  <body>
    <div id="app">
      <router-view/>
    </div>
  </body>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  height: 100vh;
  overflow: hidden;
}
body {
  font-family: roboto;
  text-align: center;
  color: black;
  margin: 0;
  padding: 0;
  background: linear-gradient(45deg, #d8886f, #da4b32, #aa3357, #e40ad9);
  background-size: 400% 400%;
  animation: gradientAnimation 20s infinite;
}
@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
@font-face {
    font-family: roboto;
    src: url('~@/assets/fonts/Roboto-Regular.ttf');
}
</style>
