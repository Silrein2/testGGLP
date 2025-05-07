<template>
  <div class="score-list">
    <h2 style="color: white">Score List</h2>
    <div class="filter-options">
      <label for="sort-by" style="color: white">Sort by:</label>
      <select id="sort-by" v-model="sortBy" @change="sortScores">
        <option value="id">ID</option>
        <option value="CareScore">Care Score</option>
        <option value="RespectScore">Respect Score</option>
        <option value="UnderstandingScore">Understanding Score</option>
        <option value="EmpathyScore">Empathy Score</option>
      </select>
    </div>
    <div v-if="loading">Loading scores...</div>
    <div v-else-if="scores.length === 0">No scores found.</div>
    <div v-else class="score-list-container">
      <div v-for="score in sortedScores" :key="score.id" class="score-item">
        <h3 style="color: white">ID: {{ score.id }}</h3>
        <h4 style="color: white">Name: {{ score.Name }}</h4>
        <p style="color: white">Care Score: {{ score.CareScore }}</p>
        <p style="color: white">Respect Score: {{ score.RespectScore }}</p>
        <p style="color: white">Understanding Score: {{ score.UnderstandingScore }}</p>
        <p style="color: white">Empathy Score: {{ score.EmpathyScore }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default {
  name: 'ScoreList',
  data() {
    return {
      scores: [],
      loading: true,
      sortBy: 'id' //default sorting
    }
  },
  computed: {
    sortedScores() {
      let sorted = [...this.scores]

      sorted.sort((a, b) => {
        if (this.sortBy === 'id') {
          return parseInt(a.id) - parseInt(b.id)
        } else {
          const scoreA = a[this.sortBy]
          const scoreB = b[this.sortBy]

          if (scoreB === scoreA) {
            return parseInt(a.id) - parseInt(b.id)
          }

          return scoreB - scoreA
        }
      })

      return sorted
    }
  },
  mounted() {
    this.fetchScores()
  },
  methods: {
    async fetchScores() {
      try {
        const querySnapshot = await getDocs(collection(db, 'Score'))
        this.scores = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error fetching scores: ', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.score-list {
  padding: 20px;
  color: white;
  height: 100%;
  overflow-y: auto;
}

.score-list-container {
  overflow-y: auto;
  height: calc(100% - 50px);
}

.score-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #333;
}

.filter-options {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.filter-options label {
  margin-right: 10px;
}

.filter-options select {
  padding: 5px;
  border-radius: 4px;
}
</style>
