// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAiQ4nSQ8y4Av2oZP8H5qd1GpEIYEbHVg8",
  authDomain: "gglp-2d4cd.firebaseapp.com",
  projectId: "gglp-2d4cd",
  storageBucket: "gglp-2d4cd.firebasestorage.app",
  messagingSenderId: "446682447018",
  appId: "1:446682447018:web:7365831bf3e7f9e0b7a4d3"
};

// Initialize Firebase
const firebaseInitApp = initializeApp(firebaseConfig)

const database = getDatabase()
const db = getFirestore(firebaseInitApp)

export { firebaseInitApp, database, db }
