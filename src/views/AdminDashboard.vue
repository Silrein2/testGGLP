<template>
  <div id="background-container">
    <button
      class="mainpage-button bg-tea-four text-shadow text-tea-cream box-shadow border-radius no-border font-weight font-size-button"
      @click="toMainPage()"
    >
      User Login Page
    </button>

    <h1 ref="mainText" class="welcome-text text-shadow font-size-title">
      {{ welcomeText }}
    </h1>
    <h3 ref="secondaryText" class="secondary-text text-shadow font-size-label">
      {{ noticeText }}: {{ selectedStory }}
    </h3>

    <div
      ref="dashboardList"
      class="dashboard-list-buttons bg-tea-three no-border border-radius box-shadow"
    >
      <select
        v-model="selectedStory"
        @change="onStoryChange"
        class="drop-down-story-selector font-weight font-size-form text-shadow box-shadow bg-tea-cream text-tea-choco no-border border-radius"
      >
        <option v-for="story in stories" :key="story.id" :value="story.Name">
          {{ story.Name }}
        </option>
      </select>

      <button
        class="form-list-button text-shadow text-tea-cream font-weight font-size-form no-border border-radius box-shadow"
        @click="confirmDeleteStory"
      >
        Delete Current Story
      </button>
      <button
        class="form-list-button text-shadow text-tea-cream font-weight font-size-form no-border border-radius box-shadow"
        @click="animateFormExit('editStory')"
      >
        Edit Current Story
      </button>
      <button
        class="form-list-button text-shadow text-tea-cream font-weight font-size-form no-border border-radius box-shadow"
        @click="animateFormExit('addStory')"
      >
        Add Story
      </button>
      <button
        class="form-list-button text-shadow text-tea-cream font-weight font-size-form no-border border-radius box-shadow"
        @click="animateFormExit('addQuestion')"
      >
        Add Questions
      </button>
      <button
        class="form-list-button text-shadow text-tea-cream font-weight font-size-form no-border border-radius box-shadow"
        @click="animateFormExit('listQuestion')"
      >
        Question List
      </button>
      <button
        class="form-list-button text-shadow text-tea-cream font-weight font-size-form no-border border-radius box-shadow"
        @click="animateFormExit('scoreList')"
      >
        Score List
      </button>
      <button
        class="form-list-button text-shadow text-tea-cream font-weight font-size-form no-border border-radius box-shadow"
        @click="animateFormExit('test')"
      >
        Things to do
      </button>
    </div>

    <div ref="formDiv" class="form-div bg-tea-four no-border border-radius box-shadow">
      <AddStory v-if="addStoryBool" />
      <AddQuestions v-if="addQuestionBool" :selectedStory="selectedStory" :isLinear="isLinear" />
      <QuestionList
        v-if="listQuestionBool"
        :selectedStory="selectedStory"
        :isLinear="isLinear"
        @edit-question="editQuestion"
      />
      <ScoreList v-if="scoreListBool" />
      <div class="planned-forms text-shadow box-shadow no-border border-radius" v-if="testBool">
        <h1 v-if="isLinear" style="margin-left: 5%">
          The current story {{ selectedStory }} is a LINEAR story
        </h1>
        <h1 v-if="!isLinear" style="margin-left: 5%">
          The current story {{ selectedStory }} is a NON-LINEAR story
        </h1>
        <h3 class="first-statement-indent">
          - Add Story button will add new group of story into database
        </h3>
        <h4 class="child-statement-indent">
          + When adding stories using Add Story button, it's best if the name of the collection is
          set to a single word
        </h4>
        <h4 class="child-statement-indent">
          + The initial story initial story in the form is what the user will see when they first
          click on the story button (in User's Dashboard)
        </h4>
        <h4 class="child-statement-indent">
          + The checkbox is to determine whether the story is linear or not
        </h4>
        <h3 class="statement-indent">
          - Add Questions will add new questions, answers, results to the current story.
        </h3>
        <h3 class="statement-indent">- Question List will show the list of existing questions.</h3>
        <h4 class="child-statement-indent">+ Edit button will edit that particular question</h4>
        <h4 class="child-statement-indent">+ Delete button will delete that particular question</h4>
        <h4 class="child-statement-indent">
          + Clicking on the question's ID will reveal the list of answers and results
        </h4>
        <h4 v-if="!isLinear" class="child-statement-indent">
          + If the story is NON-LINEAR, the flow will not follow the order of the questions
        </h4>
        <h4 v-if="!isLinear" class="child-statement-indent">
          + Instead, there will be a dropdown menu next to each answer. This is to determine which
          next question the answers will lead to (currently they're only in ID)
        </h4>
        <h3 class="statement-indent">
          - Score List is the list of registered users from User Login Page
        </h3>
        <h4 class="child-statement-indent">
          + The sorting style from the dropdown menu (ID, Times Played etc) is descending (from the
          highest to lowest)
        </h4>
      </div>
      <EditQuestion
        v-if="editQuestionBool"
        :selectedStory="selectedStory"
        :questionId="selectedQuestionId"
        @cancel-edit="cancelEdit"
      />
      <EditStory
        v-if="editStoryBool"
        :selectedStory="selectedStory"
        @update-complete="fetchStories"
      />
    </div>
  </div>
</template>

<script>
import { gsap } from 'gsap'
import { db } from '@/firebase'
import { collection, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore'

import AddQuestions from '@/components/AddQuestions.vue'
import QuestionList from '@/components/QuestionList.vue'
import EditQuestion from '@/components/EditQuestion.vue'
import ScoreList from '@/components/ScoreList.vue'
import EditStory from '@/components/EditStory.vue'

import AddStory from '@/components/AddStory.vue'

export default {
  name: 'DashboardPage',
  components: {
    AddQuestions,
    QuestionList,
    EditQuestion,
    ScoreList,
    AddStory,
    EditStory
  },
  data() {
    return {
      welcomeText: 'Admin Dashboard',
      noticeText: 'Currently selecting ',

      arrayLength: null,

      addQuestionBool: false,
      listQuestionBool: false,
      scoreListBool: false,
      testBool: true,
      editQuestionBool: false,
      selectedQuestionId: null,

      addStoryBool: false,
      editStoryBool: false,

      stories: [],
      selectedStory: '',
      isLinear: false
    }
  },
  async mounted() {
    this.$setBackgroundImageAdmin()
    this.$updateBackgroundSize()

    await this.fetchStories()

    this.animateTexts()
    this.animateDashboardList()

    window.addEventListener('resize', this.$updateBackgroundSize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.$updateBackgroundSize)
  },
  methods: {
    animateTexts() {
      gsap.fromTo(
        this.$refs.mainText,
        { x: '10%', y: '-100%', opacity: 0 },
        { x: '10%', y: '10%', opacity: 1, duration: 2, delay: 0 }
      )

      gsap.fromTo(
        this.$refs.secondaryText,
        { x: '10%', y: '-100%', opacity: 0 },
        { x: '10%', y: '10%', opacity: 1, duration: 2, delay: 0 }
      )
    },
    toMainPage() {
      this.$router.push('/')
    },
    toPlannerPage() {
      this.$router.push('/question-planner')
    },
    animateDashboardList() {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.fromTo(
            this.$refs.formDiv,
            { x: window.innerWidth, opacity: 0 },
            { x: '50%', duration: 1.5, opacity: 1, transform: 'translate(-50%, -50%)' }
          )
        }
      })

      tl.fromTo(
        this.$refs.dashboardList,
        { x: -window.innerWidth, opacity: 0 },
        { x: '5%', duration: 1.5, delay: 2, opacity: 1 }
      )
    },
    animateFormExit(formName) {
      const tl = gsap.timeline({
        onComplete: () => {
          this.changeForm(formName)

          gsap.fromTo(
            this.$refs.formDiv,
            { x: window.innerWidth, opacity: 0 },
            { x: '50%', duration: 1.5, opacity: 1, transform: 'translate(-50%, -50%)' }
          )
        }
      })

      tl.fromTo(
        this.$refs.formDiv,
        { opacity: 1 },
        { x: window.innerWidth, duration: 1.5, opacity: 0 }
      )
    },
    changeForm(formName) {
      switch (formName) {
        case 'addQuestion':
          this.addStoryBool = false
          this.addQuestionBool = true
          this.listQuestionBool = false
          this.scoreListBool = false
          this.testBool = false
          this.editQuestionBool = false
          this.editStoryBool = false
          break
        case 'addStory':
          this.addStoryBool = true
          this.addQuestionBool = false
          this.listQuestionBool = false
          this.scoreListBool = false
          this.testBool = false
          this.editQuestionBool = false
          this.editStoryBool = false
          break
        case 'listQuestion':
          this.addStoryBool = false
          this.addQuestionBool = false
          this.listQuestionBool = true
          this.scoreListBool = false
          this.testBool = false
          this.editQuestionBool = false
          this.editStoryBool = false
          break
        case 'scoreList':
          this.addStoryBool = false
          this.addQuestionBool = false
          this.listQuestionBool = false
          this.scoreListBool = true
          this.testBool = false
          this.editQuestionBool = false
          this.editStoryBool = false
          break
        case 'test':
          this.addStoryBool = false
          this.addQuestionBool = false
          this.listQuestionBool = false
          this.scoreListBool = false
          this.testBool = true
          this.editQuestionBool = false
          this.editStoryBool = false
          break
        case 'editStory':
          this.addStoryBool = false
          this.addQuestionBool = false
          this.listQuestionBool = false
          this.scoreListBool = false
          this.testBool = false
          this.editQuestionBool = false
          this.editStoryBool = true
          break
      }
    },
    async fetchStories() {
      const storiesRef = collection(db, 'Story_List')
      const querySnapshot = await getDocs(storiesRef)
      this.stories = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))

      // Set the initial selected story to the first document name
      if (this.stories.length > 0) {
        this.selectedStory = this.stories[0].Name
        this.isLinear = this.stories[0].LinearStory
      }
    },
    onStoryChange() {
      const selected = this.stories.find((story) => story.Name === this.selectedStory)
      if (selected) {
        this.isLinear = selected.LinearStory
      }
      this.animateFormExit('test')
    },
    editQuestion(selectedStory, questionId) {
      this.selectedStory = selectedStory
      this.selectedQuestionId = questionId
      this.listQuestionBool = false
      this.editQuestionBool = true
    },
    cancelEdit() {
      this.editQuestionBool = false
      this.listQuestionBool = true
      this.selectedQuestionId = null
    },
    async confirmDeleteStory() {
      // check if there's only one story left
      if (this.stories.length === 1) {
        alert('Cannot delete the last story.')
        return
      }

      const confirmation = confirm('Are you sure you want to delete this story?')

      if (confirmation) {
        try {
          const storyCollection = `${this.selectedStory}_Question_Bank`

          await this.deleteCollection(storyCollection) //right now, the function just deletes the documents within the collection, not removing it entirely. Will revisit if can

          const storyRef = doc(db, 'Story_List', storyCollection)
          await deleteDoc(storyRef)

          await this.fetchStories()

          alert('Story deleted successfully!')
        } catch (error) {
          console.error('Error deleting story:', error)
          alert('Error deleting the story.')
        }
      }
    },

    async deleteCollection(collectionPath) {
      const collectionRef = collection(db, collectionPath)
      const querySnapshot = await getDocs(collectionRef)

      const batch = writeBatch(db)

      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })

      await batch.commit()

      await this.clearCollection(collectionRef)
    },

    async clearCollection(collectionRef) {
      const querySnapshot = await getDocs(collectionRef)
      const batch = writeBatch(db)

      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })

      await batch.commit()
    }
  }
}
</script>

<style>
.welcome-text {
  position: absolute;
  top: 2.5vh;
  left: 10vw;
}

.secondary-text {
  top: 5vh;
  left: 10vw;
}

::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

.mainpage-button {
  position: absolute;
  width: 15vw;
  height: 5vh;
  right: 5vw;
  top: 5vh;
}

.form-list-button {
  padding: 0px 10px;
  text-align: center;
  text-decoration: none;

  display: inline-block;
  margin: 10px 10px;
  cursor: pointer;
  width: 12.5vw;
  height: 5vh;

  background-color: #f37600;
}

.form-list-button:hover {
  background-color: #4e2e1d;
}

.dashboard-list-buttons {
  position: absolute;
  top: 50%;
  left: 3vw;
  transform: translateY(-50%);
  width: 15vw;
  height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.form-div {
  position: absolute;
  top: 60vh;
  right: 3vw;
  transform: translateY(-50%);
  width: 75vw;
  height: 80vh;
  opacity: 0;
  overflow: scroll;
  overflow-y: auto;
  padding-bottom: 50px;
}

.planned-forms {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  height: 90%;
  background-color: brown;
  color: white;
  text-align: left;
  overflow-y: scroll;
}

.text-strikethrough {
  text-decoration: line-through;
}

.drop-down-story-selector {
  margin-top: 5%;
  width: 10vw;
  height: 5vh;
}

.first-statement-indent {
  margin-left: 5%;
  margin-top: 5%;
}

.statement-indent {
  margin-left: 5%;
  margin-top: 2.5%;
}

.child-statement-indent {
  margin-left: 10%;
}
</style>
