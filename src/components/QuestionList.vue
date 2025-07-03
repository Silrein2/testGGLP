<template>
  <div class="question-list">
    <h2 style="color: white">Question List</h2>
    <div v-if="loading">Loading questions...</div>
    <div v-else-if="questions.length === 0">No questions found.</div>
    <div v-else>
      <div v-for="(question, index) in questions" :key="question.id" class="question-item">
        <div class="reorder-buttons">
          <button @click="moveUp(index)" :disabled="index === 0">↑</button>
          <button @click="moveDown(index)" :disabled="index === questions.length - 1">↓</button>
        </div>
        <h3 style="color: white" @click="toggleDescriptions(question.id)">
          Question ID: {{ question.id }}
        </h3>

        <div class="action-buttons">
          <button class="edit-button" @click="emitEditQuestion(question.id)">Edit</button>
          <button class="delete-button" @click="deleteQuestion(question.id)">Delete</button>
        </div>

        <h4 style="color: white" @click="toggleDescriptions(question.id)">
          Question: {{ question.Question }}
        </h4>

        <div v-if="question.showDescriptions" class="answer-details">
          <AnswerDetail title="Left Answer" :answer="question.LeftAnswer" />
          <div v-if="!isLinear && question.LeftAnswer && question.LeftAnswer.Desc">
            Next question after this Left answer
            <select v-model="question.LeftAnswer.NextQuestion" @mouseleave="clearHover">
              <option :value="null">No Question</option>
              <option
                v-for="q in filteredQuestions(question.id)"
                :key="q.id"
                :value="q.id"
                @mouseover="showQuestionStatement(q.id)"
              >
                {{ q.id }}
              </option>
            </select>
          </div>

          <AnswerDetail title="Middle Answer" :answer="question.MiddleAnswer" />
          <div v-if="!isLinear && question.MiddleAnswer && question.MiddleAnswer.Desc">
            Next question after this Middle answer
            <select v-model="question.MiddleAnswer.NextQuestion" @mouseleave="clearHover">
              <option :value="null">No Question</option>
              <option
                v-for="q in filteredQuestions(question.id)"
                :key="q.id"
                :value="q.id"
                @mouseover="showQuestionStatement(q.id)"
              >
                {{ q.id }}
              </option>
            </select>
          </div>

          <AnswerDetail title="Right Answer" :answer="question.RightAnswer" />
          <div v-if="!isLinear && question.RightAnswer && question.RightAnswer.Desc">
            Next question after this Right answer
            <select v-model="question.RightAnswer.NextQuestion" @mouseleave="clearHover">
              <option :value="null">No Question</option>
              <option
                v-for="q in filteredQuestions(question.id)"
                :key="q.id"
                :value="q.id"
                @mouseover="showQuestionStatement(q.id)"
              >
                {{ q.id }}
              </option>
            </select>
          </div>
        </div>

        <!-- <div class="color-picker">
          <label for="colorPicker">Choose a color:</label>
          <input
            type="color"
            v-model="question.color"
            @input="updateColor(question.id, question.color)"
            id="colorPicker"
          />
          <input
            type="text"
            v-model="question.color"
            @input="updateColorFromHex(question.id, question.color)"
            placeholder="Hex code"
          />
        </div> -->
      </div>
    </div>

    <div class="button-container">
      <button @click="saveOrder">Save Order</button>
      <button @click="resetOrder">Reset Order</button>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase'
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'
import AnswerDetail from '@/components/QuestionList/AnswersDetail.vue'

export default {
  name: 'QuestionList',
  components: {
    AnswerDetail
  },
  props: {
    selectedStory: {
      type: String,
      required: true
    },
    isLinear: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      questions: [],
      loading: true,
      originalQuestions: [],
      hoveredQuestion: ''
    }
  },
  mounted() {
    this.fetchQuestions()
  },
  methods: {
    async fetchQuestions() {
      try {
        const querySnapshot = await getDocs(collection(db, `${this.selectedStory}_Question_Bank`))
        this.questions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          showDescriptions: false,
          // LinearStory: doc.data().LinearStory, // Shouldn't be uncommented unless the variable is present in Firestore (currently it doesn't)
          ...doc.data()
        }))
        this.originalQuestions = JSON.parse(JSON.stringify(this.questions))
      } catch (error) {
        console.error('Error fetching questions: ', error)
      } finally {
        this.loading = false
      }
    },
    toggleDescriptions(questionId) {
      const question = this.questions.find((q) => q.id === questionId)
      if (question) {
        question.showDescriptions = !question.showDescriptions
      }
    },
    showQuestionStatement(questionId) {
      const question = this.questions.find((q) => q.id === questionId)
      if (question) {
        this.hoveredQuestion = question.Question
      }
    },
    clearHover() {
      this.hoveredQuestion = ''
    },
    filteredQuestions(currentId) {
      return this.questions.filter((q) => q.id !== currentId) // Exclude the current question ID
    },
    moveUp(index) {
      if (index > 0) {
        const temp = this.questions[index]
        this.questions[index] = this.questions[index - 1]
        this.questions[index - 1] = temp
      }
    },
    moveDown(index) {
      if (index < this.questions.length - 1) {
        const temp = this.questions[index]
        this.questions[index] = this.questions[index + 1]
        this.questions[index + 1] = temp
      }
    },
    deleteQuestion(questionId) {
      if (confirm('Are you sure you want to delete this question?')) {
        this.questions = this.questions.filter((q) => q.id !== questionId)
      }
    },
    async saveOrder() {
      if (confirm('Are you sure you want to save the new order?')) {
        try {
          // Save selected NextQuestion values to Firestore
          for (const question of this.questions) {
            const docRef = doc(db, `${this.selectedStory}_Question_Bank`, question.id)
            const updates = {}

            if (question.LeftAnswer && question.LeftAnswer.Desc) {
              updates.LeftAnswer = {
                ...question.LeftAnswer,
                NextQuestion: question.LeftAnswer.NextQuestion
              }
            }

            if (question.MiddleAnswer && question.MiddleAnswer.Desc) {
              updates.MiddleAnswer = {
                ...question.MiddleAnswer,
                NextQuestion: question.MiddleAnswer.NextQuestion
              }
            }

            if (question.RightAnswer && question.RightAnswer.Desc) {
              updates.RightAnswer = {
                ...question.RightAnswer,
                NextQuestion: question.RightAnswer.NextQuestion
              }
            }

            await setDoc(docRef, updates, { merge: true })
          }

          for (const question of this.originalQuestions) {
            const docRef = doc(db, `${this.selectedStory}_Question_Bank`, question.id)
            await deleteDoc(docRef)
          }

          const questionsToSave = this.questions
          for (let i = 0; i < questionsToSave.length; i++) {
            const newId = String(i)
            const docRef = doc(db, `${this.selectedStory}_Question_Bank`, newId)
            await setDoc(docRef, {
              ...questionsToSave[i],
              id: newId
            })
            questionsToSave[i].id = newId
          }

          this.originalQuestions = JSON.parse(JSON.stringify(this.questions))
          alert('Order saved successfully!')
        } catch (error) {
          console.error('Error saving order: ', error)
          alert('Error saving order.')
        }
      }
    },
    resetOrder() {
      if (confirm('Are you sure you want to reset the order?')) {
        this.questions = JSON.parse(JSON.stringify(this.originalQuestions))
        alert('Order reset to original!')
      }
    },
    emitEditQuestion(id) {
      console.log('Id question list:' + id)
      this.$emit('edit-question', this.selectedStory, id)
    }
  }
}
</script>

<style scoped>
.question-list {
  padding: 20px;
  color: white;
  height: 100%;
  overflow-y: auto;
}

.question-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #333;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-x: auto;
}

.answer-details {
  display: flex;
  margin-top: 10px;
}

.button-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.button-container button {
  margin: 0 10px;
  padding: 10px 15px;
  cursor: pointer;
}

.reorder-buttons {
  display: flex;
  flex-direction: column;
  margin-right: 10px;
}

.reorder-buttons button {
  padding: 5px 10px;
  margin: 2px 0;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  margin-top: 10px;
}

.edit-button,
.delete-button {
  padding: 5px 10px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  margin-left: 5px;
}

.edit-button {
  background-color: #007bff;
  color: white;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.hover-statement {
  position: relative;
  background-color: #222;
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 10;
}

.color-picker {
  margin-top: 10px;
}

.color-picker input[type='color'] {
  width: 50px;
  height: 30px;
  border: none;
  cursor: pointer;
}

.color-picker input[type='text'] {
  width: 100px;
  padding: 5px;
  margin-left: 10px;
}
</style>
