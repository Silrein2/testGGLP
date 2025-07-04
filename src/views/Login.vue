<template>
  <div id="background-container" class="login-wrapper" @click="showLogin">
    <img v-if="!loginVisible" :src="mastheadImage" alt="Masthead" class="masthead-image" />
    <div
      v-if="loginVisible && !showUsernameInput"
      class="login-container font-weight bg-white box-shadow"
    >
      <img :src="mastheadImage" alt="Masthead" class="masthead-image-login" />
      <h2 class="login-text-color text-shadow font-size-label">Welcome to AKPK Ceria</h2>
      <div class="form-content">
        <label for="email" class="login-text-color text-shadow font-size-form"
          >Sign in to your account</label
        >
        <input
          type="email"
          v-model="email"
          placeholder="Email address"
          class="bg-white no-border box-shadow font-weight font-size-form input-field"
        />
        <button
          @click="checkEmail"
          class="login-button text-shadow border-radius-light login-button-blue font-weight no-border box-shadow margin-element text-white font-size-form"
          v-if="!showUsernameInput"
        >
          Login
        </button>
      </div>
    </div>
    <div
      v-if="loginVisible && showUsernameInput"
      class="login-container font-weight bg-white box-shadow"
    >
      <div class="form-content-register">
        <div class="text-group">
          <h2 for="username" class="login-text-color text-shadow font-size-label">
            Let's get acquainted
          </h2>
          <h4 for="username" class="login-text-color text-shadow font-size-form">
            As this is your first login, what name should we use to address you?
          </h4>
        </div>
        <div class="register-container register-box-color border-radius-light">
          <h1 class="text-white text-shadow">Hello</h1>
          <h3 class="text-white text-shadow">My name is</h3>
          <input
            type="text"
            v-model="username"
            placeholder="Username"
            class="border-radius-light bg-white no-border box-shadow font-weight font-size-form input-field"
          />
        </div>
        <button
          @click="registerUser"
          class="register-button text-shadow border-radius-light login-button-blue font-weight no-border box-shadow margin-element text-white font-size-form"
        >
          Register
        </button>
        <button
          @click="showUsernameInput = false"
          class="go-back-button text-shadow border-radius-light bg-white login-text-color font-weight box-shadow margin-element font-size-form"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { mastheadImage } from '@/assets/GUI/backgroundGui'

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      username: '',
      showUsernameInput: false,
      loginVisible: false,
      mastheadImage: mastheadImage
    }
  },
  mounted() {
    this.$setBackgroundImage()
    this.$updateBackgroundSize()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.$updateBackgroundSize)
  },
  methods: {
    showLogin() {
      this.loginVisible = true
    },
    async checkEmail() {
      if (this.email === '') {
        alert('Please enter your email.')
        return
      }

      // Regex for basic email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!emailPattern.test(this.email)) {
        alert('Please enter a valid email address.')
        return
      }

      const docRef = doc(db, 'Score', this.email)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        localStorage.setItem('userEmail', this.email.trim()) // local storage
        this.$router.push({ name: 'UserDashboardPage' })
      } else {
        alert('Since it is your first time logging in, what should we call you?')
        this.showUsernameInput = true // First-time user
      }
    },
    async registerUser() {
      if (this.username === '') {
        alert('Please enter your username.')
        return
      }

      const docRef = doc(db, 'Score', this.email)
      await setDoc(docRef, {
        Name: this.username,
        CareScore: 0,
        RespectScore: 0,
        UnderstandingScore: 0,
        EmpathyScore: 0,
        HighScore: -10000,
        TimesPlayed: 0
      })

      alert('Registration successful! Redirecting to main page...')
      this.$router.push({ name: 'UserDashboardPage' })
    }
  }
}
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
}

.masthead-image {
  max-width: 100%;
  max-height: 100%;
  position: absolute;
  z-index: 1;
}

.masthead-image-login {
  max-width: 100%;
  max-height: 50%;
  margin-bottom: 1.5%;
  display: block;
}

.login-container {
  padding: 20px;
  border-radius: 8px;
  width: 25vw;
  height: 45vh;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.form-content {
  margin: 1.5% 0;
  padding-left: 10%;
  padding-right: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-content-register {
  padding-left: 10%;
  padding-right: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.text-group {
  margin-bottom: 0.1rem;
}

.margin-element {
  margin-top: 2.5%;
}

.input-field {
  height: 1.5%;
  padding: 5%;
  text-align: center;
  color: #163760;
}

.login-button {
  width: 40%;
}

.register-container {
  width: 75%;
  height: 50%;
  margin: 0 auto;
}

.go-back-button {
  width: 40%;
}
</style>
