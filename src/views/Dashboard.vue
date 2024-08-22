<template>
  <div id="background-container">
    <button class="mainpage-button decision-button" @click="toMainPage()">Main Page</button>

    <h1 ref="mainText" class="welcome-text">{{ welcomeText }}</h1>
    <h3 ref="secondaryText" class="secondary-text">
      {{ noticeText }}
    </h3>

    <div ref="dashboardList" class="dashboard-list-buttons"></div>

    <div ref="formDiv" class="form-div">
      <AddQuestions />
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

      arrayLength: null
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

.dashboard-list-buttons {
  position: fixed;

  top: 50%;
  left: 3vw;

  transform: translateY(-50%);

  width: 20vw;
  height: 70vh;

  background-color: #4caf50;
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
</style>
