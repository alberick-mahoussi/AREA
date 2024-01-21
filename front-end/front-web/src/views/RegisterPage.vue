<template>
  <div>
    <Header/>
    <div class="register-page">
      <div class="content">
        <div class="left">
          <h1>Create your<br>new account</h1>
        </div>
        <div class="register-form">
          <RegisterForm/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RegisterForm from '@/components/RegisterForm.vue'
import Header from '@/components/HeaderWelcome.vue'

export default {
  name: 'RegisterPage',
  components: {
    RegisterForm,
    Header
  }
}
</script>

<style scoped>
.register-page {
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
.register-form {
  flex: 1;
}
</style>
