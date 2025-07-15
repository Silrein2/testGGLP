<template>
  <div class="score-list">
    <h2 style="color: white">Score List</h2>
    <div class="filter-options">
      <label for="sort-by" style="color: white">Sort by:</label>
      <select id="sort-by" v-model="sortBy" @change="sortScores">
        <option value="id">ID</option>
        <option value="EmpathyScore">Empathy Score</option>
        <option value="TimesPlayed">Times Played</option>
      </select>
      <button class="export-button" @click="exportToExcel">Export to XLSX</button>
    </div>
    <div v-if="loading">Loading scores...</div>
    <div v-else-if="scores.length === 0">No scores found.</div>
    <div v-else class="score-list-container">
      <div v-for="score in sortedScores" :key="score.id" class="score-item">
        <h3 style="color: white">ID: {{ score.id }}</h3>
        <h4 style="color: white">Name: {{ score.Name }}</h4>

        <div v-for="story in stories" :key="story.Name">
          <p style="color: white">
            {{ story.Name }} Scores: {{ getStoryScoreValue(score, story.Name) }}
          </p>
        </div>

        <p style="color: white">Empathy Score: {{ score.EmpathyScore }}</p>
        <p style="color: white">Times Played: {{ score.TimesPlayed }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'
import * as XLSX from 'xlsx'

export default {
  name: 'ScoreList',
  data() {
    return {
      scores: [],
      loading: true,
      sortBy: 'id', // default sorting
      stories: []
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
    this.fetchStories()
    this.fetchScores()
  },
  methods: {
    sanitizeStoryNameForFirestore(storyName) {
      //for the purpose of avoiding the variable turned into map within Firestore.
      //space and period is removed so that the name becomes a single string
      return storyName.replace(/\./g, '').replace(/\s/g, '')
    },

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
    },
    async fetchStories() {
      try {
        const querySnapshot = await getDocs(collection(db, 'Story_List'))
        this.stories = querySnapshot.docs.map((doc) => doc.data())
      } catch (error) {
        console.error('Error fetching stories: ', error)
      }
    },
    getStoryScoreValue(scoreItem, storyName) {
      const sanitizedStoryName = this.sanitizeStoryNameForFirestore(storyName)
      const scoreKey = `${sanitizedStoryName}Score`

      return scoreItem && scoreItem[scoreKey] != null ? scoreItem[scoreKey] : 0
    },
    exportToExcel() {
      const data = this.sortedScores.map((score) => {
        const row = {
          ID: score.id,
          Name: score.Name,
          EmpathyScore: score.EmpathyScore,
          TimesPlayed: score.TimesPlayed
        }
        this.stories.forEach((story) => {
          // Sanitize the story name to create the correct scoreKey for lookup
          const sanitizedStoryName = this.sanitizeStoryNameForFirestore(story.Name)
          const scoreKey = `${sanitizedStoryName}Score`
          row[`${story.Name} Scores`] = score[scoreKey] != null ? score[scoreKey] : 0
        })
        return row
      })

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Scores')

      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')

      const timestamp = `${day}${month}${year}_${hours}${minutes}`
      const filename = `PlayCeria_Scores_${timestamp}.xlsx`

      XLSX.writeFile(wb, filename)
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

.export-button {
  margin-left: 10px;

  border-radius: 5px;

  background-color: #f5962c;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  color: #fcdfc2;
  font-size: 1vw;
  font-weight: 700;

  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.export-button:hover {
  background-color: #4e2e1d;
}
</style>
