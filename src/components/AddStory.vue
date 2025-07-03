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

      <input
        v-model="place"
        placeholder="Enter the place"
        class="form-input no-border box-shadow text-shadow border-radius font-weight font-size-form"
      />

      <textarea
        v-model="description"
        placeholder="Enter the description of the story"
        class="form-input-initial-story no-border box-shadow text-shadow border-radius font-weight font-size-form"
        rows="5"
      ></textarea>

      <div class="approx-time-container">
        <label>Approximate Time (minutes):</label>
        <div class="approx-time-inputs">
          <input
            type="number"
            v-model.number="approxTimeMin"
            placeholder="Min"
            @input="validateTimeInput"
            class="form-input no-border box-shadow text-shadow border-radius font-weight font-size-form"
          />
          <input
            type="number"
            v-model.number="approxTimeMax"
            placeholder="Max"
            @input="validateTimeInput"
            class="form-input no-border box-shadow text-shadow border-radius font-weight font-size-form"
          />
        </div>
      </div>

      <div class="difficulty-selection">
        <label for="difficulty">Select Difficulty:</label>
        <select
          v-model="difficulty"
          class="form-input no-border box-shadow text-shadow border-radius font-weight font-size-form"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <div class="linear-check">
        <label>
          <input type="checkbox" v-model="isLinear" class="checkbox-input" />
          Is the story linear?
        </label>
      </div>

      <input
        type="file"
        @change="onFileChange"
        class="form-input no-border box-shadow text-shadow border-radius font-weight font-size-form"
      />
      <div v-if="imageUrl">
        <p>Image preview:</p>
        <img :src="imageUrl" alt="Image Preview" class="image-preview" />
      </div>

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
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default {
  data() {
    return {
      collectionName: '',
      initialStory: '',
      message: '',
      isLinear: false,
      selectedFile: null,
      imageUrl: '',
      place: '',
      description: '',
      approxTimeMin: null,
      approxTimeMax: null,
      difficulty: 'Beginner'
    }
  },
  methods: {
    onFileChange(event) {
      this.selectedFile = event.target.files[0]
      if (this.selectedFile) {
        const reader = new FileReader()
        reader.onload = () => {
          this.imageUrl = reader.result
        }
        reader.readAsDataURL(this.selectedFile)
      }
    },
    async addCollection() {
      if (!this.collectionName) {
        alert('Please enter a story name')
        return
      }
      if (!this.initialStory) {
        alert('Please add the initial sentence of the story')
        return
      }
      if (!this.place) {
        alert('Please enter a place')
        return
      }
      if (!this.description) {
        alert('Please add a description of the story')
        return
      }
      if (this.approxTimeMin === null || this.approxTimeMax === null) {
        alert('Please enter approximate time')
        return
      }

      const formattedCollectionName = `${this.collectionName}_Question_Bank`
      const storyListDoc = doc(db, 'Story_List', formattedCollectionName)

      let imageHeadUrl = ''
      if (this.selectedFile) {
        const storage = getStorage()
        const storageRef = ref(storage, `${this.collectionName}_imageHead`)
        await uploadBytes(storageRef, this.selectedFile)
        imageHeadUrl = await getDownloadURL(storageRef) // get the imagehead URL
      }

      try {
        await setDoc(doc(db, formattedCollectionName, '0'), {
          id: '0', // initial document
          Question: 'This question is meant to be removed or edited'
        })

        const storyListSnapshot = await getDoc(storyListDoc)

        if (!storyListSnapshot.exists()) {
          await setDoc(storyListDoc, {
            Name: this.collectionName,
            InitialStory: this.initialStory,
            LinearStory: this.isLinear,
            ImageHead: imageHeadUrl,
            Place: this.place,
            Description: this.description,
            ApproxTime: {
              min: this.approxTimeMin,
              max: this.approxTimeMax
            },
            Difficulty: this.difficulty
          })
          alert(`Collection ${formattedCollectionName} created successfully!`)
        } else {
          await setDoc(
            storyListDoc,
            {
              Name: this.collectionName,
              InitialStory: this.initialStory,
              LinearStory: this.isLinear,
              ImageHead: imageHeadUrl,
              Place: this.place,
              Description: this.description,
              ApproxTime: {
                min: this.approxTimeMin,
                max: this.approxTimeMax
              },
              Difficulty: this.difficulty
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
      // not meant to be incorporated in final product to clients
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
    },
    validateTimeInput() {
      // ensure min time is at least 0
      if (this.approxTimeMin < 0) {
        this.approxTimeMin = 0
      }
      // ensure max time is at least 1 more than min time
      if (
        this.approxTimeMin !== null &&
        this.approxTimeMax !== null &&
        this.approxTimeMax <= this.approxTimeMin
      ) {
        this.approxTimeMax = this.approxTimeMin + 1
      }
      // ensure min time is at least 1 less than max time
      if (
        this.approxTimeMax !== null &&
        this.approxTimeMin !== null &&
        this.approxTimeMin >= this.approxTimeMax
      ) {
        this.approxTimeMin = this.approxTimeMax - 1
        if (this.approxTimeMin < 0) {
          this.approxTimeMin = 0
        }
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

.image-preview {
  width: 100%;
  max-width: 300px;
  margin-top: 10px;
}

.approx-time-container {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.approx-time-inputs {
  display: flex;
  gap: 10px;
}

.approx-time-inputs input {
  width: 35%;
}
</style>
