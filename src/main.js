import './assets/main.css'
// import './assets/teaColor.css'
import './assets/standardUI.css'

import {
  setBackgroundImage,
  updateBackgroundSize,
  setBackgroundImageAdmin
} from './utils/background'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { firebaseInitApp, database } from './firebase'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(firebaseInitApp)
app.use(database)

app.config.globalProperties.$setBackgroundImage = setBackgroundImage
app.config.globalProperties.$updateBackgroundSize = updateBackgroundSize
app.config.globalProperties.$setBackgroundImageAdmin = setBackgroundImageAdmin

app.mount('#app')
