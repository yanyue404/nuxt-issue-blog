<template>
  <header class="site-header">
    <div class="header-inner">
      <div class="header-left">
        <h1 class="blog-title" @click="toIndex">{{ blogName }}</h1>
      </div>
      <div class="header-center">
        <button class="search-trigger" @click="openSearch">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span>{{ $t('nav.searchPlaceholder') }}</span>
          <kbd>Ctrl+K</kbd>
        </button>
      </div>
      <div class="header-right">
        <a
          href="https://github.com/yanyue404/nuxt-issue-blog"
          target="_blank"
          rel="noopener noreferrer"
          class="github-link"
          title="GitHub"
        >
          <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            ></path>
          </svg>
        </a>
        <LangSwitch />
        <DarkMode v-model="dark"></DarkMode>
      </div>
    </div>
    <CommandPalette ref="commandPalette" />
  </header>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { isServer } from '@/utils'
import { isStaticClient } from '@/utils/github'
import DarkMode from '@/components/darkMode.vue'
import LangSwitch from '@/components/LangSwitch.vue'
import CommandPalette from '@/components/CommandPalette.vue'

export default {
  name: 'Header',
  components: {
    DarkMode,
    LangSwitch,
    CommandPalette
  },
  data() {
    return {
      dark: !isServer() ? localStorage.getItem('darken-mode') === 'dark' : false
    }
  },
  computed: {
    ...mapState({
      blogName: (state) => state.blog.blogName
    })
  },
  methods: {
    ...mapMutations({
      updateKeyWorld: 'blog/updateKeyWorld'
    }),
    toIndex() {
      this.updateKeyWorld('')
      this.$store.commit('blog/updatePage', 1)
      const base = this.$store.state.blog.baseUrl || '/blog/'
      if (isStaticClient()) {
        window.location.href = base
      } else {
        this.$router.push('/')
      }
    },
    openSearch() {
      this.$refs.commandPalette.open()
    }
  }
}
</script>

<style lang="scss" scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--background-color);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 12px 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  flex-shrink: 0;

  .blog-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--theme-color);
    margin: 0;
    padding: 0;
    cursor: pointer;
    white-space: nowrap;
    border-bottom: none;
    transition: opacity 0.2s;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    font-weight: 700;

    &:hover {
      opacity: 0.8;
    }
  }
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.search-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--juejin-font-3);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 240px;

  &:hover {
    border-color: var(--theme-color);
    color: var(--juejin-font-2);
  }

  svg {
    flex-shrink: 0;
    opacity: 0.6;
  }

  span {
    flex: 1;
    text-align: left;
  }

  kbd {
    padding: 2px 5px;
    font-size: 11px;
    font-family: inherit;
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--juejin-font-3);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.github-link {
  display: flex;
  align-items: center;
  color: var(--textNormal);
  transition: color 0.2s;

  &:hover {
    color: var(--theme-color);
  }
}

@media (max-width: 768px) {
  .header-inner {
    gap: 0.8rem;
    padding: 10px 0;
  }

  .header-left .blog-title {
    font-size: 1.1rem;
  }

  .header-center {
    max-width: none;
  }
}
</style>
