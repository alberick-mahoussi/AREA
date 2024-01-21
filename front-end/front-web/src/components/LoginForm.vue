<template>
  <div class="login-form-container">
    <form class="form" @submit.prevent="submitForm" @keydown="handleEnterKey">
      <input type="email" class="email" v-model="email" @input="onEmailInput" placeholder="Email">
      <input type="password" class="password" v-model="password" @input="onPasswordInput" placeholder="Password">
      <router-link to="/forgotPassword">
        <button class="forgot-password">Forgot your password ?</button>
      </router-link>
      <router-link to="/register">
        <button class="sign-up">You don't have an account ? Sign up</button>
      </router-link>
      <div v-if="errorMessage !== null" class="error-message">{{ errorMessage }}</div>
      <button type="submit" class="login-button">Login</button>
      <button class="google-button" @click.prevent="connectGoogle"><img class="google-logo" src="../assets/logo_google.png" alt="Connexion with google"></button>
      <button class="outlook-button" @click.prevent="connectOutlook"><img class="outlook-logo" src="../assets/logo_outlook.png" alt="Connexion with outlook"></button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data () {
    return {
      email: '',
      password: '',
      errorMessage: null
    }
  },
  methods: {
    deleteCookies () {
      const cookies = document.cookie.split(';')
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf('=')
        const nomCookie = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        document.cookie = nomCookie + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
      }
    },
    handleEnterKey (event) {
      if (event.key === 'Enter') {
        event.preventDefault()
        this.submitForm()
      }
    },
    onEmailInput (event) {
      this.email = event.target.value
    },
    onPasswordInput (event) {
      this.password = event.target.value
    },
    areInputsValid () {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const isEmailValid = emailRegex.test(this.email.trim())
      if (this.email.trim() === '' || this.password.trim() === '') {
        this.errorMessage = 'Please fill in all required fields'
        return false
      }
      if (!isEmailValid) {
        this.errorMessage = 'Please enter a valid email'
        return false
      }
      this.errorMessage = null
      return true
    },
    async submitForm () {
      if (this.areInputsValid()) {
        const apiUrl = process.env.SERVER_URL
        try {
          const response = await axios.post(apiUrl + '/auth/signin', {
            email: this.email,
            password: this.password
          })
          const token = response.data.access_token
          localStorage.setItem('userToken', token)
          this.$router.push('/create')
        } catch (error) {
          this.password = ''
          console.error('Error during connection', error)
          if (error.response && error.response.status === 401) {
            this.errorMessage = 'Incorrect credentials. Please try again.'
          } else {
            this.errorMessage = 'An error occurred during login.'
          }
        }
      }
    },
    connectGoogle (event) {
      event.preventDefault()
      this.deleteCookies()
      const clientId = process.env.GOOGLE_WEB_ID
      const redirectUri = process.env.GOOGLE_CALLBACK
      const scope = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar.events https://mail.google.com/ https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.events.owned'
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`
      window.location.href = authUrl
    },
    connectOutlook (event) {
      event.preventDefault()
      this.deleteCookies()
      const ClientID = process.env.MICROSOFT_CLIENT_ID
      const redirectUrl = process.env.MICROSOFT_CALLBACK
      const endpoint = 'https://login.microsoftonline.com/901cb4ca-b862-4029-9306-e5cd0f6d9f86/oauth2/v2.0/authorize'
      const scope = 'user.read calendars.readWrite contacts.readWrite mail.Read mail.readWrite mail.Send'
      const authUrl = `${endpoint}?client_id=${ClientID}&redirect_uri=${redirectUrl}&response_type=code&scope=${encodeURIComponent(scope)}`
      window.location.href = authUrl
    }
  }
}
</script>

<style scoped>
.login-form-container {
  width: 70%;
  background-color: white;
  padding: 10%;
  margin: auto;
  border-radius: 20px;
  display: flex;
  align-items: center;
}
.form {
  height: 400px;
}
input {
  width: 100%;
  font-size: 1rem;
  padding: 1%;
  margin-bottom: 7%;
  border: none;
  background-color: transparent;
  border-bottom: 1px solid black;
  transition: border-color 0.2s ease-out;
}
input:focus {
  outline: none;
}
.login-button {
  width: 80%;
  height: 45px;
  font-size: 1rem;
  margin-top: 10%;
  background-color: white;
  border: 2px solid rgb(174, 174, 174);
  border-radius: 20px;
  padding: 1%;
  cursor: pointer;
  box-shadow: 3px 5px 5px grey;
}
.google-button, .outlook-button {
  width: 37%;
  height: 45px;
  margin-top: 5%;
  background-color: white;
  border: 2px solid rgb(174, 174, 174);
  border-radius: 20px;
  padding: 2%;
  cursor: pointer;
  box-shadow: 3px 5px 5px grey;
}
.google-button{
  margin-right: 4%;
}
.login-button:hover, .google-button:hover, .outlook-button:hover {
  border: 1px solid #06A0C1;
}
.forgot-password, .sign-up {
  font-size: 0.9rem;
  display: block;
  border: none;
  cursor: pointer;
  background: none;
  border-radius: 6px;
}
.forgot-password {
    margin-top: 7%;
}
.sign-up {
    margin-bottom: 7%;
    margin-top: 7%;
}
.outlook-logo, .google-logo {
  height: 30px;
}
.email {
  margin-top: 5%;
}
.error-message {
  color: red;
  margin-top: 6px;
}
</style>
