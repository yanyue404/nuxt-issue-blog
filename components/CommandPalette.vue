<template>
  <div v-if="visible" class="cmd-overlay" @click.self="close">
    <div class="cmd-panel">
      <div class="cmd-input-wrap">
        <svg class="cmd-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref="input"
          v-model="query"
          class="cmd-input"
          :placeholder="$t('nav.searchPlaceholder')"
          @keydown.escape="close"
          @keydown.down.prevent="moveDown"
          @keydown.up.prevent="moveUp"
          @keydown.enter.prevent="selectCurrent"
        />
        <kbd class="cmd-kbd">ESC</kbd>
      </div>
      <div v-if="results.length" class="cmd-results">
        <div
          v-for="(item, idx) in results"
          :key="item.number"
          class="cmd-result-item"
          :class="{ active: idx === activeIndex }"
          @click="go(item)"
          @mouseenter="activeIndex = idx"
        >
          <div class="cmd-result-main">
            <span class="cmd-result-title" v-html="item.titleHtml"></span>
            <span
              v-if="item.snippetHtml"
              class="cmd-result-snippet"
              v-html="item.snippetHtml"
            ></span>
          </div>
          <span class="cmd-result-date">{{ formatDate(item.created_at) }}</span>
        </div>
      </div>
      <div v-else-if="query.length >= 2" class="cmd-empty">
        {{ $t('nav.noResults') || 'No results found' }}
      </div>
      <div v-else class="cmd-hint">
        {{ $t('nav.searchHint') || 'Type to search posts...' }}
      </div>
    </div>
  </div>
</template>

<script>
import { isStaticClient } from '@/utils/github'

export default {
  name: 'CommandPalette',
  data() {
    return {
      visible: false,
      query: '',
      activeIndex: 0
    }
  },
  computed: {
    allPosts() {
      return this.$store.state.blog.allPosts || []
    },
    results() {
      const raw = this.query.trim()
      const q = raw.toLowerCase()
      if (q.length < 2) return []
      const matched = []
      for (const p of this.allPosts) {
        const title = p.title || ''
        const body = p.body_html || ''
        const titleHit = title.toLowerCase().indexOf(q)
        const bodyHit = body.toLowerCase().indexOf(q)
        if (titleHit === -1 && bodyHit === -1) continue
        matched.push({
          ...p,
          titleHtml: this.highlight(title, raw),
          snippetHtml:
            titleHit === -1 && bodyHit !== -1
              ? this.makeSnippet(body, raw, bodyHit)
              : '',
          // 标题命中优先排序
          _score: titleHit !== -1 ? 0 : 1
        })
        if (matched.length >= 40) break
      }
      return matched.sort((a, b) => a._score - b._score).slice(0, 10)
    }
  },
  watch: {
    query() {
      this.activeIndex = 0
    },
    visible(val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.input && this.$refs.input.focus()
        })
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  mounted() {
    document.addEventListener('keydown', this.handleKeydown)
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    handleKeydown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        this.open()
        return
      }
      if (e.key === 'Escape' && this.visible) {
        e.preventDefault()
        this.close()
      }
    },
    open() {
      this.query = ''
      this.activeIndex = 0
      this.visible = true
      this.$store.dispatch('blog/ensureStaticPosts')
    },
    close() {
      this.visible = false
    },
    moveDown() {
      if (this.activeIndex < this.results.length - 1) {
        this.activeIndex++
      }
    },
    moveUp() {
      if (this.activeIndex > 0) {
        this.activeIndex--
      }
    },
    selectCurrent() {
      if (this.results[this.activeIndex]) {
        this.go(this.results[this.activeIndex])
      }
    },
    go(post) {
      this.close()
      const path = `/post/${post.number}`
      if (isStaticClient()) {
        const base = this.$store.state.blog.baseUrl || '/blog/'
        window.location.href = `${base}post/${post.number}/`
      } else {
        this.$router.push(path)
      }
    },
    formatDate(d) {
      if (!d) return ''
      return new Date(d).toLocaleDateString('zh-CN')
    },
    escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    },
    highlight(text, query) {
      const safe = this.escapeHtml(text)
      const q = (query || '').trim()
      if (!q) return safe
      const escapedQuery = this.escapeHtml(q).replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      )
      return safe.replace(new RegExp(escapedQuery, 'gi'), '<mark>$&</mark>')
    },
    makeSnippet(body, query, hitIndex) {
      const before = 30
      const after = 90
      const start = Math.max(0, hitIndex - before)
      const end = Math.min(body.length, hitIndex + query.length + after)
      let snippet = body.slice(start, end).trim()
      if (start > 0) snippet = '…' + snippet
      if (end < body.length) snippet = snippet + '…'
      return this.highlight(snippet, query)
    }
  }
}
</script>

<style lang="scss" scoped>
.cmd-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 120px;
  animation: fadeIn 0.15s ease;
}

.cmd-panel {
  width: 580px;
  max-width: 90vw;
  background: var(--background-color, #fff);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slideDown 0.2s ease;
}

.cmd-input-wrap {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, #eee);
}

.cmd-icon {
  flex-shrink: 0;
  color: var(--juejin-font-3);
  margin-right: 12px;
}

.cmd-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  color: var(--juejin-font-1);
  background: transparent;

  &::placeholder {
    color: var(--juejin-font-3);
  }
}

.cmd-kbd {
  flex-shrink: 0;
  padding: 3px 6px;
  font-size: 11px;
  font-family: inherit;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--juejin-font-3);
}

.cmd-results {
  max-height: 360px;
  overflow-y: auto;
  padding: 8px 0;
}

.cmd-result-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 10px 20px;
  cursor: pointer;
  transition: background 0.1s;

  &.active {
    background: rgba(62, 175, 124, 0.08);
  }
}

.cmd-result-main {
  flex: 1;
  min-width: 0;
}

.cmd-result-title {
  display: block;
  font-size: 14px;
  color: var(--juejin-font-1, #333);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cmd-result-snippet {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin-top: 3px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--juejin-font-3);
}

.cmd-result-item ::v-deep mark {
  background: rgba(62, 175, 124, 0.22);
  color: var(--theme-color);
  padding: 0 1px;
  border-radius: 2px;
  font-weight: 600;
}

.cmd-result-date {
  font-size: 12px;
  color: var(--juejin-font-3);
  flex-shrink: 0;
  margin-left: 16px;
  padding-top: 2px;
}

.cmd-empty,
.cmd-hint {
  padding: 32px 20px;
  text-align: center;
  font-size: 14px;
  color: var(--juejin-font-3);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
