<template>
  <div id="background-container">
    <div ref="sBox">
      <div class="score-box" v-if="currentIndex < responsePrompt.length">
        <div class="score-group">
          <div class="group-one">
            <img
              :src="empathyIcon"
              alt="empathy"
              style="margin-right: 10%; width: 2.2vw; height: auto"
            />
            <span style="font-size: 1.2vw">Empathy progress</span>
          </div>
          <div class="score-item">
            <div class="union-icon" ref="unionCareIcon">
              <div class="union-content">
                <img :src="unionGreenIcon" alt="union care" v-if="careGreenBool" />
                <img :src="unionRedIcon" alt="union care" v-if="!careGreenBool" />
                <div class="union-text">{{ unionCare }}</div>
              </div>
            </div>
            <img :src="careIcon" alt="care" />
            <div class="score-text-item-group">
              <span style="font-size: 1.2vw">Care</span>
              <span class="score-text">{{ careScore }}</span>
            </div>
          </div>
          <div class="score-item">
            <div class="union-icon" ref="unionRespectIcon">
              <div class="union-content">
                <img :src="unionGreenIcon" alt="union respect" v-if="respectGreenBool" />
                <img :src="unionRedIcon" alt="union respect" v-if="!respectGreenBool" />
                <div class="union-text">{{ unionRespect }}</div>
              </div>
            </div>
            <img :src="respectIcon" alt="respect" />
            <div class="score-text-item-group">
              <span style="font-size: 1.2vw">Respect</span>
              <span class="score-text">{{ respectScore }}</span>
            </div>
          </div>
          <div class="score-item">
            <div class="union-icon" ref="unionUnderstandingIcon">
              <div class="union-content">
                <img
                  :src="unionGreenIcon"
                  alt="union understanding"
                  v-if="understandingGreenBool"
                />
                <img :src="unionRedIcon" alt="union understanding" v-if="!understandingGreenBool" />
                <div class="union-text">{{ unionUnderstanding }}</div>
              </div>
            </div>
            <img :src="understandingIcon" alt="understanding" />
            <div class="score-text-item-group">
              <span style="font-size: 1.2vw">Understanding</span>
              <span class="score-text">{{ understandingScore }}</span>
            </div>
          </div>
          <div class="score-item">
            <img :src="scoreIcon" alt="total" />
            <div class="score-text-item-group">
              <span style="font-size: 1.2vw">Score</span>
              <span class="score-text">{{ totalScore }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div ref="bbContainer">
      <div class="back-button-container" v-if="currentIndex < responsePrompt.length">
        <div @click="goBack">
          <div class="back-arrow-square">
            <!-- <img :src="backArrowIcon" alt="Back" class="back-arrow-icon" /> -->
            <div class="back-arrow-icon"></div>
          </div>
          <!-- <span class="back-button-text">Go back to dashboard</span> -->
        </div>
      </div>
    </div>

    <div class="mute-button-container" ref="mbContainer">
      <div @click="pauseBGM">
        <div class="back-arrow-square">
          <!-- <img :src="backArrowIcon" alt="Back" class="back-arrow-icon" /> -->
          <div class="play-button-icon" v-if="isPlaying"></div>
          <div class="mute-button-icon" v-if="!isPlaying"></div>
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
      <button @click="resultToResponse()" class="continue-button" ref="resultContinueButton">
        Continue
      </button>
    </div>

    <div
      ref="scoreDiv"
      class="response-div score-div"
      v-if="responseBool && (currentIndex >= responsePrompt.length || currentIndex == null)"
    >
      <div class="score-intro">
        <img :src="congratsIcon" style="width: 5vw; height: auto" />
        <p style="font-size: 1.75vw; font-weight: 700">Congratulations!</p>
        <p style="font-size: 1.25vw; font-weight: 500">You've completed the assessment</p>
        <p style="font-size: 0.8vw; color: dimgray">Here's your detailed score breakdown</p>
      </div>

      <div class="score-breakdown">
        <div class="care-score-card">
          <div class="score-card-point-wrapper">
            <div class="score-image-group">
              <img :src="careNoBGIcon" style="width: 2.5vw; height: auto" />
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
                font-size: 1.15vw;
              "
              >Care</span
            >
            <div class="progress-bar-background">
              <div class="progress-bar-foreground" ref="careProgressBar"></div>
            </div>
          </div>

          <p
            style="
              text-align: left;
              padding-left: 5%;
              padding-right: 5%;
              color: #5e5f60;
              font-size: 1vw;
            "
          >
            Your ability to show compassion and concern for others
          </p>
        </div>

        <div class="respect-score-card">
          <div class="score-card-point-wrapper">
            <div class="score-image-group">
              <img :src="respectNoBGIcon" style="width: 2.5vw; height: auto" />
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
                font-size: 1.15vw;
              "
              >Respect</span
            >
            <div class="progress-bar-background">
              <div class="progress-bar-foreground" ref="respectProgressBar"></div>
            </div>
          </div>

          <p
            style="
              text-align: left;
              padding-left: 5%;
              padding-right: 5%;
              color: #5e5f60;
              font-size: 1vw;
            "
          >
            How well you value and honour other’s perspectives
          </p>
        </div>

        <div class="understanding-score-card">
          <div class="score-card-point-wrapper">
            <div class="score-image-group">
              <img :src="understandingNoBGIcon" style="width: 2.5vw; height: auto" />
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
                font-size: 1.15vw;
              "
              >Understanding</span
            >
            <div class="progress-bar-background">
              <div class="progress-bar-foreground" ref="understandingProgressBar"></div>
            </div>
          </div>

          <p
            style="
              text-align: left;
              padding-left: 5%;
              padding-right: 5%;
              color: #5e5f60;
              font-size: 1vw;
            "
          >
            Your capacity to comprehend other’s feelings and situations
          </p>
        </div>
      </div>

      <div class="total-score-box">
        <div class="score-group">
          <div class="total-score-group">
            <div class="score-image-group" style="margin-left: 5%">
              <img :src="starIcon" style="width: 3vw; height: auto" />
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

        <div class="progress-bar-container-total">
          <div class="progress-bar-background">
            <div class="progress-bar-foreground" ref="totalProgressBar"></div>
          </div>
        </div>
      </div>

      <!-- <div>
        <div class="comparison-score-box">Comparison section</div>
      </div> -->

      <div class="score-button-container">
        <button class="end-button" @click="playAgain()">Play again</button>
        <button class="end-button" @click="saveScoreToFirestore()">Back to dashboard</button>
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

import { fadeIn, fadeOut } from '@/utils/animation'

import { success, successCredit } from '@/assets/Sound/BGM/bgm'

import { clickSound, completeSound } from '@/assets/Sound/SFX/sfx'
import audioService from '@/utils/audioService'

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

      selectedStory: this.$route.query.selectedStory || '',

      bgm: success,
      bgmCredit: successCredit,
      audioMusic: null,
      isPlaying: false,

      clickSound: clickSound,
      audioInstance: audioService
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

    this.playBGM()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.$updateBackgroundSize)
  },
  beforeRouteLeave(to, from, next) {
    this.stopBGM()
    next()
  },
  methods: {
    initFadeIn() {
      const scoreBox = this.$refs.sBox
      const backButtonContainer = this.$refs.bbContainer
      const muteButtonContainer = this.$refs.mbContainer

      // console.log(scoreBox)
      // console.log(backButtonContainer)
      // console.log(muteButtonContainer)

      fadeIn(scoreBox)
      fadeIn(backButtonContainer)
      fadeIn(muteButtonContainer)
    },
    getUserDetails(dbData) {
      this.userName = dbData.Name

      const storyScoreKey = `${this.selectedStory}Score`
      this.currentHighScore =
        dbData[storyScoreKey] != null && dbData[storyScoreKey] !== undefined
          ? dbData[storyScoreKey]
          : 0
      this.timesPlayed = dbData.TimesPlayed || 0
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
      this.initFadeIn()
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
      this.audioInstance.playSound(this.clickSound)

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
      this.audioInstance.playSound(this.clickSound)

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
        // console.log('Mini-game finished:', resultString)
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
      this.animateUnionIcon()
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
          {
            x: 0,
            y: 100,
            duration: 1,
            delay: 1,
            opacity: 1
            // onComplete: () => {
            //   this.animateUnionIcon()
            // }
          }
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
      this.audioInstance.playSound(this.clickSound)

      this.animateUnionIconExit()
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
      this.fadeOutAudio(2500)

      this.timesPlayed++

      if (this.$refs.scoreDiv) {
        gsap.fromTo(
          this.$refs.scoreDiv,
          { x: this.entranceX, y: this.entranceY, opacity: 0 },
          {
            x: 0,
            y: 100,
            duration: 1,
            delay: 0,
            opacity: 1,
            onComplete: () => {
              this.animateProgressBars()
            }
          }
        )
      } else {
        console.warn('scoreDiv ref not found.  Animation skipped.')
      }
    },
    async saveScoreToFirestore() {
      this.audioInstance.playSound(this.clickSound)

      try {
        const scoreCollection = collection(db, 'Score')

        if (!this.userEmail) {
          throw new Error('User email is not defined.')
        }

        const scoreDocRef = doc(scoreCollection, this.userEmail)

        let tempHighScore = Math.max(this.totalScore, this.currentHighScore)

        const sanitizedStoryName = this.selectedStory.replace(/\./g, '').replace(/\s/g, '')

        const storyScoreKey = `${sanitizedStoryName}Score`

        console.log('Original selectedStory:', this.selectedStory)
        console.log('Sanitized storyScoreKey:', storyScoreKey)

        const scoreDoc = await getDoc(scoreDocRef)
        const existingScore = scoreDoc.data() ? scoreDoc.data()[storyScoreKey] : null

        const updateData = {
          [storyScoreKey]: tempHighScore,
          CareScore: this.careScore,
          RespectScore: this.respectScore,
          UnderstandingScore: this.understandingScore,
          EmpathyScore: this.totalScore,
          HighScore: tempHighScore,
          TimesPlayed: this.timesPlayed
        }

        if (existingScore == null) {
          // If it doesn't exist, create it with tempHighScore
          await updateDoc(scoreDocRef, updateData)
        } else {
          // If it exists, update the scores and the storyScoreKey
          await updateDoc(scoreDocRef, updateData)
        }

        alert('Score is saved to FireStore')
        this.stopBGM()
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
      this.audioInstance.playSound(this.clickSound)

      this.stopBGM()
      this.$router.push('/user-dashboard')
    },
    calculateMaximumScore() {
      this.maxCareScore = 0
      this.maxRespectScore = 0
      this.maxUnderstandingScore = 0

      // console.log(this.responsePrompt)

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

      // console.log('care: ' + this.maxCareScore)
      // console.log('respect: ' + this.maxRespectScore)
      // console.log('understanding: ' + this.maxUnderstandingScore)

      this.totalMaxScore =
        this.totalMaxScore + this.maxCareScore + this.maxRespectScore + this.maxUnderstandingScore
    },
    playAgain() {
      this.audioInstance.playSound(this.clickSound)

      this.$router.go(0)
    },
    updateTotalScore(empScore) {
      this.totalScore += empScore
    },
    animateProgressBars() {
      //references to each progress bars
      const careProgressBar = this.$refs.careProgressBar
      const respectProgressBar = this.$refs.respectProgressBar
      const understandingProgressBar = this.$refs.understandingProgressBar

      const totalProgressBar = this.$refs.totalProgressBar

      const carePercentage = (this.careScore / this.maxCareScore) * 100
      const respectPercentage = (this.respectScore / this.maxRespectScore) * 100
      const understandingPercentage = (this.understandingScore / this.maxUnderstandingScore) * 100

      const totalPercentage = (this.totalScore / this.totalMaxScore) * 100

      // care progress bar
      gsap.fromTo(careProgressBar, { width: '0%' }, { width: `${carePercentage}%`, duration: 2 })

      // respect progress bar
      gsap.fromTo(
        respectProgressBar,
        { width: '0%' },
        { width: `${respectPercentage}%`, duration: 2 }
      )

      // understanding progress bar
      gsap.fromTo(
        understandingProgressBar,
        { width: '0%' },
        { width: `${understandingPercentage}%`, duration: 2 }
      )

      // total progress bar
      gsap.fromTo(totalProgressBar, { width: '0' }, { width: `${totalPercentage}%`, duration: 2 })
    },
    animateUnionIcon() {
      const rCButton = this.$refs.resultContinueButton

      this.pointerPause(rCButton)

      const unionCareIcon = this.$refs.unionCareIcon
      const unionRespectIcon = this.$refs.unionRespectIcon
      const unionUnderstandingIcon = this.$refs.unionUnderstandingIcon

      gsap.fromTo(
        unionCareIcon,
        { opacity: 0, y: -25 },
        {
          opacity: 1,
          y: -50,
          duration: 1,
          ease: 'power1.out'
        }
      )

      gsap.fromTo(
        unionRespectIcon,
        { opacity: 0, y: -25 },
        {
          opacity: 1,
          y: -50,
          duration: 1,
          ease: 'power1.out'
        }
      )

      gsap.fromTo(
        unionUnderstandingIcon,
        { opacity: 0, y: -25 },
        {
          opacity: 1,
          y: -50,
          duration: 1,
          ease: 'power1.out',
          onComplete: () => {
            this.pointerReset(rCButton)
          }
        }
      )
    },
    animateUnionIconExit() {
      const unionCareIcon = this.$refs.unionCareIcon
      const unionRespectIcon = this.$refs.unionRespectIcon
      const unionUnderstandingIcon = this.$refs.unionUnderstandingIcon

      gsap.fromTo(
        unionCareIcon,
        { opacity: 1, y: -50 },
        {
          opacity: 0,
          y: -75,
          duration: 1,
          ease: 'power1.out'
        }
      )

      gsap.fromTo(
        unionRespectIcon,
        { opacity: 1, y: -50 },
        {
          opacity: 0,
          y: -75,
          duration: 1,
          ease: 'power1.out'
        }
      )

      gsap.fromTo(
        unionUnderstandingIcon,
        { opacity: 1, y: -50 },
        {
          opacity: 0,
          y: -75,
          duration: 1,
          ease: 'power1.out',
          onComplete: () => {
            this.hideUnionIcons()
          }
        }
      )
    },
    playBGM() {
      if (!this.audioMusic) {
        this.audioMusic = new Audio(this.bgm)
        this.audioMusic.volume = 0.5
        this.audioMusic.loop = true

        console.log(this.bgmCredit)
      }

      if (!this.isPlaying) {
        this.audioMusic.play().catch((error) => {
          console.error('Error playing audio:', error)
        })
        this.isPlaying = true
      }
    },
    stopBGM() {
      if (this.audioMusic) {
        this.audioMusic.pause()
        this.audioMusic.currentTime = 0
        this.isPlaying = false
      }
    },
    pauseBGM() {
      this.audioInstance.playSound(this.clickSound)

      if (this.isPlaying) {
        this.audioMusic.pause()
        this.isPlaying = false
      } else {
        this.audioMusic.play()
        this.isPlaying = true
      }
    },
    pointerPause(buttonElement) {
      buttonElement.pointerEvents = 'None'
    },
    pointerReset(buttonElement) {
      buttonElement.pointerEvents = 'Auto'
    },
    fadeOutAudio(duration) {
      const mbContainer = this.$refs.mbContainer
      fadeOut(mbContainer)

      const fadeOutInterval = 50
      const steps = duration / fadeOutInterval
      const volumeDecrement = this.audioMusic.volume / steps

      const musicFadeOut = setInterval(() => {
        if (this.audioMusic.volume > 0) {
          this.audioMusic.volume = Math.max(0, this.audioMusic.volume - volumeDecrement)
        } else {
          clearInterval(musicFadeOut)
          this.audioMusic.pause()
          this.audioMusic.currentTime = 0
        }
      }, fadeOutInterval)

      this.audioInstance.playSound(completeSound)
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
  left: 10vw;

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

.continue-button:hover {
  background-color: #144e98;
}

.title-text {
  margin: 0;

  font-size: 2.5vw;
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

  font-size: 1.1vw;
  cursor: pointer;

  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.button-decision:hover {
  background-color: #4492f6;
  color: white;
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
  left: 7.5vw;
  display: flex;
  align-items: center;
}

.mute-button-container {
  position: absolute;
  top: 2.5vh;
  right: 7.5vw;
  display: flex;
  align-items: center;

  opacity: 0;
}

.back-arrow-square {
  width: 2vw;
  height: 2vw;
  border: 2px solid #848688;
  border-radius: 5px;

  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
}

.back-arrow-square:hover {
  background-color: #4492f6;
  border: 2px solid #4492f6;

  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.back-arrow-icon {
  border-top: 0.5vw solid transparent;
  border-bottom: 0.5vw solid transparent;
  border-right: 1vw solid #848688;
}

.back-arrow-square:hover .back-arrow-icon {
  border-right: 1vw solid white;
}

.play-button-icon {
  background-image: url('@/assets/GUI/sound icons/PlaySpeakerIcon_Black.png');
}

.back-arrow-square:hover .play-button-icon {
  background-image: url('@/assets/GUI/sound icons/PlaySpeakerIcon_White.png');
}

.mute-button-icon {
  background-image: url('@/assets/GUI/sound icons/PlaySpeakerIcon_Black_Mute.png');
}

.back-arrow-square:hover .mute-button-icon {
  background-image: url('@/assets/GUI/sound icons/PlaySpeakerIcon_White_Mute.png');
}

.play-button-icon,
.mute-button-icon {
  width: 100%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  display: inline-block;
}

.back-button-text {
  font-size: 1rem;
  line-height: 50px;
}

.score-box {
  background-color: white;
  height: 15vh;
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
  width: 2.2vw;
  height: auto;
}

.score-text {
  font-weight: 900;
  margin-top: 5%;
  font-size: 1.25vw;
}

.score-text-item-group {
  margin-top: 5%;

  display: flex;
  flex-direction: column;

  align-items: center;
  width: 100%;
}

.union-icon {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;

  opacity: 0%;
}

.union-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.union-icon img {
  width: 2.5vw;
  height: auto;
}

.union-text {
  position: absolute;
  color: white;
  font-weight: bold;
  text-align: center;

  font-size: 1.1vw;
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
  height: 22.5vh;
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
  margin-top: 2%;

  margin-left: 5%;
}

.progress-bar-container-total {
  position: relative;

  width: 90%;
  padding: 0;
  margin-top: 5%;
  margin-left: 5%;

  bottom: 25%;
}

.progress-bar-background {
  background-color: rgba(128, 128, 128, 0.75);
  border-radius: 5px;
  height: 0.8vw;

  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.progress-bar-foreground {
  background-color: black;
  height: 100%;
  border-radius: 5px;
  transition: width 0.3s ease;

  width: 0%;

  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
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

  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
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

.end-button {
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

  font-weight: 300;
}

.end-button:hover {
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
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  font-weight: 600;
}
</style>
