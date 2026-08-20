<template>
  <div>
    <Header />
    <Nav />
    <BlogList
      :pending="pending"
      :postList="displayPostList"
      :pageNum.sync="pageNum"
      :total_count="total_count"
      @page-change="handleCurrentChange"
    />
    <Footer />
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { isServer, toNumber, getQueryString, debounce } from '@/utils'
import Header from '@/components/Header.vue'
import Nav from '@/components/Nav.vue'
import BlogList from '@/components/BlogList.vue'
import Footer from '@/components/Footer.vue'

export default {
  components: {
    Header,
    Nav,
    BlogList,
    Footer
  },
  data() {
    return {}
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
    displayPostList() {
      const key = (this.keyWorld || '').trim().toLowerCase()
      if (!key) return this.postList
      return this.postList.filter((post) => {
        const title = (post.title || '').toLowerCase()
        const body = (post.body_html || '').toLowerCase()
        return title.includes(key) || body.includes(key)
      })
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
    // 每次进入首页都拉最新，避免 generate 快照 / session 缓存导致旧文
    console.log('[index] refetch issue list', {
      page: toNumber(this.page) || 1
    })
    this.getIssueList({ page: toNumber(this.page) || 1 })
  },
  methods: {
    ...mapActions({
      getIssueList: 'blog/getIssueList'
    }),
    ...mapMutations({
      updatePage: 'blog/updatePage'
    }),
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.$router.push(`/?page=${val}`)
    }
  }
}
</script>
<style lang="scss" scoped></style>
