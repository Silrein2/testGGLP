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
        <h4 style="color: white" @click="toggleDescriptions(question.id)">
          Question: {{ question.Question }}
        </h4>

        <div v-if="question.showDescriptions" class="answer-details">
          <AnswerDetail title="Left Answer" :answer="question.LeftAnswer" />
          <AnswerDetail title="Middle Answer" :answer="question.MiddleAnswer" />
          <AnswerDetail title="Right Answer" :answer="question.RightAnswer" />
        </div>
        <div class="action-buttons">
          <button class="edit-button" @click="emitEditQuestion(question.id)">Edit</button>
          <button class="delete-button" @click="deleteQuestion(question.id)">Delete</button>
        </div>
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
  data() {
    return {
      questions: [],
      loading: true,
      originalQuestions: []
    }
  },
  mounted() {
    this.fetchQuestions()
  },
  methods: {
    async fetchQuestions() {
      try {
        const querySnapshot = await getDocs(collection(db, 'Question_Bank'))
        this.questions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          showDescriptions: false,
          ...doc.data()
        }))
        this.originalQuestions = JSON.parse(JSON.stringify(this.questions)) // Deep copy for reset
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
          // Delete existing documents
          for (const question of this.originalQuestions) {
            const docRef = doc(collection(db, 'Question_Bank'), question.id)
            await deleteDoc(docRef)
          }

          // Add documents with new IDs, excluding deleted questions
          const questionsToSave = this.questions
          for (let i = 0; i < questionsToSave.length; i++) {
            const newId = String(i)
            const docRef = doc(collection(db, 'Question_Bank'), newId)
            await setDoc(docRef, {
              ...questionsToSave[i],
              id: newId // Update the id field in the data
            })
            questionsToSave[i].id = newId // Update the id in the local array
          }

          this.originalQuestions = JSON.parse(JSON.stringify(this.questions)) // Update originalQuestions
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
      this.$emit('edit-question', id)
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
  align-items: center;
  justify-content: space-between; /* Added to align items */
}

.answer-details {
  display: flex;
  justify-content: space-around;
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
}

.edit-button,
.delete-button {
  padding: 5px 10px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  margin-left: 5px; /* Added some spacing between buttons */
}

.edit-button {
  background-color: #007bff;
  color: white;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}
</style>
