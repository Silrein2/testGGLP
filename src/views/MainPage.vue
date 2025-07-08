<template>
  <div id="background-container">
    <!-- <div
      ref="scoreHoverDiv"
      class="score-hover-div box-shadow border-radius bg-tea-three text-shadow text-tea-cream font-weight"
      @mouseenter="showScores = true"
      @mouseleave="showScores = false"
    >
      <div v-if="!showScores">CURRENT SCORE ▼</div>
      <div v-else>
        <p>Care: {{ careScore }}</p>
        <p>Respect: {{ respectScore }}</p>
        <p>Understanding: {{ understandingScore }}</p>
      </div>
    </div> -->

    <div class="score-box">
      <div class="score-group group-one">
        <img :src="empathyIcon" alt="empathy" style="margin-right: 10%" />
        Empathy progress
      </div>
      <div class="score-group group-two">
        <div class="score-item">
          <img :src="careIcon" alt="care" />
          <p>Care</p>
          <p class="score-text">{{ careScore }}</p>
        </div>
        <div class="score-item">
          <img :src="respectIcon" alt="respect" />
          <p>Respect</p>
          <p class="score-text">{{ respectScore }}</p>
        </div>
        <div class="score-item">
          <img :src="understandingIcon" alt="understanding" />
          <p>Understanding</p>
          <p class="score-text">{{ understandingScore }}</p>
        </div>
        <div class="score-item">
          <img :src="scoreIcon" alt="total" />
          <p>Score</p>
          <p class="score-text">{{ totalScore }}</p>
        </div>
      </div>
    </div>

    <div class="back-button-container">
      <div class="back-button" @click="goBack">
        <div class="back-arrow-square">
          <img :src="backArrowIcon" alt="Back" class="back-arrow-icon" />
        </div>
        <!-- <span class="back-button-text">Go back to dashboard</span> -->
      </div>
    </div>

    <div
      ref="titleDiv"
      class="response-div title-div"
      :style="{ visibility: titleDivVisible ? 'visible' : 'hidden' }"
    >
      <h1 class="title-text">{{ initialStory }}</h1>
      <button class="continue-button" @click="animateTitleExit">Continue</button>
    </div>

    <div
      ref="responseDiv"
      class="response-div"
      v-if="responseBool && currentIndex < responsePrompt.length"
    >
      <div class="content-container">
        <div
          v-if="responsePrompt[currentIndex].question === 'This is a Mini-Game'"
          class="mini-game-wrapper"
        >
          <MiniGame @finishMiniGame="responseToResult" />
        </div>

        <div v-else>
          <h1 class="font-size-title">{{ responsePrompt[currentIndex].question }}</h1>
          <div class="button-container">
            <button
              v-if="responsePrompt[currentIndex].leftAnswer"
              @click="responseToResult('Left', responsePrompt[currentIndex].leftAnswer['Result'])"
              class="button-decision left-button-decision"
              ref="responseBtn"
            >
              {{ responsePrompt[currentIndex].leftAnswer['Desc'] }}
            </button>
            <button
              v-if="responsePrompt[currentIndex].middleAnswer"
              @click="
                responseToResult('Bottom', responsePrompt[currentIndex].middleAnswer['Result'])
              "
              class="button-decision middle-button-decision"
              ref="responseBtn"
            >
              {{ responsePrompt[currentIndex].middleAnswer['Desc'] }}
            </button>
            <button
              v-if="responsePrompt[currentIndex].rightAnswer"
              @click="responseToResult('Right', responsePrompt[currentIndex].rightAnswer['Result'])"
              class="button-decision right-button-decision"
              ref="responseBtn"
            >
              {{ responsePrompt[currentIndex].rightAnswer['Desc'] }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      ref="resultDiv"
      class="result-div"
      :style="{ pointerEvents: resultVisible ? 'auto' : 'none' }"
    >
      <h1 class="font-size-title response-result">{{ currentResult }}</h1>
      <div class="response-result-score">
        <h3 class="font-size-button">{{ addedCareString }}</h3>
        <h3 class="font-size-button">{{ addedRespectString }}</h3>
        <h3 class="font-size-button">{{ addedUnderstandingString }}</h3>
      </div>
      <button
        @click="resultToResponse()"
        class="next-button text-shadow border-radius bg-tea-four font-weight no-border box-shadow margin-element text-tea-cream font-size-button"
      >
        NEXT
      </button>
    </div>

    <div
      ref="scoreDiv"
      class="response-div"
      v-if="responseBool && (currentIndex >= responsePrompt.length || currentIndex == null)"
    >
      <div class="score-container">
        <h2>This time, your score is:</h2>
        <p>Care Score: {{ careScore }}</p>
        <p>Respect Score: {{ respectScore }}</p>
        <p>Understanding Score: {{ understandingScore }}</p>
        <p>Total Empathy Score: {{ totalScore }}</p>
        <p>Previous High Score: {{ highScoreDeterminant() }}</p>

        <button @click="saveScoreToFirestore()" class="save-button">Save Score</button>
      </div>
    </div>
  </div>
</template>

<script>
import { gsap } from 'gsap'
import { db } from '@/firebase'
import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore'
import MiniGame from '@/components/MiniGame.vue'

import { backArrowIcon } from '@/assets/GUI/icons/icons'
import {
  empathyIcon,
  careIcon,
  respectIcon,
  understandingIcon,
  scoreIcon
} from '@/assets/GUI/icons/icons'
import { unionGreenIcon, unionRedIcon } from '@/assets/GUI/icons/icons'

export default {
  name: 'MainPage',
  components: {
    MiniGame
  },
  data() {
    return {
      responsePrompt: [],
      currentIndex: 0,
      responseBool: false,
      entranceX: null,
      entranceY: null,
      exitX: null,
      exitY: null,
      destX: window.innerWidth / 2,
      destY: window.innerHeight * 0.25,
      bottomBool: false,
      currentResult: null,
      titleButtonBool: false,
      resultVisible: false,

      careScore: 0,
      respectScore: 0,
      understandingScore: 0,

      totalScore: 0,

      addedCareString: '',
      addedRespectString: '',
      addedUnderstandingString: '',

      userName: '',
      titleDivVisible: false,
      userEmail: '',
      currentHighScore: 0,
      timesPlayed: 0,

      initialStory: '',
      isLinear: false,
      nextQuestionIndex: null,
      showScores: false,

      backArrowIcon: backArrowIcon,

      empathyIcon: empathyIcon,
      careIcon: careIcon,
      respectIcon: respectIcon,
      understandingIcon: understandingIcon,
      scoreIcon: scoreIcon,

      unionGreenIcon: unionGreenIcon,
      unionRedIcon: unionRedIcon
    }
  },
  async beforeCreate() {
    //for checking if user entered URL with valid email or not
    this.userEmail = localStorage.getItem('userEmail') //local storage

    // console.log('Local Storage Email:', localStorage.getItem('userEmail'))
    // console.log('User Email from localStorage:', this.userEmail)

    if (this.userEmail) {
      const docRef = doc(db, 'Score', this.userEmail)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        this.$router.push('/login')
      } else {
        this.getUserDetails(docSnap.data())
      }
    } else {
      this.$router.push('/login')
    }

    this.userEmail = localStorage.getItem('userEmail') //called this back because after declaring docSnap, the userEmail suddenly becomes empty. This is a workaround
  },
  mounted() {
    this.getFirestoreVariables()
    this.$setBackgroundImage()
    this.$updateBackgroundSize()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.$updateBackgroundSize)
  },
  methods: {
    getUserDetails(dbData) {
      this.userName = dbData.Name
      this.currentHighScore = dbData.HighScore
      this.timesPlayed = dbData.TimesPlayed
    },
    async getFirestoreVariables() {
      const selectedStory = this.$route.query.selectedStory

      const initialStoryDocRef = doc(db, 'Story_List', `${selectedStory}_Question_Bank`)
      const initialStoryDoc = await getDoc(initialStoryDocRef)

      if (initialStoryDoc.exists()) {
        ;(this.initialStory = initialStoryDoc.data().InitialStory),
          (this.isLinear = initialStoryDoc.data().LinearStory)
      } else {
        console.error('Initial story document not found')
        ;(this.initialStory = selectedStory), (this.isLinear = true)
      }

      await onSnapshot(collection(db, `${selectedStory}_Question_Bank`), (snapshot) => {
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

        // console.log(this.responsePrompt)

        if (this.responsePrompt.length === dbLength) {
          this.initTitle()
          this.titleDivVisible = true
        }
      })
    },
    initTitle() {
      gsap.fromTo(
        this.$refs.titleDiv,
        { x: 0, y: window.innerHeight, opacity: 0 },
        {
          y: 100,
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
      this.responseBool = true // ensure responseDiv will be rendered
      this.$nextTick(() => {
        if (this.$refs.responseDiv) {
          gsap.fromTo(
            this.$refs.responseDiv,
            { x: 0, y: window.innerHeight, opacity: 0 },
            { y: this.destY, duration: 2, delay: 0, opacity: 1 }
          )
        } else {
          console.warn('responseDiv not found for animation.')
        }
      })
    },
    responseToResult(answerDirection, resultString) {
      // console.log('CurrentIndex: ' + this.currentIndex)

      this.bottomBool = false

      if (this.responsePrompt[this.currentIndex].question !== 'This is a Mini-Game') {
        this.scoreTally(answerDirection)
      }

      switch (answerDirection) {
        case 'Left':
          this.entranceX = -window.innerWidth
          this.entranceY = window.innerHeight * 0.25

          this.exitX = window.innerWidth
          this.exitY = this.entranceY

          break
        case 'Right':
          this.entranceX = window.innerWidth
          this.entranceY = window.innerHeight * 0.25

          this.exitX = -window.innerWidth
          this.exitY = this.entranceY

          break
        case 'Bottom':
          this.entranceX = 0
          this.entranceY = window.innerHeight

          this.exitX = this.entranceX
          this.exitY = -window.innerHeight - 20 * (window.innerHeight / 100)

          this.bottomBool = true

          break

        default:
          break
      }

      this.currentResult = resultString

      if (answerDirection === 'Bottom' && resultString === 'You have finished the mini-game') {
        console.log('Mini-game finished:', resultString)
      }

      this.animateResponseExit()
    },
    scoreTally(answerDirection) {
      switch (answerDirection) {
        case 'Left':
          this.addedCareString =
            'Care: ' +
            this.getScoreStatement(
              this.careScore,
              this.responsePrompt[this.currentIndex].leftAnswer['Care'],
              'Care'
            )
          // this.careScore =
          //   this.careScore + this.responsePrompt[this.currentIndex].leftAnswer['Care']

          this.addedRespectString =
            'Respect: ' +
            this.getScoreStatement(
              this.respectScore,
              this.responsePrompt[this.currentIndex].leftAnswer['Respect'],
              'Respect'
            )
          // this.respectScore =
          //   this.respectScore + this.responsePrompt[this.currentIndex].leftAnswer['Respect']

          this.addedUnderstandingString =
            'Understanding: ' +
            this.getScoreStatement(
              this.understandingScore,
              this.responsePrompt[this.currentIndex].leftAnswer['Understanding'],
              'Understanding'
            )
          // this.understandingScore =
          //   this.understandingScore +
          //   this.responsePrompt[this.currentIndex].leftAnswer['Understanding']

          this.nextQuestionIndex = this.responsePrompt[this.currentIndex].leftAnswer['NextQuestion']
          break
        case 'Right':
          this.addedCareString =
            'Care: ' +
            this.getScoreStatement(
              this.careScore,
              this.responsePrompt[this.currentIndex].rightAnswer['Care'],
              'Care'
            )
          // this.careScore =
          //   this.careScore + this.responsePrompt[this.currentIndex].rightAnswer['Care']

          this.addedRespectString =
            'Respect: ' +
            this.getScoreStatement(
              this.respectScore,
              this.responsePrompt[this.currentIndex].rightAnswer['Respect'],
              'Respect'
            )
          // this.respectScore =
          //   this.respectScore + this.responsePrompt[this.currentIndex].rightAnswer['Respect']

          this.addedUnderstandingString =
            'Understanding: ' +
            this.getScoreStatement(
              this.understandingScore,
              this.responsePrompt[this.currentIndex].rightAnswer['Understanding'],
              'Understanding'
            )
          // this.understandingScore =
          //   this.understandingScore +
          //   this.responsePrompt[this.currentIndex].rightAnswer['Understanding']

          this.nextQuestionIndex =
            this.responsePrompt[this.currentIndex].rightAnswer['NextQuestion']
          break
        case 'Bottom':
          this.addedCareString =
            'Care: ' +
            this.getScoreStatement(
              this.careScore,
              this.responsePrompt[this.currentIndex].middleAnswer['Care'],
              'Care'
            )
          // this.careScore =
          //   this.careScore + this.responsePrompt[this.currentIndex].middleAnswer['Care']

          this.addedRespectString =
            'Respect: ' +
            this.getScoreStatement(
              this.respectScore,
              this.responsePrompt[this.currentIndex].middleAnswer['Respect'],
              'Respect'
            )
          // this.respectScore =
          //   this.respectScore + this.responsePrompt[this.currentIndex].middleAnswer['Respect']

          this.addedUnderstandingString =
            'Understanding: ' +
            this.getScoreStatement(
              this.understandingScore,
              this.responsePrompt[this.currentIndex].middleAnswer['Understanding'],
              'Understanding'
            )
          // this.understandingScore =
          //   this.understandingScore +
          //   this.responsePrompt[this.currentIndex].middleAnswer['Understanding']

          this.nextQuestionIndex =
            this.responsePrompt[this.currentIndex].middleAnswer['NextQuestion']
          break
      }

      this.totalScore = this.careScore + this.respectScore + this.understandingScore
    },
    animateResponseExit() {
      gsap.to(this.$refs.responseDiv, {
        x: this.exitX,
        y: this.exitY,
        opacity: 0,
        duration: 4,
        delay: 0
      })

      this.resultVisible = true

      if (this.bottomBool == true) {
        gsap.fromTo(
          this.$refs.resultDiv,
          { x: this.entranceX, y: this.entranceY, opacity: 0 },
          { x: 0, y: this.destY, duration: 2, delay: 2, opacity: 1 }
        )
      } else {
        gsap.fromTo(
          this.$refs.resultDiv,
          { x: this.entranceX, y: this.entranceY, opacity: 0 },
          { x: 0, y: this.destY, duration: 2, delay: 2, opacity: 1 }
        )
      }
    },
    resultToResponse() {
      const tl = gsap.timeline({
        onComplete: () => {
          this.nextStory()
          // console.log(this.currentIndex)

          if (this.currentIndex >= this.responsePrompt.length) {
            this.$nextTick(() => {
              // console.log('score div')
              this.animateScoreDivEnter()
            })
          } else {
            // console.log('response div')
            this.animateResponseEnter()
          }
        }
      })

      tl.to(this.$refs.resultDiv, {
        x: this.exitX,
        y: this.exitY,
        opacity: 0,
        duration: 4,
        onStart: () => {
          this.resultVisible = false // disable click during exit animation
        }
      })
    },
    animateResponseEnter() {
      if (this.bottomBool == true) {
        gsap.fromTo(
          this.$refs.responseDiv,
          { x: this.entranceX, y: this.entranceY, opacity: 0 },
          { x: 0, y: this.destY, duration: 2, opacity: 1 }
        )
      } else {
        gsap.fromTo(
          this.$refs.responseDiv,
          { x: this.entranceX, y: this.entranceY, opacity: 0 },
          { x: 0, y: this.destY, duration: 2, opacity: 1 }
        )
      }
    },
    animateScoreDivEnter() {
      this.timesPlayed++

      if (this.$refs.scoreDiv) {
        gsap.fromTo(
          this.$refs.scoreDiv,
          { x: this.entranceX, y: this.entranceY, opacity: 0 },
          { x: 0, y: this.destY, duration: 2, delay: 0, opacity: 1 }
        )
      } else {
        console.warn('scoreDiv ref not found.  Animation skipped.')
      }
    },
    async saveScoreToFirestore() {
      console.log(this.userEmail)

      try {
        const scoreCollection = collection(db, 'Score')

        if (!this.userEmail) {
          throw new Error('User email is not defined.')
        }

        const scoreDocRef = doc(scoreCollection, this.userEmail)

        let tempHighScore = Math.max(this.totalScore, this.currentHighScore)

        await updateDoc(scoreDocRef, {
          CareScore: this.careScore,
          RespectScore: this.respectScore,
          UnderstandingScore: this.understandingScore,
          EmpathyScore: this.totalScore,
          HighScore: tempHighScore,
          TimesPlayed: this.timesPlayed
        })

        alert('Score is saved to FireStore')
        // window.location.reload()
        this.$router.push('/user-dashboard')
      } catch (error) {
        console.error('Error saving score to Firestore:', error)
      }
    },
    nextStory() {
      if (this.isLinear == true) {
        this.currentIndex += 1
      } else {
        this.currentIndex = this.nextQuestionIndex
        this.nextQuestionIndex = null

        if (this.currentIndex == null) {
          this.currentIndex = this.responsePrompt.length + 1
        }
      }
    },
    getRandomIndex() {
      return Math.floor(Math.random() * 3)
    },
    getScoreStatement(categoryTotal, score, categoryName) {
      let statement = ''

      if (score < 0) {
        statement = ' -' + score * -1
      } else {
        statement = ' +' + score
      }

      switch (categoryName) {
        case 'Care':
          this.careScore = this.careScore + score
          break
        case 'Respect':
          this.respectScore = this.respectScore + score
          break
        case 'Understanding':
          this.understandingScore = this.understandingScore + score
          break
      }

      return statement
    },
    highScoreDeterminant() {
      if (this.currentHighScore < -9999) {
        return 'None'
      } else {
        return String(this.currentHighScore)
      }
    },
    goBack() {
      this.$router.push('/user-dashboard')
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

  display: flex;
  justify-content: center;
  align-items: center;

  top: 0vh;
  left: 12.5vw;

  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  width: 75vw;
  height: 50vh;

  background-color: #f1a159;

  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  border-radius: 20px;
}

.mini-game-wrapper {
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
}

.title-div {
  background-color: white;
  color: black;
  padding: 5%;
  position: relative;

  width: 65vw;
  height: 50vh;

  top: 0vh;
  left: 12vw;
}

.continue-button {
  position: absolute;
  bottom: 5%;
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

.title-text {
  margin: 0;
}
.result-div {
  position: absolute;

  top: 0vh;
  left: 12.5vw;

  width: 75vw;
  height: 50vh;

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

  padding: 10px 20px;
  text-align: center;
  text-decoration: none;

  display: inline-block;
  font-size: 16px;
  cursor: pointer;
}

::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

.button-container {
  margin-top: 20px;
}

.button-decision {
  background-color: #fcdfc2;
  border: none;
  color: black;

  font-weight: 600;

  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;

  font-size: 100%;
  margin: 0 10px;
  cursor: pointer;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  width: 17.5vw;
  height: 17.5vh;

  border-radius: 20px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.left-button-decision {
  position: absolute;

  left: -5%;
  top: 35%;
}

.middle-button-decision {
  position: absolute;

  left: 50%;
  transform: translateX(-50%);

  bottom: -5%;
}

.right-button-decision {
  position: absolute;

  right: -5%;
  top: 35%;
}

.content-container {
  /*display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  */

  width: 90%;
  height: 90%;
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

.score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-container input[type='text'] {
  margin-bottom: 10px;
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.score-container .save-button {
  background-color: #fcdfc2;
  color: black;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  font-size: 16px;
  margin: 0 10px;
  cursor: pointer;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  border-radius: 20px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.response-result {
  padding: 1%;
}

.response-result-score {
  margin-top: 5%;
}

.next-button {
  margin-top: 2.5%;
  width: 10vw;
  height: 7.5vh;
}

.score-hover-div {
  position: absolute;
  padding: 10px;

  text-align: center;

  width: 10vw;

  bottom: 10vh;

  left: 50%;
  transform: translateX(-50%);
}

.score-hover-div p {
  margin: 5px 0;
  text-align: left;
}

.back-button-container {
  position: absolute;
  top: 2.5vh;
  left: 10vw;
  display: flex;
  align-items: center;
}

.back-arrow-square {
  width: 50px;
  height: 50px;
  border: 2px solid black;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
}

.back-arrow-icon {
  width: 70%;
  height: auto;
}

.back-button-text {
  font-size: 1rem;
  line-height: 50px;
}

.score-box {
  background-color: white;
  width: 65vw;
  height: 12.5vh;
  position: absolute;
  bottom: 10vh;

  left: 50%;
  transform: translateX(-50%);
  display: flex;

  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.score-group {
  height: 100%;
}

.group-one {
  width: 30%;
  display: flex;
  align-items: center;
  padding-left: 2.5%;
}

.group-one img {
  width: 1.8vw;
}

.group-two {
  width: 70%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding-left: 5%;
  padding-right: 5%;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.score-item img {
  width: 1.8vw;
  height: auto;
}

.score-text {
  font-weight: 900;
}
</style>
