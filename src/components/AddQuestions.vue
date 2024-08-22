<template>
  <div ref="formContent" class="form-content">
    <h3 style="color: white">Question</h3>
    <div class="text-box top-box">
      <textarea v-model="questionText" placeholder="Enter question here"></textarea>
    </div>

    <div class="row-boxes">
      <div class="text-box">
        <h3 style="color: white">Left Result</h3>
        <textarea v-model="leftResult" placeholder="Enter left result"></textarea>
      </div>
      <div class="text-box">
        <h3 style="color: white">Bottom Result</h3>
        <textarea v-model="bottomResult" placeholder="Enter bottom result"></textarea>
      </div>
      <div class="text-box">
        <h3 style="color: white">Right Result</h3>
        <textarea v-model="rightResult" placeholder="Enter right result"></textarea>
      </div>
    </div>

    <div class="button-row">
      <button class="action-button" @click="checkForm()">Submit</button>
      <button class="action-button" @click="handleCancel">Cancel</button>
    </div>
  </div>
</template>

<script>
// import { gsap } from 'gsap'

import { ref, onValue, update, get } from 'firebase/database'
import { database } from '@/firebase'

export default {
  name: 'AddQuestions',
  data() {
    return {
      arrayLength: null,

      questionText: '',
      leftResult: '',
      bottomResult: '',
      rightResult: ''
    }
  },
  mounted() {
    this.getFirebaseVariables()
  },
  methods: {
    getFirebaseVariables() {
      const databasePrompt = ref(database, 'responsePrompt')

      onValue(databasePrompt, (snapshot) => {
        const data = snapshot.val()

        if (data) {
          this.arrayLength = Object.keys(data).length
          console.log(this.arrayLength)
        }
      })
    },
    checkForm() {
      if (this.questionText == '') {
        alert('The question part must be filled')
      } else if (this.leftResult == '' && this.bottomResult == '' && this.rightResult == '') {
        alert('At least 1 result must be filled in')
      } else {
        this.saveFirebaseVariables()
      }
    },
    saveFirebaseVariables() {
      const responsesToAdd = {
        questionDone: false,
        repeatQuestion: false,
        repeatText: 'Question has been answered',
        resultBottom: this.bottomResult,
        resultLeft: this.leftResult,
        resultRight: this.rightResult,
        text: this.questionText
      }

      const databaseRef = ref(database, 'responsePrompt')

      get(databaseRef)
        .then((snapshot) => {
          const currentQuestions = snapshot.val() || {}
          const questionCount = Object.keys(currentQuestions).length
          const newQuestionKey = `question${questionCount + 1}`

          const updates = {
            [newQuestionKey]: responsesToAdd
          }

          return update(databaseRef, updates)
        })
        .then(() => {
          alert('Responses submitted!')

          this.bottomResult = ''
          this.leftResult = ''
          this.rightResult = ''
          this.questionText = ''
        })
        .catch((error) => {
          console.error('Error updating database:', error)
        })
    }
  }
}
</script>

<style>
.form-content {
  position: absolute;

  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);

  width: 95%;
  height: 95%;

  background-color: black;

  overflow: auto;
}

.text-box {
  margin-bottom: 1%;
}

.text-box textarea {
  position: relative;

  margin-top: 1%;
  top: 5%;

  width: 90%;
  height: 150px;

  resize: none;
  overflow: auto;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.row-boxes {
  display: flex;
  gap: 2%;
}

.row-boxes .text-box {
  flex: 1;
}

.button-row {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.action-button {
  padding: 10px 20px;
  margin: 0 2.5%;

  background-color: #007bff;
  color: white;

  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-button:hover {
  background-color: #0056b3;
}
</style>
