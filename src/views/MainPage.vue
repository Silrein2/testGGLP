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
    <div v-if="!loading">
      <div ref="responseDiv" class="response-div" v-if="responseBool">
        <div class="content-container">
          <h1>{{ responsePrompt[currentIndex].question }}</h1>

          <div class="button-container">
            <button
              v-if="responsePrompt[currentIndex].leftAnswer"
              @click="responseToResult('Left', responsePrompt[currentIndex].leftAnswer[1])"
              class="decision-button"
              ref="responseBtn"
            >
              Left
            </button>
            <button
              v-if="responsePrompt[currentIndex].middleAnswer"
              @click="responseToResult('Bottom', responsePrompt[currentIndex].middleAnswer[1])"
              class="decision-button"
              ref="responseBtn"
            >
              Bottom
            </button>
            <button
              v-if="responsePrompt[currentIndex].rightAnswer"
              @click="responseToResult('Right', responsePrompt[currentIndex].rightAnswer[1])"
              class="decision-button"
              ref="responseBtn"
            >
              Right
            </button>
          </div>
        </div>
      </div>
    </div>
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

      // responsePrompt: [
      //   {
      //     text: '1st question',
      //     repeatQuestion: false,
      //     repeatText: 'Already been answered',
      //     resultLeft: 'Left Result 1',
      //     resultRight: 'Right Result 1',
      //     resultBottom: 'Bottom Result 1',
      //     questionDone: false //meant to be triggered after user answered the question, then removed from the question pool
      //   },
      //   {
      //     text: '2nd question',
      //     repeatQuestion: false,
      //     repeatText: 'This question is done  ',
      //     resultLeft: 'Left Result 2',
      //     resultRight: 'Right Result 2',
      //     resultBottom: 'Bottom Result 2',
      //     questionDone: false
      //   },
      //   {
      //     text: '3rd question',
      //     repeatQuestion: false,
      //     repeatText: 'You already gave a response to this question',
      //     resultLeft: 'Left Result 3',
      //     resultRight: 'Right Result 3',
      //     resultBottom: 'Bottom Result 3',
      //     questionDone: false
      //   }
      // ],

      //For Firestore
      responsePrompt: [],

      currentIndex: 0,
      responseBool: true,

      entranceX: null,
      entranceY: null,

      exitX: null,
      exitY: null,

      destX: window.windowWidth / 2,
      destY: window.innerHeight * 0.4,

      bottomBool: false,

      currentResult: null,

      loading: true
    }
  },
  mounted() {
    this.getFirestoreVariables()
    this.loading = false

    this.setBackgroundImage()
    this.updateBackgroundSize()

    // this.getFirebaseVariables()

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
