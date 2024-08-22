<template>
  <div id="background-container">
    <button class="mainpage-button decision-button" @click="toMainPage()">Main Page</button>

    <h1 ref="mainText" class="welcome-text">{{ welcomeText }}</h1>
    <h3 ref="secondaryText" class="secondary-text">
      {{ noticeText }}
    </h3>

    <div ref="dashboardList" class="dashboard-list-buttons">
      <button class="form-list-button" @click="animateFormExit('addQuestion')">
        <h3>Add Questions</h3>
      </button>
      <button class="form-list-button" @click="animateFormExit('test')"><h3>Test Form</h3></button>
    </div>

    <div ref="formDiv" class="form-div">
      <AddQuestions v-if="addQuestionBool" />
      <div class="planned-forms" v-if="testBool">
        <h3 style="margin-left: 5%">
          Planned Forms: Add Questions, View Questions, Edit Questions, Delete Questions
        </h3>
        <h4 style="margin-left: 10%">- Add Questions</h4>
        <h4 style="margin-left: 10%">- View Questions</h4>
        <h5 style="margin-left: 15%">+ Edit Questions</h5>
        <h5 style="margin-left: 15%">+ Delete Questions</h5>
        <h3 style="margin-left: 5%">Edit and Delete will be within View Questions</h3>
      </div>
    </div>
  </div>
</template>

<script>
import { gsap } from 'gsap'

// import { ref, onValue, update } from 'firebase/database'
// import { database } from '@/firebase'

import AddQuestions from '@/components/AddQuestions.vue'

export default {
  name: 'App',
  components: {
    AddQuestions
  },
  data() {
    return {
      welcomeText: 'Dashboard',
      noticeText: '',

      arrayLength: null,

      addQuestionBool: false,
      testBool: false
    }
  },
  mounted() {
    this.setBackgroundImage()
    this.updateBackgroundSize()

    this.animateTexts()
    this.animateDashboardList()
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
    toMainPage() {
      this.$router.push('/')
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
    animateDashboardList() {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.fromTo(
            this.$refs.formDiv,
            { x: window.innerWidth, opacity: 0 },
            { x: '0%', duration: 2, opacity: 1 }
          )
        }
      })

      tl.fromTo(
        this.$refs.dashboardList,
        { x: -window.innerWidth, opacity: 0 },
        { x: '5%', duration: 2, delay: 2, opacity: 1 }
      )
    },
    animateFormExit(formName) {
      const tl = gsap.timeline({
        onComplete: () => {
          this.changeForm(formName)

          gsap.fromTo(
            this.$refs.formDiv,
            { x: window.innerWidth, opacity: 0 },
            { x: '0%', duration: 2, opacity: 1 }
          )
        }
      })

      tl.fromTo(
        this.$refs.formDiv,
        { opacity: 1 },
        { x: window.innerWidth, duration: 2, opacity: 0 }
      )
    },
    changeForm(formName) {
      //meant to change forms

      if (formName == 'addQuestion') {
        this.addQuestionBool = true
        this.testBool = false
      } else {
        this.addQuestionBool = false
        this.testBool = true
      }
    }
  }
}
</script>

<style>
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

::-webkit-scrollbar {
  width: 0px;
  background: transparent;
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

.mainpage-button {
  position: fixed;

  width: 7vw;
  height: 5vh;

  right: 5vw;
  top: 5vh;
}

.form-list-button {
  background-color: blueviolet;

  border: none;
  color: white;

  padding: 0px 20px;
  text-align: center;
  text-decoration: none;

  display: inline-block;
  font-size: 16px;
  margin: 10px 10px;
  cursor: pointer;

  width: 80%;
  height: 10%;
}

.dashboard-list-buttons {
  position: fixed;

  top: 50%;
  left: 3vw;

  transform: translateY(-50%);

  width: 15vw;
  height: 70vh;

  background-color: #4caf50;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.form-div {
  position: fixed;

  top: 50%;
  right: 3vw;

  transform: translateY(-50%);

  width: 70vw;
  height: 70vh;

  background-color: aqua;

  opacity: 0;
}

.planned-forms {
  position: absolute;

  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);

  width: 90%;
  height: 90%;

  background-color: brown;

  color: white;

  text-align: left;
}
</style>
