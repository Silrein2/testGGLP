<template>
  <div class="login-container">
    <h2 style="color: white">User Login</h2>
    <div class="form-content">
      <label for="email" style="color: white">Email:</label>
      <input type="email" v-model="email" placeholder="Enter your email" />

      <button @click="checkEmail" class="login-button">Login</button>
    </div>
    <div v-if="showUsernameInput" class="form-content">
      <label for="username" style="color: white">Username:</label>
      <input type="text" v-model="username" placeholder="Enter your username" />
      <button @click="registerUser" class="register-button">Register</button>
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
  methods: {
    async checkEmail() {
      if (this.email === '') {
        alert('Please enter your email.')
        return
      }

      const docRef = doc(db, 'Score', this.email)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        localStorage.setItem('userEmail', this.email) //local storage
        this.$router.push({ name: 'UserDashboardPage' })
      } else {
        this.showUsernameInput = true //first time user
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
        TimesPlayed: 0
      })

      alert('Registration successful! Redirecting to main page...')
      this.$router.push({ name: 'UserDashboardPage' })
    }
  }
}
</script>
