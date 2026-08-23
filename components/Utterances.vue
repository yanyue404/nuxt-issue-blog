<template>
  <div ref="box" class="utterances-box" />
</template>

<script>
const UTTERANCES_ORIGIN = 'https://utteranc.es'

export default {
  name: 'Utterances',
  props: {
    repo: {
      type: String,
      required: true
    },
    issueTerm: {
      type: String,
      required: true
    }
  },
  mounted() {
    this.inject()
    this.onMessage = (event) => {
      if (event.origin !== UTTERANCES_ORIGIN) return
      const data = event.data
      if (data && data.type === 'resize' && data.height) {
        const wrap = this.$el.querySelector('.utterances')
        if (wrap) wrap.style.height = `${data.height}px`
      }
    }
    window.addEventListener('message', this.onMessage)
    this.themeObserver = new MutationObserver(() => this.setTheme())
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
  },
  watch: {
    repo: 'inject',
    issueTerm: 'inject'
  },
  beforeDestroy() {
    window.removeEventListener('message', this.onMessage)
    if (this.themeObserver) this.themeObserver.disconnect()
  },
  methods: {
    currentTheme() {
      return document.documentElement.classList.contains('dark-mode')
        ? 'github-dark'
        : 'github-light'
    },
    inject() {
      if (!this.repo || !this.issueTerm) return
      this.$el.innerHTML = ''

      const url = new URL(location.href)
      const sessionFromQuery = url.searchParams.get('utterances')
      if (sessionFromQuery) {
        localStorage.setItem('utterances-session', sessionFromQuery)
        url.searchParams.delete('utterances')
        history.replaceState(undefined, document.title, url.href)
      }
      const pathname =
        location.pathname.length < 2
          ? 'index'
          : location.pathname.replace(/^\//, '').replace(/\.\w+$/, '')
      const params = new URLSearchParams({
        repo: this.repo,
        // 用 Search API 按标题匹配 Issue，避免 issue-number 走 core API（匿名 60 次/小时）
        'issue-term': this.issueTerm,
        theme: this.currentTheme(),
        origin: location.origin,
        url: location.origin + location.pathname + location.search,
        pathname,
        title: document.title,
        description: '',
        session: sessionFromQuery || localStorage.getItem('utterances-session') || ''
      })

      const wrap = document.createElement('div')
      wrap.className = 'utterances'
      wrap.style.minHeight = '269px'
      wrap.style.height = '269px'
      const iframe = document.createElement('iframe')
      iframe.className = 'utterances-frame'
      iframe.title = 'Comments'
      iframe.setAttribute('scrolling', 'no')
      iframe.src = `${UTTERANCES_ORIGIN}/utterances.html?${params}`
      wrap.appendChild(iframe)
      this.$el.appendChild(wrap)
    },
    setTheme() {
      const iframe = this.$el.querySelector('.utterances-frame')
      if (!iframe || !iframe.contentWindow) return
      iframe.contentWindow.postMessage(
        { type: 'set-theme', theme: this.currentTheme() },
        UTTERANCES_ORIGIN
      )
    }
  }
}
</script>

<style>
.utterances-box .utterances {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  min-height: 269px;
}
.utterances-box .utterances-frame {
  color-scheme: light;
  position: absolute;
  left: 0;
  right: 0;
  width: 1px;
  min-width: 100%;
  max-width: 100%;
  height: 100%;
  border: 0;
}
</style>
