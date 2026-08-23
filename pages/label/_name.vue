<template>
  <div class="label-page">
    <PageHeader
      :title="label"
      :subtitle="$t('label.allPosts')"
      :meta="[
        {
          icon: 'el-icon-collection',
          text: $t('label.totalPosts', { count: total_count })
        }
      ]"
    />

    <BlogList
      :pending="pending"
      :postList="labelList"
      :pageNum.sync="pageNum"
      :total_count="total_count"
      @page-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { toNumber } from '@/utils'
import BlogList from '@/components/BlogList.vue'
import PageHeader from '@/components/PageHeader.vue'

export default {
  components: {
    BlogList,
    PageHeader
  },
  async fetch({ app, params, query }) {
    const name = params.name
    if (!name) return
    app.store.commit('label/resetPage')
    const page = toNumber(query.page) || 1
    await app.store.dispatch('label/getIssueListByLabel', {
      page,
      label: decodeURIComponent(name)
    })
  },
  computed: {
    label() {
      try {
        return decodeURIComponent(this.$route.params.name || '')
      } catch (e) {
        return this.$route.params.name || ''
      }
    },
    ...mapState({
      labelList: (state) => state.label.labelList,
      page: (state) => state.label.page,
      total_count: (state) => state.label.total_count,
      pending: (state) => state.label.pending
    }),
    pageNum: {
      get() {
        return toNumber(this.page) || 1
      },
      set(val) {
        return toNumber(val)
      }
    }
  },
  watch: {
    '$route.params.name'() {
      this.resetPage()
      this.fetchLabelList(1)
    },
    '$route.query.page'(val) {
      if (val) {
        this.fetchLabelList(toNumber(val) || 1)
      }
    }
  },
  beforeMount() {
    const page = toNumber(this.$route.query.page) || 1
    console.log('[label] refetch issue list', { label: this.label, page })
    this.fetchLabelList(page)
  },
  beforeDestroy() {
    this.resetPage()
  },
  methods: {
    ...mapMutations({
      resetPage: 'label/resetPage'
    }),
    ...mapActions({
      getIssueListByLabel: 'label/getIssueListByLabel'
    }),
    fetchLabelList(page) {
      this.getIssueListByLabel({
        page,
        label: this.label
      })
    },
    handleCurrentChange(val) {
      this.$router.push({
        path: `/label/${encodeURIComponent(this.label)}`,
        query: val > 1 ? { page: String(val) } : {}
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.label-page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 32px 48px;
  box-sizing: border-box;
}

@media (max-width: 900px) {
  .label-page {
    padding: 16px;
  }
}
</style>
