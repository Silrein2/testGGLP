<template>
  <div id="background-container">
    <button class="mainpage-button decision-button" @click="toMainPage()">Main Page</button>

    <h1 ref="mainText" class="welcome-text">{{ welcomeText }}</h1>
    <h3 ref="secondaryText" class="secondary-text">{{ noticeText }}: {{ selectedStory }}</h3>

    <div ref="dashboardList" class="dashboard-list-buttons">
      <select v-model="selectedStory" @change="onStoryChange">
        <option v-for="story in stories" :key="story.id" :value="story.Name">
          {{ story.Name }}
        </option>
      </select>
      <button class="form-list-button" @click="animateFormExit('addStory')">
        <h3>Add Story</h3>
      </button>
      <button class="form-list-button" @click="animateFormExit('addQuestion')">
        <h3>Add Questions</h3>
      </button>
      <button class="form-list-button" @click="animateFormExit('listQuestion')">
        <h3>Question List</h3>
      </button>
      <button class="form-list-button" @click="animateFormExit('scoreList')">
        <h3>Score List</h3>
      </button>
      <button class="form-list-button" @click="animateFormExit('test')">
        <h3>Things to do</h3>
      </button>
    </div>

    <div ref="formDiv" class="form-div">
      <AddStory v-if="addStoryBool" />
      <AddQuestions v-if="addQuestionBool" :selectedStory="selectedStory" />
      <QuestionList
        v-if="listQuestionBool"
        :selectedStory="selectedStory"
        @edit-question="editQuestion"
      />
      <ScoreList v-if="scoreListBool" />
      <div class="planned-forms" v-if="testBool">
        <h3 style="margin-left: 5%">
          Planned Forms: Add Questions, View Questions, Edit Questions, Delete Questions
        </h3>
        <h4 class="text-strikethrough" style="margin-left: 10%">- Add Questions</h4>
        <h4 class="text-strikethrough" style="margin-left: 10%">- View Questions</h4>
        <h5 class="text-strikethrough" style="margin-left: 15%">+ Edit Questions</h5>
        <h5 class="text-strikethrough" style="margin-left: 15%">+ Delete Questions</h5>
        <h3 class="text-strikethrough" style="margin-left: 5%">
          Edit and Delete will be within View Questions
        </h3>
      </div>
      <EditQuestion
        v-if="editQuestionBool"
        :questionId="selectedQuestionId"
        @cancel-edit="cancelEdit"
      />
    </div>
  </div>
</template>

<script>
import { gsap } from 'gsap'
import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'

import AddQuestions from '@/components/AddQuestions.vue'
import QuestionList from '@/components/QuestionList.vue'
import EditQuestion from '@/components/EditQuestion.vue'
import ScoreList from '@/components/ScoreList.vue'

import AddStory from '@/components/AddStory.vue'

export default {
  name: 'DashboardPage',
  components: {
    AddQuestions,
    QuestionList,
    EditQuestion,
    ScoreList,
    AddStory
  },
  data() {
    return {
      welcomeText: 'Dashboard',
      noticeText: 'Currently selecting ',

      arrayLength: null,

      addQuestionBool: false,
      listQuestionBool: false,
      scoreListBool: false,
      testBool: true,
      editQuestionBool: false,
      selectedQuestionId: null,

      addStoryBool: false,

      stories: [],
      selectedStory: ''
    }
  },
  async mounted() {
    this.$setBackgroundImage()
    this.$updateBackgroundSize()

    await this.fetchStories()

    this.animateTexts()
    this.animateDashboardList()

    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
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
    animateDashboardList() {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.fromTo(
            this.$refs.formDiv,
            { x: window.innerWidth, opacity: 0 },
            { x: '0%', duration: 2, opacity: 1 }
          )
        }
      })

      tl.fromTo(
        this.$refs.dashboardList,
        { x: -window.innerWidth, opacity: 0 },
        { x: '5%', duration: 2, delay: 2, opacity: 1 }
      )
    },
    animateFormExit(formName) {
      const tl = gsap.timeline({
        onComplete: () => {
          this.changeForm(formName)

          gsap.fromTo(
            this.$refs.formDiv,
            { x: window.innerWidth, opacity: 0 },
            { x: '0%', duration: 2, opacity: 1 }
          )
        }
      })

      tl.fromTo(
        this.$refs.formDiv,
        { opacity: 1 },
        { x: window.innerWidth, duration: 2, opacity: 0 }
      )
    },
    changeForm(formName) {
      //meant to change forms

      switch (formName) {
        case 'addQuestion':
          this.addQuestionBool = true
          this.listQuestionBool = false
          this.scoreListBool = false
          this.testBool = false
          this.editQuestionBool = false
          break

        case 'listQuestion':
          this.addQuestionBool = false
          this.listQuestionBool = true
          this.scoreListBool = false
          this.testBool = false
          this.editQuestionBool = false
          break

        case 'scoreList':
          this.addQuestionBool = false
          this.listQuestionBool = false
          this.scoreListBool = true
          this.testBool = false
          this.editQuestionBool = false
          break

        case 'test':
          this.addQuestionBool = false
          this.listQuestionBool = false
          this.scoreListBool = false
          this.testBool = true
          this.editQuestionBool = false
          break
      }

      if (formName == 'addQuestion') {
        this.addStoryBool = false
        this.addQuestionBool = true
        this.listQuestionBool = false
        this.scoreListBool = false
        this.testBool = false
        this.editQuestionBool = false
      } else if (formName == 'addStory') {
        this.addStoryBool = true
        this.addQuestionBool = false
        this.listQuestionBool = false
        this.scoreListBool = false
        this.testBool = false
        this.editQuestionBool = false
      } else if (formName == 'listQuestion') {
        this.addStoryBool = false
        this.addQuestionBool = false
        this.listQuestionBool = true
        this.scoreListBool = false
        this.testBool = false
        this.editQuestionBool = false
      } else if (formName == 'scoreList') {
        this.addStoryBool = false
        this.addQuestionBool = false
        this.listQuestionBool = false
        this.scoreListBool = true
        this.testBool = false
        this.editQuestionBool = false
      } else {
        this.addStoryBool = false
        this.addQuestionBool = false
        this.listQuestionBool = false
        this.scoreListBool = false
        this.testBool = true
        this.editQuestionBool = false
      }
    },
    handleResize() {
      // Call updateBackgroundSize when the window is resized
      // this.updateBackgroundSize()
    },
    editQuestion(questionId) {
      this.selectedQuestionId = questionId
      this.listQuestionBool = false
      this.editQuestionBool = true
      this.addQuestionBool = false
      this.scoreListBool = false
      this.testBool = false
    },
    cancelEdit() {
      this.editQuestionBool = false
      this.listQuestionBool = true
      this.selectedQuestionId = null
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
      }
    },
    onStoryChange() {
      // Handle change in selected story if needed
    }
  }
}
</script>

<style>
.welcome-text {
  position: absolute;

  top: 2.5vh;
  left: 10vw;

  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.secondary-text {
  top: 5vh;
  left: 10vw;

  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

.decision-button {
  background-color: #4caf50;

  border: none;
  color: white;

  padding: 10px 20px;
  text-align: center;
  text-decoration: none;

  display: inline-block;
  font-size: 16px;
  margin: 0 10px;
  cursor: pointer;

  width: 5vw;
  height: 5vh;
}

.mainpage-button {
  position: fixed;

  width: 7vw;
  height: 5vh;

  right: 5vw;
  top: 5vh;
}

.form-list-button {
  background-color: blueviolet;

  border: none;
  color: white;

  padding: 0px 20px;
  text-align: center;
  text-decoration: none;

  display: inline-block;
  font-size: 16px;
  margin: 10px 10px;
  cursor: pointer;

  width: 80%;
  height: 10%;
}

.dashboard-list-buttons {
  position: fixed;

  top: 50%;
  left: 3vw;

  transform: translateY(-50%);

  width: 15vw;
  height: 70vh;

  background-color: #4caf50;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.form-div {
  position: fixed;

  top: 50%;
  right: 3vw;

  transform: translateY(-50%);

  width: 70vw;
  height: 70vh;

  background-color: aqua;

  opacity: 0;

  overflow: hidden;
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
}

.text-strikethrough {
  text-decoration: line-through;
}
</style>
