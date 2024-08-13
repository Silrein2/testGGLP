// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCp4Pj6-b4Wf5Po_bUs4MNV_bH6jaO99f4',
  authDomain: 'payback-copycat.firebaseapp.com',
  projectId: 'payback-copycat',
  storageBucket: 'payback-copycat.appspot.com',
  messagingSenderId: '426806339248',
  appId: '1:426806339248:web:b6b7ce630ec00d87297d75'
}

// Initialize Firebase
const firebaseInitApp = initializeApp(firebaseConfig)

export { firebaseInitApp }
