import Vue from 'vue'
import VueI18n from 'vue-i18n'
import zhCN from '@/locales/zh-CN'
import en from '@/locales/en'

Vue.use(VueI18n)

const LOCALE_KEY = 'blog-locale'

function getDefaultLocale() {
  if (process.client) {
    const saved = localStorage.getItem(LOCALE_KEY)
    if (saved) return saved
  }
  return 'zh-CN'
}

export default ({ app }) => {
  const i18n = new VueI18n({
    locale: getDefaultLocale(),
    fallbackLocale: 'zh-CN',
    silentFallbackWarn: true,
    messages: {
      'zh-CN': zhCN,
      en
    }
  })

  app.i18n = i18n

  if (process.client) {
    i18n.vm.$watch('locale', (newLocale) => {
      localStorage.setItem(LOCALE_KEY, newLocale)
      document.documentElement.lang = newLocale === 'zh-CN' ? 'zh' : 'en'
    })
  }
}
