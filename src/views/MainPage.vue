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
    <div class="score-box" v-if="currentIndex < responsePrompt.length">
      <div class="score-group">
        <div class="group-one">
          <img :src="empathyIcon" alt="empathy" style="margin-right: 10%" />
          Empathy progress
        </div>
        <div class="score-item">
          <div class="union-icon" v-if="unionCare">
            <div class="union-content">
              <img :src="unionGreenIcon" alt="union care" v-if="careGreenBool" />
              <img :src="unionRedIcon" alt="union care" v-if="!careGreenBool" />
              <div class="union-text">{{ unionCare }}</div>
            </div>
          </div>
          <img :src="careIcon" alt="care" />
          <p>Care</p>
          <p class="score-text">{{ careScore }}</p>
        </div>
        <div class="score-item">
          <div class="union-icon" v-if="unionRespect">
            <div class="union-content">
              <img :src="unionGreenIcon" alt="union respect" v-if="respectGreenBool" />
              <img :src="unionRedIcon" alt="union respect" v-if="!respectGreenBool" />
              <div class="union-text">{{ unionRespect }}</div>
            </div>
          </div>
          <img :src="respectIcon" alt="respect" />
          <p>Respect</p>
          <p class="score-text">{{ respectScore }}</p>
        </div>
        <div class="score-item">
          <div class="union-icon" v-if="unionUnderstanding">
            <div class="union-content">
              <img :src="unionGreenIcon" alt="union understanding" v-if="understandingGreenBool" />
              <img :src="unionRedIcon" alt="union understanding" v-if="!understandingGreenBool" />
              <div class="union-text">{{ unionUnderstanding }}</div>
            </div>
          </div>
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

    <div class="back-button-container" v-if="currentIndex < responsePrompt.length">
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
          <MiniGame @finishMiniGame="responseToResult" @updateScore="updateTotalScore" />
        </div>

        <div v-else>
          <h1 class="font-size-title">{{ responsePrompt[currentIndex].question }}</h1>
          <div class="button-container">
            <div class="button-wrapper">
              <button
                v-if="responsePrompt[currentIndex].leftAnswer"
                @click="responseToResult('Left', responsePrompt[currentIndex].leftAnswer['Result'])"
                class="button-decision left-button-decision"
                ref="responseBtn"
              >
                {{ responsePrompt[currentIndex].leftAnswer['Desc'] }}
              </button>
            </div>
            <div class="button-wrapper">
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
            </div>
            <div class="button-wrapper">
              <button
                v-if="responsePrompt[currentIndex].rightAnswer"
                @click="
                  responseToResult('Right', responsePrompt[currentIndex].rightAnswer['Result'])
                "
                class="button-decision right-button-decision"
                ref="responseBtn"
              >
                {{ responsePrompt[currentIndex].rightAnswer['Desc'] }}
              </button>
            </div>
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
      <button @click="resultToResponse()" class="continue-button">Continue</button>
    </div>

    <div
      ref="scoreDiv"
      class="response-div score-div"
      v-if="responseBool && (currentIndex >= responsePrompt.length || currentIndex == null)"
    >
      <div class="score-intro">
        <img :src="congratsIcon" />
        <p style="font-size: 1.75vw; font-weight: 700">Congratulations!</p>
        <p style="font-size: 1.25vw; font-weight: 500">You've completed the assessment</p>
        <p style="font-size: 0.8vw; color: dimgray">Here's your detailed score breakdown</p>
      </div>

      <div class="score-breakdown">
        <div class="care-score-card">
          <div class="score-card-point-wrapper">
            <div class="score-image-group">
              <img :src="careNoBGIcon" />
            </div>

            <div class="score-value-group">
              <span style="font-size: 1vw; font-weight: 700">{{ careScore }} </span>
              <span style="font-size: 0.8vw; color: dimgray">/ {{ maxCareScore }} points</span>
            </div>
          </div>

          <div class="progress-bar-container">
            <span
              style="
                text-align: left;
                width: 100%;
                display: block;
                font-weight: 700;
                margin-bottom: 1.5%;
              "
              >Care</span
            >
            <div class="progress-bar-background">
              <div
                class="progress-bar-foreground"
                :style="{
                  width: (careScore / maxCareScore) * 100 + '%'
                }"
              ></div>
            </div>
          </div>

          <p style="text-align: left; padding-left: 5%; padding-right: 5%; color: #5e5f60">
            Your ability to show compassion and concern for others
          </p>
        </div>

        <div class="respect-score-card">
          <div class="score-card-point-wrapper">
            <div class="score-image-group">
              <img :src="respectNoBGIcon" />
            </div>

            <div class="score-value-group">
              <span style="font-size: 1vw; font-weight: 700">{{ respectScore }} </span
              ><span style="font-size: 0.8vw; color: dimgray">/ {{ maxRespectScore }} points</span>
            </div>
          </div>

          <div class="progress-bar-container">
            <span
              style="
                text-align: left;
                width: 100%;
                display: block;
                font-weight: 700;
                margin-bottom: 1.5%;
              "
              >Respect</span
            >
            <div class="progress-bar-background">
              <div
                class="progress-bar-foreground"
                :style="{
                  width: (respectScore / maxRespectScore) * 100 + '%'
                }"
              ></div>
            </div>
          </div>

          <p style="text-align: left; padding-left: 5%; padding-right: 5%; color: #5e5f60">
            How well you value and honour other’s perspectives
          </p>
        </div>

        <div class="understanding-score-card">
          <div class="score-card-point-wrapper">
            <div class="score-image-group">
              <img :src="understandingNoBGIcon" />
            </div>

            <div class="score-value-group">
              <span style="font-size: 1vw; font-weight: 700">{{ understandingScore }}</span>
              <span style="font-size: 0.8vw; color: dimgray"
                >/ {{ maxUnderstandingScore }} points</span
              >
            </div>
          </div>

          <div class="progress-bar-container">
            <span
              style="
                text-align: left;
                width: 100%;
                display: block;
                font-weight: 700;
                margin-bottom: 1.5%;
              "
              >Understanding</span
            >
            <div class="progress-bar-background">
              <div
                class="progress-bar-foreground"
                :style="{
                  width: (understandingScore / maxUnderstandingScore) * 100 + '%'
                }"
              ></div>
            </div>
          </div>

          <p style="text-align: left; padding-left: 5%; padding-right: 5%; color: #5e5f60">
            Your capacity to comprehend other’s feelings and situations
          </p>
        </div>
      </div>

      <div class="total-score-box">
        <div class="score-group">
          <div class="total-score-group">
            <div class="score-image-group" style="margin-left: 5%">
              <img :src="starIcon" />
            </div>
            <div class="score-text-group" style="margin-left: 1.5%">
              <span style="font-size: 1.25vw; font-weight: 500">Total empathy score</span>
              <span style="font-size: 0.8vw">Your overall empathy assessment result</span>
            </div>
          </div>

          <div class="score-value-group score-value-group-total">
            <span style="font-size: 1.5vw; font-weight: 700">{{ totalScore }} </span>
            <span style="font-size: 1vw">/ {{ totalMaxScore }} points</span>
          </div>
        </div>

        <div class="progress-bar-container progress-bar-container-total">
          <div class="progress-bar-background">
            <div
              class="progress-bar-foreground"
              :style="{
                width: (totalScore / totalMaxScore) * 100 + '%'
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- <div>
        <div class="comparison-score-box">Comparison section</div>
      </div> -->

      <div class="score-button-container">
        <button class="play-again-button" @click="playAgain()">Play again</button>
        <button class="back-to-dashboard-button" @click="saveScoreToFirestore()">
          Back to dashboard
        </button>
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

import {
  congratsIcon,
  careNoBGIcon,
  respectNoBGIcon,
  understandingNoBGIcon,
  starIcon,
  graphUpIcon,
  graphDownIcon
} from '@/assets/GUI/icons/icons'

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
      unionRedIcon: unionRedIcon,

      unionCare: '',
      unionRespect: '',
      unionUnderstanding: '',

      careGreenBool: false,
      respectGreenBool: false,
      understandingGreenBool: false,

      maxCareScore: 0,
      maxRespectScore: 0,
      maxUnderstandingScore: 0,
      totalMaxScore: 0,

      congratsIcon: congratsIcon,
      careNoBGIcon: careNoBGIcon,
      respectNoBGIcon: respectNoBGIcon,
      understandingNoBGIcon: understandingNoBGIcon,
      starIcon: starIcon,
      graphUpIcon: graphUpIcon,
      graphDownIcon: graphDownIcon,

      selectedStory: this.$route.query.selectedStory || ''
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
        this.calculateMaximumScore()
      })
    },
    initTitle() {
      gsap.fromTo(
        this.$refs.titleDiv,
        { x: 0, y: window.innerHeight, opacity: 0 },
        {
          y: 100,
          duration: 1,
          delay: 1,
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
          duration: 1.5,
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
            { y: 100, duration: 1, delay: 0, opacity: 1 }
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
          this.entranceY = 100

          this.exitX = window.innerWidth
          this.exitY = this.entranceY

          break
        case 'Right':
          this.entranceX = window.innerWidth
          this.entranceY = 100

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
        duration: 2,
        delay: 0
      })

      this.resultVisible = true

      if (this.bottomBool == true) {
        gsap.fromTo(
          this.$refs.resultDiv,
          { x: this.entranceX, y: this.entranceY, opacity: 0 },
          { x: 0, y: 100, duration: 1, delay: 1, opacity: 1 }
        )
      } else {
        gsap.fromTo(
          this.$refs.resultDiv,
          { x: this.entranceX, y: this.entranceY, opacity: 0 },
          { x: 0, y: 100, duration: 1, delay: 1, opacity: 1 }
        )
      }
    },
    resultToResponse() {
      this.hideUnionIcons()
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
        duration: 2,
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
          { x: 0, y: 100, duration: 1, opacity: 1 }
        )
      } else {
        gsap.fromTo(
          this.$refs.responseDiv,
          { x: this.entranceX, y: this.entranceY, opacity: 0 },
          { x: 0, y: 100, duration: 1, opacity: 1 }
        )
      }
    },
    animateScoreDivEnter() {
      this.timesPlayed++

      if (this.$refs.scoreDiv) {
        gsap.fromTo(
          this.$refs.scoreDiv,
          { x: this.entranceX, y: this.entranceY, opacity: 0 },
          { x: 0, y: 100, duration: 1, delay: 0, opacity: 1 }
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
        statement = score
      } else {
        statement = '+' + score
      }

      switch (categoryName) {
        case 'Care':
          this.careScore = this.careScore + score
          this.unionCare = statement
          if (score > -1) {
            this.careGreenBool = true
          } else {
            this.careGreenBool = false
          }
          break
        case 'Respect':
          this.respectScore = this.respectScore + score
          this.unionRespect = statement
          if (score > -1) {
            this.respectGreenBool = true
          } else {
            this.respectGreenBool = false
          }
          break
        case 'Understanding':
          this.understandingScore = this.understandingScore + score
          this.unionUnderstanding = statement
          if (score > -1) {
            this.understandingGreenBool = true
          } else {
            this.understandingGreenBool = false
          }
          break
      }

      return statement
    },
    hideUnionIcons() {
      this.unionCare = ''
      this.unionRespect = ''
      this.unionUnderstanding = ''
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
    },
    calculateMaximumScore() {
      this.maxCareScore = 0
      this.maxRespectScore = 0
      this.maxUnderstandingScore = 0

      console.log(this.responsePrompt)

      for (let i = 0; i < this.responsePrompt.length; i++) {
        const prompt = this.responsePrompt[i]

        if (prompt.question == 'This is a Mini-Game') {
          this.totalMaxScore = this.totalMaxScore + 25
          continue
        }

        if (prompt.middleAnswer != null) {
          // Care category
          this.maxCareScore += Math.max(
            prompt.leftAnswer['Care'] || 0,
            prompt.middleAnswer['Care'] || 0,
            prompt.rightAnswer['Care'] || 0
          )
          // Respect category
          this.maxRespectScore += Math.max(
            prompt.leftAnswer['Respect'] || 0,
            prompt.middleAnswer['Respect'] || 0,
            prompt.rightAnswer['Respect'] || 0
          )
          // Understanding category
          this.maxUnderstandingScore += Math.max(
            prompt.leftAnswer['Understanding'] || 0,
            prompt.middleAnswer['Understanding'] || 0,
            prompt.rightAnswer['Understanding'] || 0
          )
        } else {
          // Care category
          this.maxCareScore += Math.max(
            prompt.leftAnswer['Care'] || 0,
            prompt.rightAnswer['Care'] || 0
          )
          // Respect category
          this.maxRespectScore += Math.max(
            prompt.leftAnswer['Respect'] || 0,
            prompt.rightAnswer['Respect'] || 0
          )
          // Understanding category
          this.maxUnderstandingScore += Math.max(
            prompt.leftAnswer['Understanding'] || 0,
            prompt.rightAnswer['Understanding'] || 0
          )
        }
      }

      console.log('care: ' + this.maxCareScore)
      console.log('respect: ' + this.maxRespectScore)
      console.log('understanding: ' + this.maxUnderstandingScore)

      this.totalMaxScore =
        this.totalMaxScore + this.maxCareScore + this.maxRespectScore + this.maxUnderstandingScore
    },
    playAgain() {
      this.$router.go(0)
    },
    updateTotalScore(empScore) {
      this.totalScore += empScore
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

  color: black;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  width: 75vw;
  height: 70vh;

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
  padding: 2.5%;
  position: relative;

  width: 65vw;
  height: 45vh;

  top: 0vh;
  left: 12vw;

  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
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

  padding: 2.5%;

  top: 0vh;
  left: 12.5vw;

  width: 65vw;
  height: 45vh;

  color: black;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  opacity: 0;

  background-color: white;
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
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.button-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;

  width: 12.5vw;
  height: 20vh;

  top: 70%;
  transform: translateY(70%);
}

.middle-button {
  flex: 2;
}

.button-decision {
  background-color: white;
  border: none;
  color: black;
  font-weight: 600;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;

  font-size: 100%;
  cursor: pointer;

  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.left-button-decision,
.right-button-decision,
.middle-button-decision {
  width: 90%;
  height: 100%;
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
  height: 12.5vh;
  position: absolute;
  bottom: 10vh;

  width: 65vw;

  left: 15vw;

  /*
  left: 50%;
  transform: translateX(-50%);
  */
  display: flex;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  overflow: visible; /* Allow overflow */

  border-radius: 15px;

  z-index: 20;
}

.score-group {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.group-one {
  display: flex;
  align-items: center;
  flex: 1;
}

.group-one img {
  width: 1.8vw;
  height: auto;
}

.group-two {
  width: 70%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.score-item img {
  width: 1.8vw;
  height: auto;
}

.score-text {
  font-weight: 900;
}

.union-icon {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;

  top: -51%;
}

.union-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.union-icon img {
  width: 2vw;
  height: auto;
}

.union-text {
  position: absolute;
  color: white;
  font-weight: bold;
  text-align: center;
}

.score-div {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-intro {
  text-align: center;
  margin-bottom: 20px;
}

.score-breakdown {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin: 10px 0;
}

.care-score-card,
.respect-score-card,
.understanding-score-card {
  width: 30vw;
  height: 20vh;
  border-radius: 5px;
  text-align: center;

  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  margin: 1.5%;
}

.care-score-card {
  background-color: #ffeeee;
}

.respect-score-card {
  background-color: #d7f3ff;
}

.understanding-score-card {
  background-color: #ebf6e7;
}

.progress-bar-container {
  width: 90%;
  padding: 0;
  margin-top: 5%;

  margin-left: 5%;
}

.progress-bar-container-total {
  position: relative;

  bottom: 25%;
}

.progress-bar-background {
  background-color: rgba(128, 128, 128, 0.75);
  border-radius: 5px;
  height: 1.25vh;
}

.progress-bar-foreground {
  background-color: black;
  height: 100%;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.score-card-point-wrapper {
  margin-top: 2.5%;

  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  padding: 0 5%;
  box-sizing: border-box;
}

.score-image-group {
  display: flex;
  align-items: center;
}

.score-text-group {
  display: flex;
  flex-direction: column;
  text-align: left;

  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.total-score-box {
  display: flex;
  flex-direction: column;
  padding: 15px;

  background-color: #9747ff;
  color: white;
  border-radius: 5px;

  width: 90%;
}

.score-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.total-score-group {
  display: flex;
  align-items: center;
  flex: 1;
}

.score-value-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 20%;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-value-group-total {
  margin-right: 5%;
}

.comparison-score-box {
  width: 100%;
  background-color: white;
  color: black;
  padding: 15px;
  border-radius: 5px;
  text-align: center;
  margin: 10px 0;
}

.score-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  width: 100%;
}

.play-again-button {
  padding: 10px 20px;
  background-color: #4492f6;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1vw;

  width: 15vw;
  height: 5vh;

  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.back-to-dashboard-button {
  padding: 10px 20px;
  background-color: white;
  color: grey;
  border: #2c3e50;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1vw;

  width: 15vw;
  height: 5vh;

  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
</style>
