<template>
  <header class="flex-sb-c">
    <div class="header-left">
      <h1 class="blog-title" @click="toIndex">{{ blogName }}</h1>
    </div>
    <div class="header-right">
      <a
        href="https://github.com/yanyue404/nuxt-issue-blog"
        target="_blank"
        rel="noopener noreferrer"
        class="github-link"
      >
        <span class="github-icon">
          <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            ></path>
          </svg>
        </span>
        <span class="github-text">Star</span>
      </a>
      <DarkMode v-model="dark"></DarkMode>
    </div>
  </header>
</template>

<script>
import { mapState } from 'vuex'
import { isServer } from '@/utils'
import DarkMode from '@/components/darkMode.vue'

export default {
  name: 'Header',
  components: {
    DarkMode
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
  watch: {
    dark: (newVal) => {
      document.querySelector('#darkmode-button').click()
    }
  },
  methods: {
    toIndex() {
      this.$store.commit('blog/updateKeyWorld', '')
      this.$store.commit('blog/updatePage', 1)

      const url = window.location.origin + window.location.pathname
      window.history.replaceState({}, '', url)
      location.reload()
    }
  }
}
</script>

<style lang="scss" scoped>
header.flex-sb-c {
  padding: 1rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);

  .header-left {
    .blog-title {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(45deg, var(--theme-color), #666);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      transition: all 0.3s ease;
      margin: 0;
      padding: 0;

      &:hover {
        transform: translateY(-2px);
        background: linear-gradient(45deg, #666, var(--theme-color));
        -webkit-background-clip: text;
        cursor: pointer;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .github-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 4px 10px;
    font-size: 0.85rem;
    color: var(--textNormal);
    text-decoration: none;
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    transition: all 0.3s ease;
    font-weight: 500;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      color: var(--theme-color);
      border-color: var(--theme-color);
    }

    .github-icon {
      display: flex;
      align-items: center;
    }

    @media (max-width: 768px) {
      padding: 4px 8px;

      .github-text {
        display: none;
      }
    }
  }
}

.blog-title {
  font-size: 1.98818rem;
  line-height: 2.625rem;
  margin-bottom: 0px !important;
  margin-top: 0px !important;
  padding-top: 1.8rem;
  padding-bottom: 1.8rem !important;
  border-bottom: none !important;
  font-family: Montserrat, sans-serif;
}
</style>
