<template>
  <div class="mini-game-wrapper">
    <div
      ref="instructionDiv"
      class="instruction-div"
      :style="{ visibility: instructionVisible ? 'visible' : 'hidden' }"
    >
      <h2 class="instruction-text">
        A mini-game will now start. This mini-game helps you identify facial expressions better. A
        picture of an emotion will flash out for 1 second. After that, you need to select the right
        answer. Each correct answer will earn you 5 Empathy Points.
      </h2>
      <button class="ready-button" @click="runInitialProcess">Ready</button>
    </div>

    <div
      ref="miniGameContainer"
      class="mini-game-container"
      :style="{ visibility: !instructionVisible ? 'visible' : 'hidden' }"
    >
      <div class="image-container">
        <img :src="currentImage" alt="Mini Game Image" class="mini-game-image" />
      </div>
      <div class="interaction-container">
        <p class="question-text" v-if="showButtons">What emotion did he show?</p>
        <div v-if="showButtons" class="button-container">
          <button @click="handleEmotion(0)" class="button-emotion">Happy</button>
          <button @click="handleEmotion(1)" class="button-emotion">Angry</button>
          <button @click="handleEmotion(2)" class="button-emotion">Sad</button>
          <button @click="handleEmotion(3)" class="button-emotion">Afraid</button>
          <button @click="handleEmotion(4)" class="button-emotion">Disgust</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    randomImages: {
      type: Array,
      required: true
    },
    defaultImage: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      // defaultImage: neutral,
      // randomImages: this.emotionImages,
      currentImage: '',
      showButtons: false,
      processCount: 0,
      maxProcesses: 5,
      empathyScore: 0,
      instructionVisible: true
    }
  },
  // mounted() {
  //   this.preloadImages()
  // },
  methods: {
    // preloadImages() {
    //   const imagesToPreload = [this.defaultImage, ...this.randomImages]

    //   imagesToPreload.forEach((imageUrl) => {
    //     if (!document.head.querySelector(`link[href="${imageUrl}"]`)) {
    //       const link = document.createElement('link')
    //       link.rel = 'preload'
    //       link.as = 'image'
    //       link.href = imageUrl
    //       document.head.appendChild(link)
    //     }
    //   })
    // },
    runInitialProcess() {
      this.currentImage = this.defaultImage

      this.$emit('startMiniGame')

      this.$refs.instructionDiv.style.transition = 'opacity 2s'
      this.$refs.instructionDiv.style.opacity = 0

      setTimeout(() => {
        this.instructionVisible = false

        this.$refs.miniGameContainer.style.transition = 'opacity 2s'
        this.$refs.miniGameContainer.style.opacity = 1

        setTimeout(() => {
          this.showRandomImage()
        }, 2000) // complete fade in
      }, 2000) // complete fade out
    },
    showRandomImage() {
      const randomIndex = Math.floor(Math.random() * this.randomImages.length)
      this.currentImage = this.randomImages[randomIndex]
      this.currentEmotionIndex = randomIndex

      setTimeout(() => {
        this.currentImage = this.defaultImage
        this.showButtons = true
      }, 1000)
    },
    handleEmotion(selectedIndex) {
      this.showButtons = false

      if (selectedIndex === this.currentEmotionIndex) {
        this.empathyScore = 5
      } else {
        this.empathyScore = 0
      }

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
        }, 3000)
      }
    }
  }
}
</script>

<style scoped>
.mini-game-wrapper {
  position: relative;
}

.instruction-div {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transition: opacity 2s;
}

.instruction-text {
  font-size: 1.5vw;
  text-align: center;
  margin: 20px;
}

.ready-button {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);

  padding: 10px 20px;
  background-color: #4492f6;
  color: white;

  width: 10vw;
  height: auto;

  border: none;
  border-radius: 5px;
  cursor: pointer;

  font-size: 1vw;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.ready-button:hover {
  background-color: #144e98;
}

.mini-game-container {
  opacity: 0;
  transition: opacity 2s; /* Fade in transition */

  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Center content vertically */
}

.image-container {
  top: 25%;
}

.mini-game-image {
  width: 15vw;
  height: auto;
}

.interaction-container {
  position: absolute;
  bottom: 20%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.question-text {
  font-size: 1.25vw;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
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
</style>
