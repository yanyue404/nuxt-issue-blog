<template>
  <div class="home-page">
    <Hero />
    <div class="home-layout">
      <main class="home-main">
        <BlogList
          :pending="pending"
          :postList="displayPostList"
          :pageNum.sync="currentPageNum"
          :total_count="displayTotalCount"
          @page-change="handleCurrentChange"
        />
      </main>
      <aside class="home-sidebar">
        <Nav />
        <div class="sidebar-section">
          <h3 class="sidebar-title">{{ $t('label.allLabels') }}</h3>
          <LabelCloud
            :posts="labelSourcePosts"
            :active-label="activeLabel"
            @select="handleLabelSelect"
          />
        </div>
        <div v-if="recentPosts.length" class="sidebar-section">
          <h3 class="sidebar-title">{{ $t('label.recentPosts') }}</h3>
          <ul class="recent-list">
            <li v-for="post in recentPosts" :key="post.number">
              <a :href="postHref(post.number)" @click.prevent="goPost(post.number)">
                {{ post.title }}
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { isServer, toNumber, getQueryString, debounce } from '@/utils'
import { isStaticClient } from '@/utils/github'
import Hero from '@/components/Hero.vue'
import Nav from '@/components/Nav.vue'
import LabelCloud from '@/components/LabelCloud.vue'
import BlogList from '@/components/BlogList.vue'

export default {
  components: {
    Hero,
    Nav,
    LabelCloud,
    BlogList
  },
  data() {
    return {
      activeLabel: '',
      labelPage: 1
    }
  },
  async fetch({ app }) {
    await app.store.dispatch('user/getUserInfo')
    return await app.store.dispatch('blog/getIssueList', {
      page: 1
    })
  },
  computed: {
    ...mapState({
      postList: (state) => state.blog.postList,
      allPosts: (state) => state.blog.allPosts,
      page: (state) => state.blog.page,
      total_count: (state) => state.blog.total_count,
      pending: (state) => state.blog.pending,
      keyWorld: (state) => state.blog.keyWorld
    }),
    pageNum: {
      get() {
        return toNumber(this.page)
      },
      set(val) {
        return toNumber(val)
      }
    },
    currentPageNum: {
      get() {
        return this.activeLabel ? this.labelPage : this.pageNum
      },
      set(val) {
        if (this.activeLabel) {
          this.labelPage = val
        }
      }
    },
    labelSourcePosts() {
      return this.allPosts && this.allPosts.length ? this.allPosts : this.postList
    },
    filteredByLabel() {
      if (!this.activeLabel) return null
      const source = this.allPosts && this.allPosts.length ? this.allPosts : this.postList
      return source.filter((post) =>
        (post.labels || []).some((l) => l.name === this.activeLabel)
      )
    },
    displayPostList() {
      if (this.filteredByLabel) {
        const start = (this.labelPage - 1) * 25
        return this.filteredByLabel.slice(start, start + 25)
      }
      let list = this.postList
      const key = (this.keyWorld || '').trim().toLowerCase()
      if (key) {
        list = list.filter((post) => {
          const title = (post.title || '').toLowerCase()
          const body = (post.body_html || '').toLowerCase()
          return title.includes(key) || body.includes(key)
        })
      }
      return list
    },
    displayTotalCount() {
      if (this.filteredByLabel) {
        return this.filteredByLabel.length
      }
      return this.total_count
    },
    recentPosts() {
      const source = this.allPosts && this.allPosts.length ? this.allPosts : this.postList
      return source.slice(0, 5)
    }
  },
  watch: {
    $route() {
      if (this.$route.query.page) {
        this.getIssueList({ page: toNumber(this.$route.query.page) })
      }
    },
    keyWorld(newVal) {
      this.debouncedCallback(newVal)
    }
  },
  created() {
    this.debouncedCallback = debounce(() => {
      if (getQueryString('page')) {
        this.updatePage(1)
        this.$router.push(`/`)
      }
      this.getIssueList({ page: toNumber(this.page) || 1 })
    }, 500)
  },
  beforeMount() {
    const page = !isServer() ? getQueryString('page') : ''
    if (page) {
      this.updatePage(page)
    }
    this.getIssueList({ page: toNumber(this.page) || 1 })
    this.ensureAllPosts()
  },
  methods: {
    ...mapActions({
      getIssueList: 'blog/getIssueList',
      ensureAllPosts: 'blog/ensureStaticPosts'
    }),
    ...mapMutations({
      updatePage: 'blog/updatePage'
    }),
    handleCurrentChange(val) {
      if (this.activeLabel) {
        this.labelPage = val
      } else {
        this.$router.push(`/?page=${val}`)
      }
    },
    handleLabelSelect(label) {
      this.activeLabel = label
      this.labelPage = 1
    },
    postHref(number) {
      const base = this.$store.state.blog.baseUrl || '/blog/'
      return `${base}post/${number}/`
    },
    goPost(number) {
      if (isStaticClient()) {
        window.location.href = this.postHref(number)
      } else {
        this.$router.push(`/post/${number}`)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.home-page {
  width: 100%;
  min-width: 0;
}

.home-layout {
  display: flex;
  align-items: flex-start;
  gap: 48px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 32px 48px;
  box-sizing: border-box;
}

.home-main {
  flex: 1 1 0%;
  min-width: 0;
  width: 100%;
}

.home-sidebar {
  flex: 0 0 260px;
  width: 260px;
  min-width: 0;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }
}

.sidebar-section {
  margin-top: 24px;
  padding: 16px;
  border-top: none;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  animation: fadeIn 0.4s ease both;

  &:nth-child(2) { animation-delay: 0.1s; }
  &:nth-child(3) { animation-delay: 0.2s; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.sidebar-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--juejin-font-3);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin: 0 0 12px;
  border-bottom: none;
}

.recent-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding: 8px 0;
    border-bottom: 1px dashed var(--border-color, #f0f0f0);

    &:last-child {
      border-bottom: none;
    }
  }

  a {
    font-size: 13px;
    color: var(--juejin-font-2);
    text-decoration: none;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    transition: color 0.15s;

    &:hover {
      color: var(--theme-color);
    }
  }
}

@media (max-width: 900px) {
  .home-layout {
    flex-direction: column;
    padding: 16px;
    gap: 24px;
  }
  .home-sidebar {
    flex: none;
    width: 100%;
    max-width: 100%;
    position: static;
    max-height: none;
  }
}
</style>
