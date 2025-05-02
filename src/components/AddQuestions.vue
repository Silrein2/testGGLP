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
      <button class="action-button" @click="checkForm()">Submit</button>
      <button class="action-button" @click="resetForm()">Reset</button>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase'
import { collection, doc, setDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'

export default {
  name: 'AddQuestions',
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
  methods: {
    checkForm() {
      if (this.questionText === '') {
        alert('The question part must be filled')
      } else if (this.leftDesc === '' && this.middleDesc === '' && this.rightDesc === '') {
        alert('At least 1 result must be filled in')
      } else {
        this.saveFirebaseVariables()
      }
    },
    async saveFirebaseVariables() {
      try {
        const nextId = await this.getNextQuestionId()

        const docRef = doc(collection(db, 'Question_Bank'), String(nextId))

        // Set the data for the new document
        await setDoc(docRef, {
          id: String(nextId), // Include the id
          showDescriptions: false, // Include showDescriptions, default to false
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

        alert('Responses submitted with ID: ' + nextId)
        this.resetForm()
      } catch (error) {
        console.error('Error adding document: ', error)
        alert('Error submitting responses')
      }
    },
    resetForm() {
      this.questionText = ''

      this.leftDesc = ''
      this.leftResult = ''
      this.leftCare = 0
      this.leftRespect = 0
      this.leftUnderstanding = 0

      this.middleDesc = ''
      this.middleResult = ''
      this.middleCare = 0
      this.middleRespect = 0
      this.middleUnderstanding = 0

      this.rightDesc = ''
      this.rightResult = ''
      this.rightCare = 0
      this.rightRespect = 0
      this.rightUnderstanding = 0

      alert('Form resetted')
    },
    async getNextQuestionId() {
      const questionBankCollection = collection(db, 'Question_Bank')
      const q = query(questionBankCollection, orderBy('__name__', 'desc'), limit(1))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return 0
      } else {
        const lastDoc = querySnapshot.docs[0]
        const lastId = parseInt(lastDoc.id, 10)
        return isNaN(lastId) ? 0 : lastId + 1
      }
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

/* Style for number inputs */
input[type='number'] {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
</style>
