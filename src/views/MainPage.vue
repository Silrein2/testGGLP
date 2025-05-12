<template>
  <div id="background-container">
    <div
      ref="titleDiv"
      class="response-div"
      @click="animateTitleExit"
      :style="{ visibility: titleDivVisible ? 'visible' : 'hidden' }"
    >
      <h1>Title</h1>
    </div>

    <div
      ref="responseDiv"
      class="response-div"
      v-if="responseBool && currentIndex < responsePrompt.length"
    >
      <div class="content-container">
        <h1>{{ responsePrompt[currentIndex].question }}</h1>

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
            @click="responseToResult('Bottom', responsePrompt[currentIndex].middleAnswer['Result'])"
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
    <div
      ref="resultDiv"
      class="result-div"
      @click="resultToResponse()"
      :style="{ pointerEvents: resultVisible ? 'auto' : 'none' }"
    >
      <h1>{{ currentResult }}</h1>
      <h3>{{ addedCareString }}</h3>
      <h3>{{ addedRespectString }}</h3>
      <h3>{{ addedUnderstandingString }}</h3>
    </div>

    <div
      ref="scoreDiv"
      class="response-div"
      v-if="responseBool && currentIndex >= responsePrompt.length"
    >
      <div class="score-container">
        <h2>{{ userName }}, you have played the game {{ timesPlayed }} times</h2>

        <p>Care Score: {{ careScore }}</p>
        <p>Respect Score: {{ respectScore }}</p>
        <p>Understanding Score: {{ understandingScore }}</p>
        <p>Total Empathy Score: {{ totalScore }}</p>
        <p>Previous High Score: {{ currentHighScore }}</p>

        <button @click="saveScoreToFirestore()" class="save-button">Save Score</button>
      </div>
    </div>
  </div>
</template>

<script>
import { gsap } from 'gsap'
import { db } from '@/firebase'
import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore'

export default {
  name: 'MainPage',
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
      timesPlayed: 0
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
    // setBackgroundImage() {
    //   const backgroundElement = document.getElementById('background-container')
    //   backgroundElement.style.position = 'absolute'
    //   backgroundElement.style.top = '0'
    //   backgroundElement.style.left = '0'
    //   backgroundElement.style.width = '100%'
    //   backgroundElement.style.display = 'flex'
    //   backgroundElement.style.transition = 'transform 0.3s'
    //   backgroundElement.style.overflow = 'hidden'
    //   backgroundElement.style.cursor = 'pointer'
    //   backgroundElement.style.backgroundColor = '#4E2E1D'

    //   const beforeElement = document.createElement('div')
    //   beforeElement.style.content = ''
    //   beforeElement.style.position = 'absolute'
    //   beforeElement.style.top = '0'
    //   beforeElement.style.left = '0'
    //   beforeElement.style.width = '100%'
    //   beforeElement.style.paddingTop = '56.25%'
    //   beforeElement.style.backgroundSize = 'cover'
    //   beforeElement.style.backgroundPosition = 'center'
    //   beforeElement.style.backgroundRepeat = 'no-repeat'
    //   beforeElement.style.zIndex = '-1'
    //   beforeElement.style.transition = 'transform 2s ease'
    //   beforeElement.style.transform = 'scale(1)'
    //   beforeElement.style.transformOrigin = 'bottom center'

    //   backgroundElement.appendChild(beforeElement)
    // },
    // updateBackgroundSize() {
    //   const backgroundContainer = document.getElementById('background-container')
    //   const windowWidth = window.innerWidth
    //   const windowHeight = window.innerHeight

    //   const targetAspectRatio = 16 / 9

    //   let offsetX = 0
    //   let offsetY = 0

    //   this.containerHeight = Math.max(windowHeight, windowWidth / targetAspectRatio)
    //   this.containerWidth = Math.max(windowWidth, this.containerHeight * targetAspectRatio)

    //   backgroundContainer.style.width = `${this.containerWidth}px`
    //   backgroundContainer.style.height = `${this.containerHeight}px`
    //   backgroundContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`
    // },
    async getFirestoreVariables() {
      await onSnapshot(collection(db, 'Question_Bank'), (snapshot) => {
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
      console.log('CurrentIndex: ' + this.currentIndex)

      this.bottomBool = false

      this.scoreTally(answerDirection)

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

      this.animateResponseExit()
    },
    scoreTally(answerDirection) {
      switch (answerDirection) {
        case 'Left':
          this.careScore =
            this.careScore + this.responsePrompt[this.currentIndex].leftAnswer['Care']
          this.addedCareString =
            'Care: +' + this.responsePrompt[this.currentIndex].leftAnswer['Care']

          this.respectScore =
            this.respectScore + this.responsePrompt[this.currentIndex].leftAnswer['Respect']
          this.addedRespectString =
            'Respect: +' + this.responsePrompt[this.currentIndex].leftAnswer['Respect']

          this.understandingScore =
            this.understandingScore +
            this.responsePrompt[this.currentIndex].leftAnswer['Understanding']
          this.addedUnderstandingString =
            'Understanding: +' + this.responsePrompt[this.currentIndex].leftAnswer['Understanding']
          break
        case 'Right':
          this.careScore =
            this.careScore + this.responsePrompt[this.currentIndex].rightAnswer['Care']
          this.addedCareString =
            'Care: +' + this.responsePrompt[this.currentIndex].rightAnswer['Care']

          this.respectScore =
            this.respectScore + this.responsePrompt[this.currentIndex].rightAnswer['Respect']
          this.addedRespectString =
            'Respect: +' + this.responsePrompt[this.currentIndex].rightAnswer['Respect']

          this.understandingScore =
            this.understandingScore +
            this.responsePrompt[this.currentIndex].rightAnswer['Understanding']
          this.addedUnderstandingString =
            'Understanding: +' + this.responsePrompt[this.currentIndex].rightAnswer['Understanding']
          break
        case 'Bottom':
          this.careScore =
            this.careScore + this.responsePrompt[this.currentIndex].middleAnswer['Care']
          this.addedCareString =
            'Care: +' + this.responsePrompt[this.currentIndex].middleAnswer['Care']

          this.respectScore =
            this.respectScore + this.responsePrompt[this.currentIndex].middleAnswer['Respect']
          this.addedRespectString =
            'Respect: +' + this.responsePrompt[this.currentIndex].middleAnswer['Respect']

          this.understandingScore =
            this.understandingScore +
            this.responsePrompt[this.currentIndex].middleAnswer['Understanding']
          this.addedUnderstandingString =
            'Understanding: +' +
            this.responsePrompt[this.currentIndex].middleAnswer['Understanding']
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
          this.currentIndex += 1

          if (this.currentIndex >= this.responsePrompt.length) {
            this.$nextTick(() => {
              this.animateScoreDivEnter()
            })
          } else {
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

  font-size: 1.25vw;
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
</style>
