<template>
  <div>
    <Header/>
    <div class="login-page">
      <div class="content">
        <div class="left">
          <h1>Glad to see<br>you back</h1>
          <h3>Sign in to your account</h3>
        </div>
        <div class="login-form">
          <LoginForm/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoginForm from '@/components/LoginForm.vue'
import Header from '@/components/HeaderWelcome.vue'

export default {
  name: 'LoginPage',
  components: {
    LoginForm,
    Header
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  height: 90vh;
  justify-content: center;
}
.content {
  max-width: 1440px;
  width: 55%;
  display: flex;
  align-items: center;
}
.left {
  text-align: left;
  flex: 1;
}
h1 {
  font-size: 4rem;
  font-weight: normal;
}
h3 {
  font-weight: normal;
}
.login-form {
  flex: 1;
}
</style>
