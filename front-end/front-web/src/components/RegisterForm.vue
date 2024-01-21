<template>
  <div class="register-form-container">
    <form class="form" @submit.prevent="submitForm" @keydown="handleEnterKey">
      <input type="username" class="username" v-model="username" @input="onUsernameInput" placeholder="Username">
      <input type="email" class="email" v-model="email" @input="onEmailInput" placeholder="Email">
      <input type="password" class="password" v-model="password" @input="onPasswordInput" placeholder="Password">
      <input type="password" class="confirm-password" v-model="confirmPassword" @input="onPasswordConfirmInput" placeholder="Confirm Password">
      <router-link to="/login">
        <button class="sign-in">You already have an account ? Sign in</button>
      </router-link>
      <div v-if="errorMessage !== null" class="error-message">{{ errorMessage }}</div>
      <button type="submit" class="register-button">Register</button>
      <button class="google-button" @click.prevent="connectGoogle"><img class="google-logo" src="../assets/logo_google.png" alt="Register with google"></button>
      <button class="outlook-button" @click.prevent="connectOutlook"><img class="outlook-logo" src="../assets/logo_outlook.png" alt="Register with outlook"></button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
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
    onUsernameInput (event) {
      this.username = event.target.value
    },
    onEmailInput (event) {
      this.email = event.target.value
    },
    onPasswordInput (event) {
      this.password = event.target.value
    },
    onPasswordConfirmInput (event) {
      this.confirmPassword = event.target.value
    },
    areInputsValid (event) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const isEmailValid = emailRegex.test(this.email.trim())
      if (
        event &&
        (event.target.className === 'google-button' ||
          event.target.className === 'outlook-button')
      ) {
        this.errorMessage = null
        return true
      }
      if (this.username.trim() === '' || this.email.trim() === '' || this.password.trim() === '' || this.confirmPassword.trim() === '') {
        this.errorMessage = 'Please fill in all required fields'
        return false
      }
      if (!isEmailValid) {
        this.errorMessage = 'Please enter a valid email'
        return false
      }
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Error in the password'
        this.password = ''
        this.confirmPassword = ''
        return false
      }
      this.errorMessage = null
      return true
    },
    async submitForm () {
      if (this.areInputsValid()) {
        const apiUrl = process.env.SERVER_URL
        try {
          const response = await axios.post(apiUrl + '/auth/signup', {
            username: this.username,
            email: this.email,
            password: this.password
          })
          const token = response.data.access_token
          localStorage.setItem('userToken', token)
          this.$router.push('/create')
        } catch (error) {
          console.error('Error during connexion', error)
          if (error.response && error.response.status === 401) {
            this.errorMessage = 'Incorrect credentials. Please try again.'
          } else {
            this.errorMessage = 'An error occured during registry.'
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
.register-form-container {
  width: 70%;
  background-color: white;
  padding: 10%;
  border-radius: 20px;
  display: flex;
  align-items: center;
}
.form{
  height: 430px;
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
.register-button {
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
  padding: 1.5%;
  cursor: pointer;
  box-shadow: 3px 5px 5px grey;
}
.register-button:hover, .google-button:hover, .outlook-button:hover {
  border: 1px solid #06A0C1;
}
.sign-in {
  font-size: 0.9rem;
  display: block;
  border: none;
  cursor: pointer;
  background: none;
  border-radius: 6px;
}
.sign-in {
  margin-bottom: 7%;
  margin-top: 6%;
}
.outlook-logo, .google-logo {
  height: 30px;
}
.google-button {
  margin-right: 4%;
}
.error-message {
  color: red;
  margin-top: 6px;
}
</style>
