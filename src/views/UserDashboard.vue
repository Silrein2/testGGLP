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
        <h3 class="text-shadow text-tea-cream">Your high score is: {{ highScoreDeterminant() }}</h3>
        <h3 class="text-shadow text-tea-cream">Your last score is: {{ lastScore }}</h3>
      </div>
      <div class="center-content">
        <h2 class="text-shadow text-tea-cream">Select a Story</h2>
        <div class="story-button-container">
          <div v-for="(story, index) in stories" :key="index">
            <button
              @click="goToMainPage(story)"
              class="story-button text-shadow border-radius bg-tea-four font-weight no-border box-shadow margin-element text-tea-cream font-size-button"
            >
              {{ story }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'

export default {
  name: 'UserDashboard',
  data() {
    return {
      email: '',
      username: '',
      timesPlayed: 0,
      highScore: 0,
      lastScore: 0,
      selectedStory: '',
      stories: []
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
    this.fetchStories()
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
          this.lastScore = data.EmpathyScore
        } else {
          tempName = email.split('@')[0]
        }
        this.username = tempName
      } catch (error) {
        console.error('Error getting document:', error)
      }
    },
    async fetchStories() {
      try {
        const querySnapshot = await getDocs(collection(db, 'Story_List'))
        this.stories = querySnapshot.docs.map((doc) => doc.data().Name)
      } catch (error) {
        console.error('Error fetching stories', error)
      }
    },
    logout() {
      const confirmLogout = confirm('Are you sure you want to logout?')
      if (confirmLogout) {
        localStorage.removeItem('userEmail')
        this.$router.push('/login')
      }
    },
    goToMainPage(storyButton) {
      this.selectedStory = storyButton
      this.$router.push({ name: 'MainPage', query: { selectedStory: this.selectedStory } }) // Navigate to Main Page
    },
    highScoreDeterminant() {
      if (this.highScore < -9999) {
        return 'None'
      } else {
        return String(this.highScore)
      }
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

.input-field {
  height: 1.5%;
  padding: 5%;
}

.story-button-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.story-button {
  width: 15vw;
  height: 7.5vh;
  margin: 1%;
}
</style>
