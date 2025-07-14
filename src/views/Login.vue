<template>
  <div id="background-container" class="login-wrapper" @click="showLogin">
    <!-- <img :src="mastheadImage" alt="Masthead" class="masthead-image" ref="mastheadImage" /> -->
    <div class="login-container font-weight bg-white box-shadow login-form" ref="loginContainer">
      <img :src="mastheadImage" alt="Masthead" class="masthead-image-login" />
      <span class="login-text-color text-shadow font-size-label" style="margin-top: 2.5%"
        >Welcome to AKPK Ceria</span
      >
      <span class="login-text-color text-shadow font-size-button">Sign in to your account</span>
      <div class="form-content" style="margin-top: 7.5%">
        <input
          type="email"
          v-model="email"
          placeholder="Email address"
          class="bg-white no-border box-shadow font-weight font-size-form input-field"
        />
        <button
          @click="checkEmail"
          class="login-button text-shadow border-radius-light font-weight no-border box-shadow margin-element font-size-form"
          style="margin-top: 7.5%"
        >
          Login
        </button>
      </div>
    </div>
    <div
      class="login-container font-weight bg-white box-shadow register-form"
      ref="registerContainer"
    >
      <div class="form-content-register">
        <div class="text-group" style="margin-bottom: 7.5%">
          <span class="login-text-color text-shadow" style="font-size: 1.5vw">
            Let's get acquainted
          </span>
          <br />
          <span class="login-text-color text-shadow" style="font-size: 0.9vw">
            As this is your first login, what name should we use to address you?
          </span>
        </div>
        <div
          class="register-container register-box-color border-radius-light"
          style="margin-bottom: 5%"
        >
          <span style="font-weight: 900; font-size: 2vw; color: white">Hello</span>
          <span style="font-weight: 100; font-size: 1.5vw; color: white; margin-bottom: 5%"
            >My name is</span
          >
          <input
            type="text"
            v-model="username"
            placeholder="Username"
            class="border-radius-light bg-white no-border box-shadow font-weight font-size-form input-field"
          />
        </div>
        <button
          @click="registerUser"
          class="login-button text-shadow border-radius-light font-weight no-border box-shadow margin-element font-size-form"
        >
          Register
        </button>
        <button
          @click="returnLogin"
          class="login-button text-shadow border-radius-light bg-white font-weight box-shadow margin-element font-size-form"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { mastheadImage } from '@/assets/GUI/backgroundGui'

import { gsap } from 'gsap'
import { fadeIn } from '@/utils/animation'

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      username: '',
      showUsernameInput: false,
      loginVisible: false,
      mastheadImage: mastheadImage
    }
  },
  mounted() {
    this.$setBackgroundImage()
    this.$updateBackgroundSize()
    this.initFadeIn()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.$updateBackgroundSize)
  },
  methods: {
    initFadeIn() {
      // const mastheadImg = this.$refs.mastheadImage
      // fadeIn(mastheadImg)

      const loginContainer = this.$refs.loginContainer

      fadeIn(loginContainer)
    },
    fadeOutAndNavigate(element, routeName) {
      gsap.to(element, {
        // Changed from fromTo to to for fading out
        opacity: 0,
        duration: 0.7, // Duration matches your external fadeOut
        visibility: 'hidden',
        pointerEvents: 'none',
        delay: 0.05, // Delay matches your external fadeOut
        onComplete: () => {
          // Only navigate AFTER the animation is complete and element is truly hidden
          localStorage.setItem('userEmail', this.email.trim()) // Ensure userEmail is set before navigating
          this.$router.push({ name: routeName })
        }
      })
    },
    // showLogin() {
    //   const mastheadImg = this.$refs.mastheadImage
    //   const loginContainer = this.$refs.loginContainer

    //   gsap.to(mastheadImg, {
    //     opacity: 0,
    //     duration: 0.5,
    //     pointerEvents: 'none',
    //     onComplete: () => {
    //       gsap.to(loginContainer, {
    //         opacity: 1,
    //         duration: 0.5,
    //         pointerEvents: 'auto'
    //       })
    //     }
    //   })
    // },
    showRegister() {
      const loginContainer = this.$refs.loginContainer
      const registerContainer = this.$refs.registerContainer

      gsap
        .timeline()
        .to(loginContainer, {
          opacity: 0,
          duration: 0.3,
          pointerEvents: 'none',
          onComplete: () => {
            gsap.set(loginContainer, { visibility: 'hidden' })
          }
        })
        .fromTo(
          registerContainer,
          { opacity: 0, visibility: 'hidden', pointerEvents: 'none' },
          {
            opacity: 1,
            duration: 0.3,
            visibility: 'visible',
            pointerEvents: 'auto',
            delay: 0.05
          }
        )
    },
    returnLogin() {
      const loginContainer = this.$refs.loginContainer
      const registerContainer = this.$refs.registerContainer

      gsap
        .timeline()
        .to(registerContainer, {
          opacity: 0,
          duration: 0.3,
          pointerEvents: 'none',
          onComplete: () => {
            gsap.set(registerContainer, { visibility: 'hidden' })
          }
        })
        .fromTo(
          loginContainer,
          { opacity: 0, visibility: 'hidden', pointerEvents: 'none' },
          {
            opacity: 1,
            duration: 0.3,
            visibility: 'visible',
            pointerEvents: 'auto',
            delay: 0.05
          }
        )
    },
    async checkEmail() {
      if (this.email === '') {
        alert('Please enter your email.')
        return
      }

      // Regex for basic email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!emailPattern.test(this.email)) {
        alert('Please enter a valid email address.')
        return
      }

      const docRef = doc(db, 'Score', this.email)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        this.fadeOutAndNavigate(this.$refs.loginContainer, 'UserDashboardPage')
      } else {
        alert('Since it is your first time logging in, what should we call you?')
        // this.showUsernameInput = true // First-time user

        this.showRegister()
      }
    },
    async registerUser() {
      if (this.username === '') {
        alert('Please enter your username.')
        return
      }

      const docRef = doc(db, 'Score', this.email)
      await setDoc(docRef, {
        Name: this.username,
        CareScore: 0,
        RespectScore: 0,
        UnderstandingScore: 0,
        EmpathyScore: 0,
        HighScore: -10000,
        TimesPlayed: 0
      })
      alert('Registration successful! Redirecting to main page...')

      this.fadeOutAndNavigate(this.$refs.loginContainer, 'UserDashboardPage')
    }
  }
}
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
}

.masthead-image {
  max-width: 100%;
  max-height: 100%;
  position: absolute;
  z-index: 1;
}

.masthead-image-login {
  max-width: 100%;
  max-height: 50%;
  margin-bottom: 1.5%;
  display: block;
}

.login-container {
  position: absolute;

  padding: 20px;
  border-radius: 8px;
  width: 25vw;
  height: 45vh;
  z-index: 2;
  display: flex;
  flex-direction: column;

  opacity: 0;
  pointer-events: none;
}

.login-form {
  pointer-events: none;
}

.register-form {
  pointer-events: none;
}

.form-content {
  margin: 1.5% 0;
  padding-left: 10%;
  padding-right: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-content-register {
  padding-left: 3%;
  padding-right: 3%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.text-group {
  margin-bottom: 0.1rem;
}

.margin-element {
  margin-top: 2.5%;
}

.input-field {
  height: 1.5%;
  padding: 5%;
  text-align: center;
  color: #163760;

  border-radius: 15px;
}

.login-button {
  background-color: white;
  border: 1px solid gray;

  color: #163760;

  width: 50%;
}

.login-button:hover {
  background-color: #4492f6;
  color: white;

  border: 1px solid #4492f6;
}

.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 90%;
  height: 90%;
  margin: 0 auto;
  padding: 15px;
}
</style>
