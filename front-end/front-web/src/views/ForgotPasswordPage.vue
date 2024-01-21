<template>
  <div>
    <Header/>
    <div class="top">
      <router-link to="/login">
        <button class="back">Back</button>
      </router-link>
      <div class="title">Forgot Password</div>
    </div>
    <div class="forgot-password-container">
      <div class="container">
        <form @submit.prevent="sendEmail">
          <h1>Enter Your Recuperation Email:</h1>
          <div>
            <label for="email">Email:</label>
            <input type="email" id="email" class="input-email" v-model="email" required/>
          </div>
          <div>
            <button type="submit" class="send-email">Send Email</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/HeaderWelcome.vue'

export default {
  name: 'ForgotPassword',
  components: {
    Header
  },
  data () {
    return {
      email: ''
    }
  },
  methods: {
    sendEmail () {
      // faire le call api ici
    }
  }
}
</script>

<style scoped>
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 2rem;
  margin-top: 4%;
}
.title {
  font-size: 3rem;
  margin-right: 40%;
}
.back {
  width: 130px;
  height: 50px;
  margin-left: 100px;
  border: 1px solid rgb(174 174 174);
  border-radius: 20px;
  font-size: 1.5rem;
  cursor: pointer;
}
form {
  display: flex;
  flex-direction: column;
}
label {
  font-size: 2rem;
  margin-bottom: 8px;
}
.input-email {
  padding: 8px;
  font-size: 2rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 50px;
}
.send-email {
  width: 220px;
  height: 55px;
  border: 1px solid rgb(174 174 174);
  border-radius: 20px;
  font-size: 1.5rem;
  cursor: pointer;
}
.container {
  width: 600px;
  height: 300px;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
}
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 130px;
}
h1 {
  margin-bottom: 70px;
}
</style>
