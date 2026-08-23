<template>
  <button
    class="dark-toggle"
    :title="value ? '切换亮色模式' : '切换暗色模式'"
    :aria-label="value ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <span v-show="!value" class="icon icon-moon">🌙</span>
    <span v-show="value" class="icon icon-sun">☀️</span>
  </button>
</template>
<script>
export default {
  props: {
    value: Boolean
  },
  watch: {
    value(dark) {
      this.applyTheme(dark)
    }
  },
  mounted() {
    const dark = localStorage.getItem('darken-mode') === 'dark'
    this.applyTheme(dark)
    if (dark !== this.value) {
      this.$emit('input', dark)
    }
  },
  methods: {
    toggle() {
      this.$emit('input', !this.value)
    },
    applyTheme(dark) {
      if (typeof document === 'undefined') return
      const html = document.documentElement
      if (dark) {
        html.classList.add('dark-mode')
        localStorage.setItem('darken-mode', 'dark')
      } else {
        html.classList.remove('dark-mode')
        localStorage.setItem('darken-mode', 'light')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.dark-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
  line-height: 1;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: var(--theme-color);
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
