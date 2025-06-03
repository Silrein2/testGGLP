<template>
  <div class="dropdown">
    <button @mouseover="showMenu" @mouseleave="hideMenu">Select Question</button>
    <div v-if="menuVisible" class="dropdown-menu">
      <div
        v-for="q in filteredQuestions"
        :key="q.id"
        @mouseover="hoverQuestion(q)"
        @mouseleave="clearHover"
      >
        {{ q.id }}
      </div>
      <div @mouseover="hoverNull" @mouseleave="clearHover">null</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    questions: {
      type: Array,
      required: true
    },
    currentId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      menuVisible: false
    }
  },
  computed: {
    filteredQuestions() {
      return this.questions.filter((q) => q.id !== this.currentId) // Exclude the current question ID
    }
  },
  methods: {
    showMenu() {
      this.menuVisible = true
    },
    hideMenu() {
      this.menuVisible = false
    },
    hoverQuestion(question) {
      this.$emit('hover', question.Question) // Emit the question statement
    },
    hoverNull() {
      this.$emit('hover', 'No associated question') // Emit null hover statement
    },
    clearHover() {
      this.$emit('hover', '') // Clear the hover statement
    }
  }
}
</script>

<style scoped>
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  background-color: #444;
  border: 1px solid #555;
  border-radius: 5px;
  z-index: 10;
}

.dropdown-menu div {
  padding: 5px;
  cursor: pointer;
}

.dropdown-menu div:hover {
  background-color: #555;
}
</style>
