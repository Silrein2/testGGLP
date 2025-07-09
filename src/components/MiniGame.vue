<template>
  <div class="mini-game-container">
    <img :src="currentImage" alt="Mini Game Image" class="mini-game-image" />
    <p class="question-text" v-if="showButtons">What emotion did he show?</p>
    <div v-if="showButtons" class="button-container">
      <button @click="handleEmotion(0)" class="button-emotion">Happy</button>
      <button @click="handleEmotion(1)" class="button-emotion">Angry</button>
      <button @click="handleEmotion(2)" class="button-emotion">Sad</button>
      <button @click="handleEmotion(3)" class="button-emotion">Afraid</button>
      <button @click="handleEmotion(4)" class="button-emotion">Disgust</button>
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
      processCount: 0,
      maxProcesses: 5,
      empathyScore: 0
    }
  },
  mounted() {
    this.preloadImages()
    this.startMiniGame()
  },
  methods: {
    preloadImages() {
      const imagesToPreload = [this.defaultImage, ...this.randomImages]

      imagesToPreload.forEach((imageUrl) => {
        if (!document.head.querySelector(`link[href="${imageUrl}"]`)) {
          const link = document.createElement('link')
          link.rel = 'preload'
          link.as = 'image'
          link.href = imageUrl
          document.head.appendChild(link)
          console.log(`Preloading: ${imageUrl}`)
        }
      })
    },
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
      this.currentEmotionIndex = randomIndex // Store the index of current image

      setTimeout(() => {
        this.currentImage = this.defaultImage
        this.showButtons = true // Show buttons after displaying the random image
      }, 1000) // Show random image for 1 second
    },
    handleEmotion(selectedIndex) {
      console.log(`Selected Emotion Index: ${selectedIndex}`)
      this.showButtons = false // Hide buttons immediately after a click

      // Check if the selected index matches the current image index
      if (selectedIndex === this.currentEmotionIndex) {
        this.empathyScore = 5
      } else {
        this.empathyScore = 0
      }

      // Emit the score immediately to MainPage
      this.$emit('updateScore', this.empathyScore)

      if (this.processCount < this.maxProcesses) {
        this.processCount++

        if (this.processCount === this.maxProcesses) {
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

.button-emotion {
  width: 12.5vw;
  height: 5vh;

  border-radius: 15px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  font-size: 1vw;
  font-weight: 700;

  background-color: #4492f6;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.question-text {
  font-size: 1.25vw;
  font-weight: 700;

  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
</style>
