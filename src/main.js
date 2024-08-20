import './assets/main.css'

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

app.mount('#app')
