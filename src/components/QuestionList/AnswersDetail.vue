<template>
  <div class="answer-detail">
    <h5 style="color: white">{{ title }}</h5>
    <div v-if="answer">
      <p style="color: white" @click="toggleDetails">Description: {{ answer.Desc }}</p>
      <p style="color: white" @click="toggleDetails">Result: {{ answer.Result }}</p>
      <div v-if="showDetails">
        <p style="color: white">Care: {{ answer.Care }}</p>
        <p style="color: white">Respect: {{ answer.Respect }}</p>
        <p style="color: white">Understanding: {{ answer.Understanding }}</p>
      </div>
    </div>
    <div v-else>
      <p style="color: white">No data available.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnswerDetail',
  props: {
    title: {
      type: String,
      required: true
    },
    answer: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showDetails: false // Initially hide details. Click on the question/id to reveal details
    }
  },
  methods: {
    toggleDetails() {
      this.showDetails = !this.showDetails
    }
  }
}
</script>

<style scoped>
.answer-detail {
  padding: 10px;
  border: 1px solid #555;
  border-radius: 5px;
  background-color: #444;
  width: 30%;
}
</style>
