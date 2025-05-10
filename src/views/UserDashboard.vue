<template>
  <div class="dashboard-container">
    <h2>Welcome, {{ username }}</h2>
    <p>Your email: {{ email }}</p>
    <router-link :to="{ name: 'MainPage' }">Go to Main Page</router-link>
    <button @click="logout" class="logout-button">Logout</button>
  </div>
</template>

<script>
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default {
  name: 'UserDashboard',
  data() {
    return {
      email: '',
      username: ''
    }
  },
  created() {
    const storedEmail = localStorage.getItem('userEmail')
    if (storedEmail) {
      this.email = storedEmail
      this.extractUsername(storedEmail)
      console.log(this.username)
    } else {
      this.$router.push('/login') // Redirect if no email found
    }
  },
  methods: {
    async extractUsername(email) {
      try {
        const docRef = doc(db, 'Score', email)
        const docSnap = await getDoc(docRef)

        var tempName = ''

        if (docSnap.exists()) {
          const data = docSnap.data()
          tempName = data.Name
        } else {
          tempName = email.split('@')[0]
        }
      } catch (error) {
        console.error('Error getting document:', error)
      }

      this.username = tempName
    },
    logout() {
      localStorage.removeItem('userEmail')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  text-align: center;
  margin-top: 50px;
}
.logout-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
