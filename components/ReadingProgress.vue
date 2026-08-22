<template>
  <div class="reading-progress" :style="{ width: progress + '%' }"></div>
</template>

<script>
export default {
  name: 'ReadingProgress',
  data() {
    return {
      progress: 0
    }
  },
  mounted() {
    window.addEventListener('scroll', this.updateProgress, { passive: true })
    this.updateProgress()
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.updateProgress)
  },
  methods: {
    updateProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      this.progress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0
    }
  }
}
</script>

<style lang="scss" scoped>
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--theme-color), #42b983);
  z-index: 9999;
  transition: width 0.1s linear;
  border-radius: 0 2px 2px 0;
}
</style>
