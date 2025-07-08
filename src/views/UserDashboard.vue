<template>
  <div id="background-container">
    <div class="dashboard-container">
      <div class="info-box">
        <div class="group-one">
          <div class="info-item">
            <div class="initial-circle">
              <span class="initial">{{ username.charAt(0).toUpperCase() }}</span>
            </div>
          </div>
          <div class="greeting-container">
            <span
              >Hello, <span class="username">{{ username }}</span></span
            >
            Ready for your next challenge?
          </div>
        </div>
        <div class="group-two">
          <div class="info-item">
            <div class="stat-games">
              <img :src="gamesIcon" alt="Games Icon" class="stat-icon" />
              <span>Played games</span>
              <div class="stat-box">
                {{ timesPlayed }}
              </div>
            </div>
          </div>
          <div class="info-item">
            <div class="stat-games">
              <img :src="highscoreIcon" alt="Highscore Icon" class="stat-icon" />
              <span>Highscore</span>
              <div class="stat-box">
                {{ highScoreDeterminant() }}
              </div>
            </div>
          </div>
          <div class="info-item">
            <div class="stat-games">
              <img :src="lastscoreIcon" alt="Lastscore Icon" class="stat-icon" />
              <span>Last score</span>
              <div class="stat-box">
                {{ lastScore }}
              </div>
            </div>
          </div>
        </div>
        <div class="info-item">
          <div class="logout-icon-container">
            <img :src="logoutIcon" alt="Logout Icon" class="logout-icon" @click="logout" />
          </div>
        </div>
      </div>
      <!-- <div class="header">
        <h2 class="welcome-message text-shadow text-tea-cream">Welcome, {{ username }}</h2>
        <button
          @click="logout"
          class="logout-button text-shadow border-radius bg-tea-four font-weight no-border box-shadow margin-element text-tea-cream font-size-button"
        >
          Logout
        </button>
      </div> -->
      <div class="stats-content">
        <h1 class="text-shadow">Choose your workplace journey</h1>
        <h3 class="text-shadow">
          Each of these {{ stories.length }} individuals are dealing with a unique workplace
          situation.
        </h3>
        <h3 class="text-shadow">
          Select a character to begin your interactive learning experience.
        </h3>
      </div>
      <div class="center-content">
        <!-- <h2 class="text-shadow text-tea-cream">Select a Story</h2> -->
        <div class="story-button-container">
          <div v-for="(story, index) in stories" :key="index" class="story-button-wrapper">
            <div class="story-box" @click="goToMainPage(story.Name)">
              <div class="difficulty-box" :style="getDifficultyStyles(story.Difficulty)">
                {{ story.Difficulty }}
              </div>
              <div class="character-selection">
                <pre>{{ console.log('Image Head for', story.Name, ':', story.ImageHead) }}</pre>
                <img
                  :src="story.ImageHead || defaultAvatar"
                  alt="Character Head"
                  class="character-image"
                />
                <div class="story-info">{{ story.Name }}</div>
                <div class="story-info">{{ story.Place }}</div>
                <div class="story-info">{{ story.Description }}</div>
                <div class="story-info">
                  <img :src="timerIcon" alt="timer" /> {{ story.ApproxTime.min }} -
                  {{ story.ApproxTime.max }} minutes
                </div>
                <button class="select-button" @click="goToMainPage(story.Name)">
                  Select {{ story.Name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { logoutIcon, gamesIcon, highscoreIcon, lastscoreIcon } from '@/assets/GUI/icons/icons'
import { timerIcon } from '@/assets/GUI/icons/icons'

import { defaultAvatar } from '@/assets/GUI/avatars/avatars'

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
      stories: [],

      logoutIcon: logoutIcon,
      gamesIcon: gamesIcon,
      highscoreIcon: highscoreIcon,
      lastscoreIcon: lastscoreIcon,

      defaultAvatar: defaultAvatar,
      timerIcon: timerIcon
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
        this.stories = querySnapshot.docs.map((doc) => doc.data())
        console.log('Fetched stories:', this.stories)
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
    },
    getDifficultyStyles(difficulty) {
      switch (difficulty) {
        case 'Beginner':
          return {
            color: 'green',
            backgroundColor: '#e0f7e0' // Light green
          }
        case 'Intermediate':
          return {
            color: 'orange',
            backgroundColor: '#ffe0b2' // Light orange
          }
        case 'Advanced':
          return {
            color: 'red',
            backgroundColor: '#ffcccb' // Light red
          }
        default:
          return {
            color: 'black',
            backgroundColor: 'grey'
          }
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
  margin-top: 2%;
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

.story-button-wrapper {
  margin: 1.25%;
}

.story-button {
  width: 15vw;
  height: 30vh;
}

.info-box {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background-color: white;

  border-radius: 8px;
  padding: 20px;
  margin: 2.5% auto;

  width: 60%;
  height: 5%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.group-one {
  width: 30%;
  display: inline-flex;
  align-items: center;
}

.initial-circle-container {
  width: 25%;
}

.greeting-container {
  display: flex;
  flex-direction: column;

  text-align: left;
}

.group-two {
  width: 70%;
  display: flex;
  align-items: center;
}

.info-item {
  flex: 1;
  text-align: left;
  padding: 10px;
}

.info-item h3 {
  margin: 0;

  font-size: 1vw;
}

.username {
  color: #00afef;
  margin: 0;

  font-weight: 700;
}

.info-item p {
  margin: 0;
  font-size: 0.75vw;
}

.initial-circle {
  background-color: #4492f6;
  color: white;
  border-radius: 50%;

  width: 50px;
  height: 50px;

  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: 100;

  margin-right: 10px;
}

.logout-icon-container {
  width: 40px;
  height: 40px;
  border: 1px solid #d9d9d9;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-icon {
  width: 30px;
  height: auto;
}

.stat-games {
  display: flex;
  align-items: center;
  margin-left: 2.5%;
}

.stat-icon {
  width: 30px;
  height: auto;
  margin-right: 5px;
}

.stat-box {
  background-color: #c0c0c0;
  padding: 5px 10px;
  border-radius: 5px;

  margin-left: 5px;
  width: 10%;
}

.story-box {
  width: 15vw;
  height: 35vh;

  background-color: white;
  position: relative;
  border: 1px solid #d9d9d9;
}

.difficulty-box {
  position: absolute;
  top: 2%;
  right: 5%;

  background-color: #f0f0f0;
  padding: 5px;
  border-radius: 30px;
  font-size: 0.7vw;

  width: 30%;
}

.character-selection {
  text-align: center;
  position: relative;
  top: 40%;
  transform: translateY(-40%);
  margin-top: 10px;
}

.character-image {
  width: 5vw;
  height: 5vw;

  border-radius: 50%;
  object-fit: cover;
  display: block;
  margin: 0 auto;
}

.select-button {
  width: 90%;
  height: 7.5%;
  background-color: white;
  color: grey;
  border: 1px solid grey;
  border-radius: 5px;
  cursor: pointer;
  margin: 10px auto;
  padding: 5px;
  display: block;
}

.story-info {
  margin: 1rem 0;
}
</style>
