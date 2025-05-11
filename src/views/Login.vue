<template>
  <div id="background-container" class="login-wrapper">
    <div class="login-container font-weight bg-tea-one">
      <h2 class="text-tea-cream text-shadow font-size-title">User Login</h2>
      <div class="form-content">
        <label for="email" class="text-tea-cream text-shadow font-size-label">Email</label>
        <input
          type="email"
          v-model="email"
          placeholder="Enter your email"
          class="border-radius bg-tea-cream no-border box-shadow font-weight font-size-form input-field"
        />

        <button
          @click="checkEmail"
          class="login-button text-shadow border-radius bg-tea-four font-weight no-border box-shadow margin-element text-tea-cream font-size-button"
          v-if="!showUsernameInput"
        >
          Login
        </button>
      </div>
      <div v-if="showUsernameInput" class="form-content">
        <label for="username" class="text-tea-cream text-shadow font-size-label">Username</label>
        <input
          type="text"
          v-model="username"
          placeholder="Enter your username"
          class="border-radius bg-tea-cream no-border box-shadow font-weight font-size-form input-field"
        />
        <button
          @click="registerUser"
          class="register-button text-shadow border-radius bg-tea-four font-weight no-border box-shadow margin-element text-tea-cream font-size-button"
        >
          Register
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      username: '',
      showUsernameInput: false
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
        HighScore: 0,
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
}

.login-container {
  padding: 20px;
  border-radius: 8px;

  width: 50vw;
  height: 45vh;
}

.form-content {
  margin: 2.5% 0;
  padding-left: 25%;
  padding-right: 25%;

  display: flex;
  flex-direction: column;
}

.margin-element {
  margin-top: 2.5%;
}

.font-weight {
  font-weight: 600;
}

.font-size-form {
  font-size: 1vw;
}

.font-size-label {
  font-size: 1.5vw;
}

.font-size-button {
  font-size: 1.25vw;
}

.font-size-title {
  font-size: 1.75vw;
}

.input-field {
  height: 1.5%;
  padding: 5%;
}
</style>
