<template>
  <div class="add-collection">
    <h2 class="text-tea-cream text-shadow font-size-label">Add Story Collection</h2>
    <div class="div-form">
      <input
        v-model="collectionName"
        placeholder="Enter a story title"
        class="form-input no-border box-shadow text-shadow border-radius font-weight font-size-form"
      />
      <textarea
        v-model="initialStory"
        placeholder="Enter the initial story"
        class="form-input-initial-story no-border box-shadow text-shadow border-radius font-weight font-size-form"
        rows="5"
      ></textarea>
      <button
        @click="addCollection"
        class="form-input-button no-border box-shadow text-shadow border-radius font-weight font-size-form bg-tea-two text-tea-choco"
      >
        Create Story Collection
      </button>
      <!-- <button @click="copyQuestions">Copy Questions to Prototype</button> -->
      <!-- meant to copy from one collection in FireStore to another -->
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase'
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore'

export default {
  data() {
    return {
      collectionName: '',
      initialStory: '',
      message: ''
    }
  },
  methods: {
    async addCollection() {
      if (!this.collectionName) {
        alert('Please enter a story name')
        return
      }
      if (!this.initialStory) {
        alert('Please add the initial sentence of the story')
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
            Name: this.collectionName,
            InitialStory: this.initialStory
          })
          alert(`Collection ${formattedCollectionName} created successfully!`)
        } else {
          await setDoc(
            storyListDoc,
            {
              Name: this.collectionName,
              InitialStory: this.initialStory
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
    },
    async copyQuestions() {
      //not meant to be incorporated in final product to clients
      try {
        const questionsRef = collection(db, 'Question_Bank')
        const querySnapshot = await getDocs(questionsRef)

        const prototypeRef = collection(db, 'Prototype_Question_Bank')

        for (const dbdoc of querySnapshot.docs) {
          await setDoc(doc(prototypeRef, dbdoc.id), {
            ...dbdoc.data()
          })
        }

        alert('Questions copied to Prototype_Question_Bank successfully!')
      } catch (error) {
        console.error('Error copying questions:', error)
        alert('Error copying questions. Please try again.')
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

.div-form {
  position: absolute;

  left: 50%;
  transform: translateX(-50%);

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.form-input {
  width: 12.5vw;
  height: 7.5vh;

  text-align: center;
}
.form-input-initial-story {
  width: 35vw;
  height: auto;
  resize: vertical;
  padding: 10px;
}

.form-input-button {
  width: 12.5vw;
  height: 7.5vh;

  text-align: center;
}
</style>
