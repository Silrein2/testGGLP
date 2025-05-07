<template>
  <div ref="formContent" class="form-content">
    <h3 style="color: white">Question</h3>
    <div class="text-box top-box">
      <textarea v-model="questionText" placeholder="Enter question here"></textarea>
    </div>

    <div class="row-boxes">
      <div class="text-box">
        <h3 style="color: white">Left Answer</h3>
        <textarea v-model="leftDesc" placeholder="Enter left description"></textarea>
        <textarea v-model="leftResult" placeholder="Enter left result"></textarea>

        <h3 style="color: white">Care</h3>
        <input type="number" v-model.number="leftCare" placeholder="Care" />

        <h3 style="color: white">Respect</h3>
        <input type="number" v-model.number="leftRespect" placeholder="Respect" />

        <h3 style="color: white">Understanding</h3>
        <input type="number" v-model.number="leftUnderstanding" placeholder="Understanding" />
      </div>
      <div class="text-box">
        <h3 style="color: white">Middle Answer</h3>
        <textarea v-model="middleDesc" placeholder="Enter middle description"></textarea>
        <textarea v-model="middleResult" placeholder="Enter middle result"></textarea>

        <h3 style="color: white">Care</h3>
        <input type="number" v-model.number="middleCare" placeholder="Care" />

        <h3 style="color: white">Respect</h3>
        <input type="number" v-model.number="middleRespect" placeholder="Respect" />

        <h3 style="color: white">Understanding</h3>
        <input type="number" v-model.number="middleUnderstanding" placeholder="Understanding" />
      </div>
      <div class="text-box">
        <h3 style="color: white">Right Answer</h3>
        <textarea v-model="rightDesc" placeholder="Enter right description"></textarea>
        <textarea v-model="rightResult" placeholder="Enter right result"></textarea>

        <h3 style="color: white">Care</h3>
        <input type="number" v-model.number="rightCare" placeholder="Care" />

        <h3 style="color: white">Respect</h3>
        <input type="number" v-model.number="rightRespect" placeholder="Respect" />

        <h3 style="color: white">Understanding</h3>
        <input type="number" v-model.number="rightUnderstanding" placeholder="Understanding" />
      </div>
    </div>

    <div class="button-row">
      <button class="action-button" @click="updateFirebaseVariables()">Update</button>
      <button class="action-button" @click="cancelEdit()">Cancel</button>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

export default {
  name: 'EditQuestion',
  props: {
    questionId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      questionText: '',

      leftDesc: '',
      leftResult: '',
      leftCare: 0,
      leftRespect: 0,
      leftUnderstanding: 0,

      middleDesc: '',
      middleResult: '',
      middleCare: 0,
      middleRespect: 0,
      middleUnderstanding: 0,

      rightDesc: '',
      rightResult: '',
      rightCare: 0,
      rightRespect: 0,
      rightUnderstanding: 0
    }
  },
  mounted() {
    this.loadQuestionData()
  },
  methods: {
    async loadQuestionData() {
      try {
        const docRef = doc(db, 'Question_Bank', this.questionId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          this.questionText = data.Question

          if (data.LeftAnswer) {
            this.leftDesc = data.LeftAnswer.Desc
            this.leftResult = data.LeftAnswer.Result
            this.leftCare = data.LeftAnswer.Care || 0
            this.leftRespect = data.LeftAnswer.Respect || 0
            this.leftUnderstanding = data.LeftAnswer.Understanding || 0
          }

          if (data.MiddleAnswer) {
            this.middleDesc = data.MiddleAnswer.Desc
            this.middleResult = data.MiddleAnswer.Result
            this.middleCare = data.MiddleAnswer.Care || 0
            this.middleRespect = data.MiddleAnswer.Respect || 0
            this.middleUnderstanding = data.MiddleAnswer.Understanding || 0
          }

          if (data.RightAnswer) {
            this.rightDesc = data.RightAnswer.Desc
            this.rightResult = data.RightAnswer.Result
            this.rightCare = data.RightAnswer.Care || 0
            this.rightRespect = data.RightAnswer.Respect || 0
            this.rightUnderstanding = data.RightAnswer.Understanding || 0
          }
        } else {
          alert('No such document!')
        }
      } catch (error) {
        console.error('Error getting document:', error)
        alert('Error loading question data')
      }
    },
    async updateFirebaseVariables() {
      try {
        const docRef = doc(db, 'Question_Bank', this.questionId)

        await updateDoc(docRef, {
          Question: this.questionText,
          LeftAnswer:
            this.leftDesc || this.leftResult
              ? {
                  Desc: this.leftDesc,
                  Result: this.leftResult,
                  Care: this.leftCare,
                  Respect: this.leftRespect,
                  Understanding: this.leftUnderstanding
                }
              : null,
          MiddleAnswer:
            this.middleDesc || this.middleResult
              ? {
                  Desc: this.middleDesc,
                  Result: this.middleResult,
                  Care: this.middleCare,
                  Respect: this.middleRespect,
                  Understanding: this.middleUnderstanding
                }
              : null,
          RightAnswer:
            this.rightDesc || this.rightResult
              ? {
                  Desc: this.rightDesc,
                  Result: this.rightResult,
                  Care: this.rightCare,
                  Respect: this.rightRespect,
                  Understanding: this.rightUnderstanding
                }
              : null
        })

        alert('Question updated successfully!')
        this.$emit('cancel-edit')
      } catch (error) {
        console.error('Error updating document: ', error)
        alert('Error updating question')
      }
    },
    cancelEdit() {
      this.$emit('cancel-edit')
    }
  }
}
</script>

<style scoped>
.form-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 95%;
  height: 95%;
  background-color: black;
  overflow: auto;
  padding: 20px;
  box-sizing: border-box;
}

.text-box {
  margin-bottom: 15px;
}

.text-box textarea,
.text-box input[type='number'] {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  resize: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: #f8f8f8;
  color: #333;
}

.text-box textarea {
  height: 100px;
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
  transition: background-color 0.3s ease;
}

.action-button:hover {
  background-color: #0056b3;
}

h3 {
  color: white;
  margin-bottom: 10px;
}

input[type='number'] {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
</style>
