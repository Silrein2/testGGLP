// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCp4Pj6-b4Wf5Po_bUs4MNV_bH6jaO99f4',
  authDomain: 'payback-copycat.firebaseapp.com',
  databaseURL: 'https://payback-copycat-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'payback-copycat',
  storageBucket: 'payback-copycat.appspot.com',
  messagingSenderId: '426806339248',
  appId: '1:426806339248:web:b6b7ce630ec00d87297d75'
}

// Initialize Firebase
const firebaseInitApp = initializeApp(firebaseConfig)

const database = getDatabase()

export { firebaseInitApp, database }
