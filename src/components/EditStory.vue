<template>
  <div class="edit-collection">
    <h2 class="text-tea-cream text-shadow font-size-label">Edit Story Collection</h2>
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

      <div class="linear-check">
        <label>
          <input type="checkbox" v-model="isActive" class="checkbox-input" />
          Is the story active?
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
        @click="editCollection"
        class="form-input-button no-border box-shadow text-shadow border-radius font-weight font-size-form bg-tea-two text-tea-choco"
      >
        Update Story Collection
      </button>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default {
  props: {
    selectedStory: String
  },
  data() {
    return {
      collectionName: '',
      initialStory: '',
      isActive: false,
      selectedFile: null,
      imageUrl: ''
    }
  },
  async mounted() {
    await this.fetchStoryData()
  },
  methods: {
    async fetchStoryData() {
      const storyRef = doc(db, 'Story_List', `${this.selectedStory}_Question_Bank`)
      const storyDoc = await getDoc(storyRef)

      if (storyDoc.exists()) {
        const data = storyDoc.data()
        this.collectionName = data.Name
        this.initialStory = data.InitialStory
        this.isActive = data.ActiveStory || false
        this.imageUrl = data.ImageHead || ''
      }
    },
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
    async editCollection() {
      if (!this.collectionName || !this.initialStory) {
        alert('Please fill in all required fields')
        return
      }

      let imageHeadUrl = ''
      if (this.selectedFile) {
        const storage = getStorage()
        const storageRef = ref(storage, `${this.collectionName}_imageHead`)
        await uploadBytes(storageRef, this.selectedFile)
        imageHeadUrl = await getDownloadURL(storageRef)
      }

      try {
        const storyRef = doc(db, 'Story_List', `${this.collectionName}_Question_Bank`)
        await setDoc(
          storyRef,
          {
            Name: this.collectionName,
            InitialStory: this.initialStory,
            ActiveStory: this.isActive,
            ImageHead: imageHeadUrl
          },
          { merge: true }
        )

        alert('Story updated successfully!')
        this.$emit('update-complete')
      } catch (error) {
        console.error('Error updating story:', error)
        alert('Error updating story. Please try again.')
      }
    }
  }
}
</script>

<style scoped>
.edit-collection {
  margin: 20px;
}
.div-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.form-input,
.form-input-button {
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
</style>
