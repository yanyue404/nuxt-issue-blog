<template>
  <div>
    <Header />
    <Nav />
    <BlogList
      :pending="pending"
      :postList="postList"
      :pageNum.sync="pageNum"
      :total_count="total_count"
      @page-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { isServer, toNumber, getQueryString, debounce } from '@/utils'
import Header from '@/components/Header.vue'
import Nav from '@/components/Nav.vue'
import BlogList from '@/components/BlogList.vue'

export default {
  components: {
    Header,
    Nav,
    BlogList
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
      serverLoaded: (state) => state.blog.serverLoaded,
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
    }
  },
  watch: {
    $route() {
      // 标签分类
      if (this.$route.query.page) {
        this.getIssueList({ page: toNumber(this.$route.query.page) })
      }
    },
    keyWorld(newVal) {
      this.debouncedCallback(newVal)
    }
  },
  created() {
    this.debouncedCallback = debounce((...args) => {
      if (getQueryString('page')) {
        this.updatePage(1)
        this.$router.push(`/`)
      }
      this.getIssueList({ page: toNumber(this.page) })
    }, 500)
  },
  beforeMount() {
    const page = !isServer() ? getQueryString('page') : ''
    if (page) {
      this.updatePage(page)
    }
    if (!this.serverLoaded || page) {
      this.getIssueList({ page: toNumber(this.page) })
    } else {
      console.log('首屏数据在服务端加载好了！')
    }
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
