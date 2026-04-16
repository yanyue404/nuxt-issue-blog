<template>
  <div class="lang-switch" @click="toggleLang">
    <span class="lang-label">{{ currentLabel }}</span>
  </div>
</template>

<script>
export default {
  name: 'LangSwitch',
  computed: {
    currentLabel() {
      return this.$i18n.locale === 'zh-CN' ? 'EN' : '中'
    }
  },
  methods: {
    toggleLang() {
      this.$i18n.locale = this.$i18n.locale === 'zh-CN' ? 'en' : 'zh-CN'
    }
  }
}
</script>

<style lang="scss" scoped>
.lang-switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--textNormal);
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    color: var(--theme-color);
    border-color: var(--theme-color);
  }
}
</style>
