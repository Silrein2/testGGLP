<template>
  <div class="mini-game-container">
    <img :src="currentImage" alt="Mini Game Image" class="mini-game-image" />
    <div v-if="showButtons" class="button-container">
      <button @click="handleEmotion('Happy')">Happy</button>
      <button @click="handleEmotion('Angry')">Angry</button>
      <button @click="handleEmotion('Sad')">Sad</button>
      <button @click="handleEmotion('Afraid')">Afraid</button>
      <button @click="handleEmotion('Disgust')">Disgust</button>
    </div>
  </div>
</template>

<script>
import { happy, angry, sad, afraid, disgust, neutral } from '@/assets/MiniGame/emotionImages.js'

export default {
  data() {
    return {
      defaultImage: neutral,
      randomImages: [happy, angry, sad, afraid, disgust],
      currentImage: '',
      showButtons: false,
      processCount: 0, // Track the number of times the process has run
      maxProcesses: 5 // Total number of processes to run
    }
  },
  mounted() {
    this.startMiniGame()
  },
  methods: {
    startMiniGame() {
      this.currentImage = this.defaultImage
      this.processCount = 0 // Reset the process count
      this.showButtons = false // Hide buttons initially
      this.runInitialProcess()
    },
    runInitialProcess() {
      this.currentImage = this.defaultImage

      setTimeout(() => {
        this.showRandomImage()
      }, 3000) // Show default image for 3 seconds
    },
    showRandomImage() {
      const randomIndex = Math.floor(Math.random() * this.randomImages.length)
      this.currentImage = this.randomImages[randomIndex]

      setTimeout(() => {
        this.currentImage = this.defaultImage
        this.showButtons = true // Show buttons after displaying the random image
      }, 500) // Show random image for 0.5 seconds
    },
    handleEmotion(emotion) {
      console.log(`Selected Emotion: ${emotion}`)

      this.showButtons = false // Hide buttons immediately after a click

      if (this.processCount < this.maxProcesses) {
        this.processCount++ // Increment the process count

        if (this.processCount === this.maxProcesses) {
          // If this is the last click, call responseToResult in MainPage
          this.$emit('finishMiniGame', 'Bottom', 'You have finished the mini-game')
        } else {
          this.runNextProcess()
        }
      }
    },
    runNextProcess() {
      if (this.processCount < this.maxProcesses) {
        this.currentImage = this.defaultImage

        setTimeout(() => {
          this.showRandomImage()
        }, 3000) // Show default image for 3 seconds
      }
    }
  }
}
</script>

<style scoped>
.mini-game-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  height: 100%;
}

.mini-game-image {
  width: 15vw; /* Adjust size as needed */
  height: auto;
  margin-bottom: 20px;
}

.button-container {
  display: flex;
  gap: 10px;
}
</style>
