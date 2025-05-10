<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<script>
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default {
  name: 'App'
  //   async beforeCreate() {
  //     const userEmail = this.getUserEmail()

  //     if (userEmail) {
  //       const docRef = doc(db, 'Score', userEmail)
  //       const docSnap = await getDoc(docRef)
  //       if (!docSnap.exists()) {
  //         this.$router.push('/')
  //       } else {
  //         this.$router.push('/main')
  //       }
  //     } else {
  //       this.$router.push('/')
  //     }
  //   },
  //   methods: {
  //     getUserEmail() {
  //       return localStorage.getItem('userEmail')
  //     }
  //   }
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
