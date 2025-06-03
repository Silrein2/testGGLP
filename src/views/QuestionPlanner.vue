<template>
  <div class="question-planner">
    <div class="upper-section">
      <h2>Question Planner</h2>
      <div class="scrollable-container">
        <div class="question-container">
          <div class="question-input-container">
            <input
              v-model="QuestionBank[0].Question"
              placeholder="What is the question?"
              class="question-input"
            />
            <button @click="addQuestion" v-if="!showLeftAnswer" class="add-button top-right">
              +
            </button>
            <button class="add-button bottom-right" v-if="showLeftAnswer">+</button>
          </div>
          <div class="left-answer-container" v-if="showLeftAnswer">
            <button class="add-button left-result-button">+</button>
            <input
              v-model="QuestionBank[0].LeftAnswer.Desc"
              placeholder="What is the Left Answer?"
              class="left-answer-input"
            />
            <input
              v-model="QuestionBank[0].LeftAnswer.Result"
              placeholder="What is the Left Result?"
              class="left-result-input"
            />
            <div class="number-inputs">
              <div>
                <label>Care</label>
                <input
                  v-model.number="QuestionBank[0].LeftAnswer.Care"
                  type="number"
                  class="number-input"
                />
              </div>
              <div>
                <label>Respect</label>
                <input
                  v-model.number="QuestionBank[0].LeftAnswer.Respect"
                  type="number"
                  class="number-input"
                />
              </div>
              <div>
                <label>Understanding</label>
                <input
                  v-model.number="QuestionBank[0].LeftAnswer.Understanding"
                  type="number"
                  class="number-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="lower-section">
      <button @click="saveData" class="save-button">Save</button>
      <button class="cancel-button">Cancel</button>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase'
import { collection, setDoc, doc } from 'firebase/firestore'

export default {
  data() {
    return {
      QuestionBank: [
        {
          id: '0',
          showDescriptions: false,
          Question: '',
          LeftAnswer: {
            Desc: '',
            Result: '',
            Care: 0,
            Respect: 0,
            Understanding: 0
          },
          MiddleAnswer: {
            Desc: 'test',
            Result: 'test',
            Care: 0,
            Respect: 0,
            Understanding: 0
          },
          RightAnswer: {
            Desc: 'test',
            Result: 'test',
            Care: 0,
            Respect: 0,
            Understanding: 0
          }
        }
      ],
      showLeftAnswer: false // Control visibility of LeftAnswer input
    }
  },
  methods: {
    addQuestion() {
      this.showLeftAnswer = true // Show LeftAnswer input when plus sign is clicked
    },
    async saveData() {
      try {
        const docRef = doc(collection(db, 'Test'), String(this.QuestionBank[0].id))
        await setDoc(docRef, this.QuestionBank[0])
        alert('Data saved successfully!')
      } catch (error) {
        console.error('Error saving data:', error)
        alert('Error saving data')
      }
    }
  }
}
</script>

<style scoped>
.question-planner {
  padding: 20px;
}

.upper-section {
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 20px;
}

.scrollable-container {
  max-height: 200px; /* Set a max height for scrolling */
  overflow: auto; /* Enable scrolling */
}

.question-container {
  display: flex;
  flex-direction: column; /* Stack elements vertically */
  position: relative; /* For positioning buttons */
}

.question-input-container {
  display: flex;
  align-items: center; /* Align items vertically */
  position: relative; /* Positioning for absolute elements */
}

.add-button {
  cursor: pointer;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  margin-left: 10px; /* Space between button and input */
}

.top-right {
  position: absolute;
  top: 5px; /* Adjust top position */
  right: 5px; /* Align right */
}

.bottom-right {
  position: absolute;
  bottom: 5px; /* Adjust bottom position */
  right: 5px; /* Align right */
}

.left-answer-container {
  display: flex;
  flex-direction: column;
  margin-top: 10px; /* Space above the left answer */
}

.left-answer-input {
  padding: 8px;
  margin-bottom: 5px; /* Space below the LeftAnswer input */
}

.left-result-input {
  padding: 8px;
  margin-bottom: 5px; /* Space below the LeftResult input */
}

.number-inputs {
  display: flex;
  justify-content: space-between; /* Space out the inputs */
}

.number-input {
  width: 70px; /* Adjust the width for numeric inputs */
  margin-right: 10px; /* Space between inputs */
}

.question-input {
  width: 300px;
  padding: 8px;
  margin-right: auto; /* Align to the left */
}

.lower-section {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.save-button,
.cancel-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.cancel-button {
  background-color: #ccc;
}
</style>
