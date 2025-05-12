<template>
  <div id="background-container">
    <div class="dashboard-container">
      <div class="header">
        <h2 class="welcome-message text-shadow text-tea-cream">Welcome, {{ username }}</h2>
        <button
          @click="logout"
          class="logout-button text-shadow border-radius bg-tea-four font-weight no-border box-shadow margin-element text-tea-cream font-size-button"
        >
          Logout
        </button>
      </div>
      <div class="stats-content">
        <h3 class="text-shadow text-tea-cream">You have played the game {{ timesPlayed }} times</h3>
        <h3 class="text-shadow text-tea-cream">Your high score is: {{ highScore }}</h3>
      </div>
      <div class="center-content">
        <!-- <p>Your email: {{ email }}</p> -->
        <!-- <router-link :to="{ name: 'MainPage' }" class="main-page-link text-tea-cream text-shadow"
          >Go to Main Page</router-link
        > -->
        <button
          @click="goToMainPage"
          class="main-page-button text-shadow border-radius bg-tea-four font-weight no-border box-shadow margin-element text-tea-cream font-size-button"
        >
          Prototype
        </button>
      </div>
    </div>
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
      username: '',
      timesPlayed: 0,
      highScore: 0
    }
  },
  created() {
    const storedEmail = localStorage.getItem('userEmail')
    if (storedEmail) {
      this.email = storedEmail
      this.extractUsername(storedEmail)
    } else {
      this.$router.push('/login') // Redirect if no email found
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
    async extractUsername(email) {
      try {
        const docRef = doc(db, 'Score', email)
        const docSnap = await getDoc(docRef)

        let tempName = ''

        if (docSnap.exists()) {
          const data = docSnap.data()
          tempName = data.Name
          this.timesPlayed = data.TimesPlayed
          this.highScore = data.HighScore
        } else {
          tempName = email.split('@')[0]
        }
        this.username = tempName
      } catch (error) {
        console.error('Error getting document:', error)
      }
    },
    logout() {
      const confirmLogout = confirm('Are you sure you want to logout?')
      if (confirmLogout) {
        localStorage.removeItem('userEmail')
        this.$router.push('/login')
      }
    },
    goToMainPage() {
      this.$router.push({ name: 'MainPage' }) // Navigate to Main Page
    }
  }
}
</script>

<style scoped>
#background-container {
  position: relative;
  height: 100vh;
}

.dashboard-container {
  text-align: center;
  position: relative;
  width: 100vw;
}

.header {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
}

.welcome-message {
  margin-right: 25px;
}

.logout-button {
  padding: 10px 20px;
  cursor: pointer;
}

.stats-content {
  margin-top: 10%;
}

.center-content {
  margin-top: 5%;
}

.main-page-link {
  display: inline-block;
  margin-top: 20px;
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
