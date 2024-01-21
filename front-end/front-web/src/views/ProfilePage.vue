<template>
  <div class="container" :style="{ 'background': colors.background }">
    <Header/>
    <div class="setting-profile">
      <div class="title" :style="{ 'color': colors.text }">{{ $t('profile') }}</div>
      <div class="profile">
        <div class="avatar-container">
          <img :src="avatarImage" alt="avatar" class="avatar" :style="{ 'border-color': colors.text }"/>
          <!-- <EditButton type="Avatar" @editAvatar="editAvatar"/> -->
        </div>
        <div class="info">
          <div class="info-item" :style="{ 'color': colors.text }">
            <p>{{ $t('email') }}</p>
            <div class="change-container">
              <p>{{ this.email }}</p>
            </div>
          </div>

          <hr class="small-seperate"/>
          <div class="info-item" :style="{ 'color': colors.text }">
            <p>{{ $t('username') }}</p>
            <div class="change-container">
              <p>{{ this.username }}</p>
              <img src="@/assets/modifier.png" alt="Edit Icon" class="edit-icon" @click="openUsernamePopup"/>
            </div>
            <div v-if="showUsernamePopup" class="popup-overlay">
              <div class="popup-content">
                <div class="old-username">
                  <label for="oldUsername">Old username:</label>
                  <p>{{ this.username }}</p>
                </div>
                <div class="new-username">
                  <label for="newUsername">New username:</label>
                  <input type="username" v-model="newUsername" required @keyup.enter="confirmUsernameChange"/>
                </div>
                <div v-if="errorMessage !== null" class="error-message">{{ errorMessage }}</div>
                <button class="confirm" @click="confirmUsernameChange">Confirm</button>
                <span @click="closeUsernamePopup" class="close-popup">&times;</span>
              </div>
            </div>
          </div>

          <hr class="small-seperate"/>
          <div class="info-item" :style="{ 'color': colors.text }">
            <p>{{ $t('password') }}</p>
            <div class="change-container">
              <p>{{ this.password }}</p>
              <img src="@/assets/modifier.png" alt="Edit Icon" class="edit-icon" @click="openPasswordPopup"/>
            </div>
            <div v-if="showPasswordPopup" class="popup-overlay">
              <div class="popup-content">
                <!-- <div class="old-password">
                  <label for="oldPassword">Old password:</label>
                  <input type="password" v-model="oldPassword" required/>
                </div> -->
                <div class="new-password">
                  <label for="newPassword">New password:       </label>
                  <input type="password" v-model="newPassword" required @keyup.enter="confirmPasswordChange"/>
                </div>
                <div class="confirm-password">
                  <label for="confirmNewPassword">Repeat new password:</label>
                  <input type="password" v-model="confirmNewPassword" required @keyup.enter="confirmPasswordChange"/>
                </div>
                <div v-if="errorMessage !== null" class="error-message">{{ errorMessage }}</div>
                <button class="confirm" @click="confirmPasswordChange">Confirm</button>
                <span @click="closePasswordPopup" class="close-popup">&times;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- <hr class="seperate" :style="{ 'border-top': colors.seperateLine }"/>
      <div class="settings">
        <div class="title" :style="{ 'color': colors.text }">{{ $t('settings') }}</div>
        <div class="param-item" :style="{ 'color': colors.text }">
          <p>{{ $t('darkMode') }}</p>
          <button @click.stop="toggleButton" class="toggle-button" :class="{ 'active': isActive }">
            {{ isActive ? 'ON' : 'OFF' }}
          </button>
        </div>
        <hr class="small-seperate"/>
        <div class="param-item" :style="{ 'color': colors.text }">
          <p>{{ $t('language') }}</p>
          <select v-model="selectedLanguage" class="language-selector">
            <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
          </select>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import Header from '@/components/HeaderArea.vue'
import EditButton from '@/components/EditButton.vue'
import { lightModeColors, darkModeColors } from '@/views/darkMode.js'
import { languages } from '@/views/languages.js'
import axios from 'axios'

export default {
  name: 'ProfilePage',
  components: {
    Header,
    EditButton
  },
  data () {
    return {
      email: '',
      username: '',
      password: '●●●●●●●●',
      passwordUser: '',
      avatarImage: require('@/assets/profil.png'),
      isActive: false,
      selectedLanguage: 'English',
      languages: ['English', 'Français', 'Spanish'],
      languageTranslations: languages['English'],
      colors: lightModeColors,
      showPasswordPopup: false,
      showUsernamePopup: false,
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      newUsername: '',
      errorMessage: null
    }
  },
  computed: {
    $t () {
      return (key) => this.languageTranslations[key] || key
    }
  },
  created () {
    this.fetchUserData()
  },
  watch: {
    selectedLanguage (newLang) {
      this.languageTranslations = languages[newLang] || languages['English']
      // TODO: send the new language to the db here
    }
  },
  methods: {
    async fetchUserData () {
      try {
        const apiUrl = process.env.SERVER_URL + '/users/me'
        const token = localStorage.getItem('userToken')
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        this.username = response.data.user.username
        this.email = response.data.user.email
        this.passwordUser = response.data.user.password
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    },
    openPasswordPopup () {
      this.showPasswordPopup = true
    },
    closePasswordPopup () {
      this.newPassword = ''
      this.confirmNewPassword = ''
      this.errorMessage = null
      this.showPasswordPopup = false
    },
    openUsernamePopup () {
      this.showUsernamePopup = true
    },
    closeUsernamePopup () {
      this.newUsername = ''
      this.errorMessage = null
      this.showUsernamePopup = false
    },
    async confirmPasswordChange () {
      if (this.newPassword === '' || this.confirmNewPassword === '') {
        this.errorMessage = 'Please fill in all required fields'
      } else if (this.newPassword !== this.confirmNewPassword) {
        this.errorMessage = 'Error in the password'
        this.newPassword = ''
        this.confirmNewPassword = ''
      } else {
        try {
          const apiUrl = process.env.SERVER_URL + '/users/UpdatePassword'
          const token = localStorage.getItem('userToken')
          const headers = {'Authorization': `Bearer ${token}`}
          await axios.post(apiUrl, { password: this.newPassword }, { headers })
          this.showPasswordPopup = false
        } catch (error) {
          console.error('Error changing password:', error)
        }
      }
    },
    async confirmUsernameChange () {
      if (this.newUsername === '') {
        this.errorMessage = 'Please fill in all required fields'
      } else {
        try {
          const apiUrl = process.env.SERVER_URL + '/users/UpdateUserUsername'
          const token = localStorage.getItem('userToken')
          const headers = {'Authorization': `Bearer ${token}`}
          await axios.post(apiUrl, { username: this.newUsername }, { headers })
          this.fetchUserData()
          this.showUsernamePopup = false
        } catch (error) {
          console.error('Error changing username:', error)
        }
      }
    },
    editAvatar () {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.addEventListener('change', (event) => {
        const file = event.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = () => {
            this.avatarImage = reader.result
            // TODO: send the new pp to the db here
          }
          reader.readAsDataURL(file)
        }
      })
      input.click()
    },
    toggleButton () {
      this.isActive = !this.isActive
      this.colors = this.isActive ? darkModeColors : lightModeColors
    }
  }
}
</script>

<style scoped>
.container {
  height: 100vh;
  overflow-y: auto;
}
.setting-profile {
  margin-top: 3%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.title {
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 2%;
  margin-top: 4%;
}
.profile {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80%;
}
.avatar-container {
  margin-right: 2%;
}
.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
}
.info {
  display: flex;
  flex-direction: column;
  width: 35%;
}
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
}
.change-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.seperate {
  margin-top: 3%;
  width: 40%;
  border-radius: 20px;
}
.small-seperate {
  margin-top: 3%;
  margin-bottom: 3%;
  width: 100%;
}
.settings {
  margin-top: 15px;
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.param-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  width: 100%;
}
.toggle-button {
  width: 6%;
  height: 25px;
  border: 1px solid #ccc;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 75%;
}
.toggle-button.active {
  background-color: #4caf50;
  color: white;
}
.language-selector {
  padding: 5px;
  font-size: 16px;
  cursor: pointer;
}
.edit-icon {
  margin-left: 25px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.popup-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
  width: 100%;
  max-height: 500px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.popup-content input {
  margin-top: 20px;
}
.close-popup {
  position: absolute;
  top: 0.25%;
  right: 1%;
  font-size: 30px;
  cursor: pointer;
}
.confirm {
  margin-top: 20px;
  width: 200px;
  height: 50px;
  font-size: 1.75rem;
  cursor: pointer;
  border: 1px solid rgb(174 174 174);
  border-radius: 20px;
  margin-bottom: 5%;
  background: none;
}
.confirm:hover {
  border: 2px solid black;
}
.old-password {
  margin-top: 8%;
  display: flex;
  flex-direction: column;
}
.old-username {
  margin-top: 15%;
  display: flex;
  flex-direction: column;
}
.new-password {
  margin-top: 20%;
  display: flex;
  flex-direction: column;
}
.new-username {
  margin-top: 20px;
  margin-bottom: 100px;
  display: flex;
  flex-direction: column;
}
.confirm-password {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  margin-bottom: 100px;
}
.error-message {
  color: red;
}
</style>
