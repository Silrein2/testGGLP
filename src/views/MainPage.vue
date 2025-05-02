<template>
  <div id="background-container">
    <button class="dashboard-button decision-button" @click="toDashboard()">Dashboard</button>

    <!-- <div v-if="responsePrompt2.length > 0">
      <h1 ref="mainText" class="welcome-text">
        Question num 1: {{ responsePrompt2[0].questionNum }}
      </h1>
      <h3 ref="secondaryText" class="secondary-text">
        Left: {{ responsePrompt2[0].leftAnswer[0] }} + " " + {{ responsePrompt2[0].leftAnswer[1] }}
        <br />
        Right: {{ responsePrompt2[0].rightAnswer[0] }} + " " +
        {{ responsePrompt2[0].rightAnswer[1] }}
        <br />
        <span v-if="responsePrompt2[0].middleAnswer != null"
          >Middle: {{ responsePrompt2[0].middleAnswer[0] }} + " " +
          {{ responsePrompt2[0].middleAnswer[1] }}
        </span>
      </h3>
    </div> -->

    <div ref="titleDiv" class="response-div" @click="animateTitleExit">
      <h1>Title</h1>
    </div>

    <!-- <div v-if="!loading"> -->
    <div ref="responseDiv" class="response-div" v-if="responseBool">
      <div class="content-container">
        <h1>{{ responsePrompt[currentIndex].question }}</h1>

        <div class="button-container">
          <button
            v-if="responsePrompt[currentIndex].leftAnswer"
            @click="responseToResult('Left', responsePrompt[currentIndex].leftAnswer['Result'])"
            class="button-decision"
            ref="responseBtn"
          >
            {{ responsePrompt[currentIndex].leftAnswer['Desc'] }}
          </button>
          <button
            v-if="responsePrompt[currentIndex].middleAnswer"
            @click="responseToResult('Bottom', responsePrompt[currentIndex].middleAnswer['Result'])"
            class="button-decision"
            ref="responseBtn"
          >
            {{ responsePrompt[currentIndex].middleAnswer['Desc'] }}
          </button>
          <button
            v-if="responsePrompt[currentIndex].rightAnswer"
            @click="responseToResult('Right', responsePrompt[currentIndex].rightAnswer['Result'])"
            class="button-decision"
            ref="responseBtn"
          >
            {{ responsePrompt[currentIndex].rightAnswer['Desc'] }}
          </button>
        </div>
      </div>
    </div>
    <!-- </div> -->
    <div ref="resultDiv" class="result-div" @click="resultToResponse()">
      <h1>{{ currentResult }}</h1>
    </div>
  </div>
</template>

<script>
import { gsap } from 'gsap'

//Realtime Database references
import { ref, onValue } from 'firebase/database'
import { database } from '@/firebase'

import { db } from '@/firebase'
import { collection, onSnapshot } from 'firebase/firestore'

export default {
  name: 'App',
  data() {
    return {
      // welcomeText: 'Main Page',
      // noticeText:
      //   'Repeated questions and results are meant to be excluded in final product. The question pool are also randomized',

      //For Firestore
      responsePrompt: [],

      currentIndex: 0,
      responseBool: false,

      entranceX: null,
      entranceY: null,

      exitX: null,
      exitY: null,

      destX: window.windowWidth / 2,
      destY: window.innerHeight * 0.35,

      bottomBool: false,

      currentResult: null,

      titleButtonBool: false

      // loading: true
    }
  },
  mounted() {
    this.getFirestoreVariables()
    // this.loading = false

    this.setBackgroundImage()
    this.updateBackgroundSize()

    // this.getFirebaseVariables()

    // this.animateTexts()
    // this.initResponse()
  },
  methods: {
    // animateTexts() {
    //   gsap.fromTo(
    //     this.$refs.mainText,
    //     { x: '10%', y: '-100%', opacity: 0 },
    //     { x: '10%', y: '10%', opacity: 1, duration: 2, delay: 0 }
    //   )

    //   gsap.fromTo(
    //     this.$refs.secondaryText,
    //     { x: '10%', y: '-100%', opacity: 0 },
    //     { x: '10%', y: '20%', opacity: 1, duration: 2, delay: 0 }
    //   )
    // },
    toDashboard() {
      this.$router.push('/dashboard')
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
      backgroundElement.style.backgroundColor = '#4E2E1D'

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
    initTitle() {
      gsap.fromTo(
        this.$refs.titleDiv,
        { x: 0, y: window.innerHeight, opacity: 0 },
        {
          y: this.destY,
          duration: 2,
          delay: 2,
          opacity: 1,
          onComplete: () => {
            this.titleButtonBool = true
          }
        }
      )
    },
    animateTitleExit() {
      if (this.titleButtonBool == true) {
        gsap.to(this.$refs.titleDiv, {
          y: -window.innerHeight,
          opacity: 0,
          duration: 2.5,
          delay: 0,
          onComplete: () => {
            this.initResponse()
          }
        })
      }
    },
    initResponse() {
      this.responseBool = true // Ensure responseDiv will be rendered
      this.$nextTick(() => {
        // Wait until the DOM updates
        if (this.$refs.responseDiv) {
          gsap.fromTo(
            this.$refs.responseDiv,
            { x: this.destX, y: window.innerHeight, opacity: 0 },
            { y: this.destY, duration: 2, delay: 0, opacity: 1 }
          )
        } else {
          console.warn('responseDiv not found for animation.')
        }
      })
    },
    responseToResult(answerDirection, resultString) {
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

      this.currentResult = resultString

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
          this.currentIndex += 1

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
    },
    getFirebaseVariables() {
      const databasePrompt = ref(database, 'responsePrompt')
      onValue(databasePrompt, (snapshot) => {
        this.responsePrompt = Object.values(snapshot.val() || [])
      })
    },
    async getFirestoreVariables() {
      const querySnapshot = await onSnapshot(collection(db, 'Question_Bank'), (snapshot) => {
        const dbLength = snapshot.size

        this.responsePrompt = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            questionNum: doc.id,
            question: data.Question,
            leftAnswer: data.LeftAnswer !== undefined ? data.LeftAnswer : null,
            rightAnswer: data.RightAnswer !== undefined ? data.RightAnswer : null,
            middleAnswer: data.MiddleAnswer !== undefined ? data.MiddleAnswer : null
          }
        })

        console.log(this.responsePrompt)

        if (this.responsePrompt.length === dbLength) {
          this.initTitle()
        }
      })
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
  left: 12.5vw;

  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  width: 75vw;
  height: 35vh;

  background-color: #f1a159;

  display: flex;
  justify-content: center;
  align-items: center;

  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  border-radius: 20px;
}

.result-div {
  position: absolute;

  top: 0vh;
  left: 25vw;

  width: 75vw;
  height: 35vh;

  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  opacity: 0;

  background-color: #f5962c;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  border-radius: 20px;
}

button {
  background-color: #fcdfc2;

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

.button-decision {
  background-color: #fcdfc2;
  border: none;
  color: black;

  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;

  font-size: 16px;
  margin: 0 10px;
  cursor: pointer;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  width: 10vw;
  height: 7.5vh;

  border-radius: 20px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.dashboard-button {
  position: absolute;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 7vw;
  height: 5vh;

  right: 5vw;
  top: 5vh;
}
</style>
