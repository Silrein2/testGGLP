<template>
  <div id="background-container">
    <h1 ref="mainText" class="welcome-text">{{ welcomeText }}</h1>
    <h3 ref="secondaryText" class="secondary-text">
      {{ noticeText }}
    </h3>
    <!-- <div
      v-for="(text, index) in subTexts"
      :key="index"
      style="display: flex; align-items: center; margin-bottom: 10px"
    >
      <button @click="animateText(index)" style="margin-right: 10px">Animate Text</button>
      <p style="color: white" :ref="`subText${index}`">{{ text }}</p>
    </div> -->

    <div ref="responseDiv" class="response-div" v-if="responseBool">
      <div class="content-container">
        <h1>{{ responsePrompt[currentIndex].text }}</h1>
        <h1 v-if="responsePrompt[currentIndex].repeatQuestion">
          {{ responsePrompt[currentIndex].repeatText }}
        </h1>

        <div class="button-container">
          <button
            class="decision-button"
            ref="responseBtn"
            @click="responseToResult(decisionButtons[0].direction)"
          >
            {{ decisionButtons[0].direction }}
          </button>
          <button
            class="decision-button"
            ref="responseBtn"
            @click="responseToResult(decisionButtons[2].direction)"
          >
            {{ decisionButtons[2].direction }}
          </button>
          <button
            class="decision-button"
            ref="responseBtn"
            @click="responseToResult(decisionButtons[1].direction)"
          >
            {{ decisionButtons[1].direction }}
          </button>
        </div>
      </div>
    </div>
    <div ref="resultDiv" class="result-div" @click="resultToResponse()">
      <h1>{{ resultPrompt[currentIndex].text }}</h1>
      <h1 v-if="resultPrompt[currentIndex].repeatResult">
        {{ resultPrompt[currentIndex].repeatText }}
      </h1>
    </div>
  </div>
</template>

<script>
import { gsap } from 'gsap'

export default {
  name: 'App',
  data() {
    return {
      welcomeText: 'Welcome to The Prototype',
      noticeText:
        'Repeated questions and results are meant to be excluded in final product. The question pool are also randomized',

      responsePrompt: [
        { text: '1st question', repeatQuestion: false, repeatText: 'Already been answered' },
        { text: '2nd question', repeatQuestion: false, repeatText: 'This question is done  ' },
        {
          text: '3rd question',
          repeatQuestion: false,
          repeatText: 'You already gave a response to this question'
        }
      ],

      resultPrompt: [
        { text: '1st result', repeatResult: false, repeatText: 'Result has been given' },
        {
          text: '2nd result',
          repeatResult: false,
          repeatText: 'You already know the result to this'
        },
        { text: '3rd result', repeatResult: false, repeatText: 'This is a repeat result' }
      ],

      decisionButtons: [{ direction: 'Left' }, { direction: 'Right' }, { direction: 'Bottom' }],

      currentIndex: 0,
      responseBool: true,
      resultBool: false,

      entranceX: null,
      entranceY: null,

      exitX: null,
      exitY: null,

      destX: window.windowWidth / 2,
      destY: window.innerHeight * 0.4,

      bottomBool: false
    }
  },
  mounted() {
    this.setBackgroundImage()
    this.updateBackgroundSize()

    this.animateTexts()
    this.initResponse()
  },
  methods: {
    animateTexts() {
      gsap.fromTo(
        this.$refs.mainText,
        { x: '10%', y: '-100%', opacity: 0 },
        { x: '10%', y: '10%', opacity: 1, duration: 2, delay: 0 }
      )

      gsap.fromTo(
        this.$refs.secondaryText,
        { x: '10%', y: '-100%', opacity: 0 },
        { x: '10%', y: '20%', opacity: 1, duration: 2, delay: 0 }
      )
    },
    setBackgroundImage() {
      const backgroundElement = document.getElementById('background-container')
      backgroundElement.style.position = 'absolute'
      backgroundElement.style.top = '0'
      backgroundElement.style.left = '0'
      backgroundElement.style.width = '100%'
      backgroundElement.style.display = 'flex'
      backgroundElement.style.transition = 'transform 0.3s'
      backgroundElement.style.overflow = 'hidden'
      backgroundElement.style.cursor = 'pointer'
      backgroundElement.style.backgroundColor = 'blue'

      const beforeElement = document.createElement('div')
      beforeElement.style.content = ''
      beforeElement.style.position = 'absolute'
      beforeElement.style.top = '0'
      beforeElement.style.left = '0'
      beforeElement.style.width = '100%'
      beforeElement.style.paddingTop = '56.25%'
      beforeElement.style.backgroundSize = 'cover'
      beforeElement.style.backgroundPosition = 'center'
      beforeElement.style.backgroundRepeat = 'no-repeat'
      beforeElement.style.zIndex = '-1'
      beforeElement.style.transition = 'transform 2s ease'
      beforeElement.style.transform = 'scale(1)'
      beforeElement.style.transformOrigin = 'bottom center'

      backgroundElement.appendChild(beforeElement)
    },
    updateBackgroundSize() {
      const backgroundContainer = document.getElementById('background-container')
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      const targetAspectRatio = 16 / 9

      let offsetX = 0
      let offsetY = 0

      this.containerHeight = Math.max(windowHeight, windowWidth / targetAspectRatio)
      this.containerWidth = Math.max(windowWidth, this.containerHeight * targetAspectRatio)

      offsetX = (windowWidth - this.containerWidth) / 2
      offsetY = (windowHeight - this.containerHeight) / 2

      backgroundContainer.style.width = `${this.containerWidth}px`
      backgroundContainer.style.height = `${this.containerHeight}px`
      backgroundContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`
    },
    initResponse() {
      gsap.fromTo(
        this.$refs.responseDiv,
        { x: this.destX, y: window.innerHeight, opacity: 0 },
        { y: this.destY, duration: 2, delay: 2, opacity: 1 }
      )

      // const buttons = Array.from(this.$refs.responseBtn)

      // buttons.forEach((btn) => {
      //   gsap.fromTo(
      //     btn,
      //     {
      //       opacity: 0
      //     },
      //     {
      //       opacity: 1,
      //       duration: 0.5,
      //       delay: 4,
      //       ease: 'power2.out'
      //     }
      //   )
      // })
    },
    responseToResult(answerDirection) {
      // const tl = gsap.timeline()

      this.bottomBool = false

      switch (answerDirection) {
        case 'Left':
          this.entranceX = -window.innerWidth
          this.entranceY = window.innerHeight * 0.4

          this.exitX = window.innerWidth
          this.exitY = this.entranceY

          break
        case 'Right':
          this.entranceX = window.innerWidth
          this.entranceY = window.innerHeight * 0.4

          this.exitX = -window.innerWidth
          this.exitY = this.entranceY

          break
        case 'Bottom':
          this.entranceX = this.destX
          this.entranceY = window.innerHeight

          this.exitX = this.entranceX
          this.exitY = -window.innerHeight - 20 * (window.innerHeight / 100)

          this.bottomBool = true

          break

        default:
          break
      }

      this.animateResponseExit()
    },
    animateResponseExit() {
      gsap.to(this.$refs.responseDiv, {
        x: this.exitX,
        y: this.exitY,
        opacity: 0,
        duration: 4,
        delay: 0
      })

      if (this.bottomBool == true) {
        gsap.fromTo(
          this.$refs.resultDiv,
          { x: this.entranceX, y: this.entranceY, opacity: 0 },
          { y: this.destY, duration: 2, delay: 2, opacity: 1 }
        )
      } else {
        gsap.fromTo(
          this.$refs.resultDiv,
          { x: this.entranceX, y: this.entranceY, opacity: 0 },
          { x: this.destX, y: this.destY, duration: 2, delay: 2, opacity: 1 }
        )
      }
    },
    resultToResponse() {
      const tl = gsap.timeline({
        onComplete: () => {
          this.responsePrompt[this.currentIndex].repeatQuestion = true
          this.resultPrompt[this.currentIndex].repeatResult = true

          this.currentIndex = this.getRandomIndex()

          if (this.currentIndex >= this.responsePrompt.length) {
            this.currentIndex = 0
          }

          this.animateResponseEnter()
        }
      })

      tl.to(this.$refs.resultDiv, {
        x: this.exitX,
        y: this.exitY,
        opacity: 0,
        duration: 4
      })
    },
    animateResponseEnter() {
      if (this.bottomBool == true) {
        gsap.fromTo(
          this.$refs.responseDiv,
          { x: this.entranceX, y: this.entranceY, opacity: 0 },
          { y: this.destY, duration: 2, opacity: 1 }
        )
      } else {
        gsap.fromTo(
          this.$refs.responseDiv,
          { x: this.entranceX, y: this.entranceY, opacity: 0 },
          { x: this.destX, y: this.destY, duration: 2, opacity: 1 }
        )
      }
    },
    getRandomIndex() {
      return Math.floor(Math.random() * 3)
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.welcome-text {
  position: absolute;

  top: 10vh;
  left: 10vw;

  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.secondary-text {
  top: 15vh;
  left: 10vw;

  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.response-div {
  position: absolute;

  top: 0vh;
  left: 25vw;

  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  width: 50vw;
  height: 25vh;

  background-color: black;

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 20px;
}

.result-div {
  position: absolute;

  top: 0vh;
  left: 25vw;

  width: 50vw;
  height: 25vh;

  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  opacity: 0;

  background-color: #2c3e50;

  border-radius: 20px;
}

button {
  background-color: white;
  border: none;
  color: blue;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  cursor: pointer;
}

/* Hide the scrollbar */
::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.decision-button {
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 0 10px;
  cursor: pointer;

  width: 5vw;
  height: 5vh;
}

.content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
</style>
