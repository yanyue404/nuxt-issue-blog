<template>
  <div>
    <div class="">
      <!-- 这里要展示博客列表 -->
      <div v-show="postList.length !== 0" padding>
        <Item :pending="pending" :postList="postList" />
        <div v-show="total_count > 25" class="paginate-container">
          <el-pagination
            background
            layout="prev, pager, next"
            :current-page.sync="pageNum"
            :page-size="25"
            :total="total_count"
            @current-change="handleCurrentChange"
          >
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import Item from '@/components/item.vue'
import { isServer, toNumber, getQueryString, debounce } from '@/utils'

export default {
  components: {
    Item
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
<style lang="scss" scoped>
.paginate-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  margin-bottom: 16px;
  text-align: center;

  ::v-deep .el-pagination.is-background .el-pager li:not(.disabled).active {
    background-color: var(--theme-color) !important;
  }
}
</style>
