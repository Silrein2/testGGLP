<template>
  <div class="add-collection">
    <h2>Add Story Collection</h2>
    <input v-model="collectionName" placeholder="Enter a story title" />
    <button @click="addCollection">Create Story Collection</button>
  </div>
</template>

<script>
import { db } from '@/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export default {
  data() {
    return {
      collectionName: '',
      message: ''
    }
  },
  methods: {
    async addCollection() {
      if (!this.collectionName) {
        alert('Please enter a story name')
        return
      }

      const formattedCollectionName = `${this.collectionName}_Question_Bank`
      const storyListDoc = doc(db, 'Story_List', formattedCollectionName)

      try {
        await setDoc(doc(db, formattedCollectionName, '0'), {
          id: '0', // initial document
          Question: 'This question is meant to be removed or edited'
        })

        const storyListSnapshot = await getDoc(storyListDoc)

        if (!storyListSnapshot.exists()) {
          await setDoc(storyListDoc, {
            Name: this.collectionName
          })
          alert(`Collection ${formattedCollectionName} created successfully!`)
        } else {
          await setDoc(
            storyListDoc,
            {
              Name: this.collectionName
            },
            { merge: true }
          )
          alert(`Collection ${formattedCollectionName} updated successfully!`)
        }
        location.reload()
      } catch (error) {
        console.error('Error creating/updating collection:', error)
        alert('Error creating/updating collection. Please try again.')
      }
    }
  }
}
</script>

<style scoped>
.add-collection {
  margin: 20px;
}

.add-collection input {
  margin-bottom: 10px;
}
</style>
