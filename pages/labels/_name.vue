<template>
  <div class="markdown-body">
    <div v-show="labelList.length === 0">
      <el-skeleton style="width: 100%; padding: 8px 16px 8px 32px" animated>
        <template slot="template">
          <div class="empty-block" v-for="item in emptyArr" :key="item">
            <div class="flex-sb-c">
              <el-skeleton-item variant="h6" style="width: 50%" />
              <el-skeleton-item
                variant="h2"
                style="width: 85px; height: 35px"
              />
            </div>
            <div>
              <el-skeleton-item variant="text" style="width: 25%" />
            </div>
            <div style="padding: 4px">
              <el-skeleton :rows="4" animated />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>
    <!-- 这里要展示博客列表 -->
    <div v-show="labelList.length !== 0" padding>
      <Item :postList="labelList" />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import Item from "@/components/item.vue";
import reachBottom from "@/mixins/reachBottom";
export default {
  components: {
    Item,
  },
  data() {
    return {
      emptyArr: Array.from({ length: 10 }, (_, i) => i),
    };
  },
  computed: {
    label() {
      return this.$route.query.name;
    },
    ...mapState({
      labelList: (state) => state.label.labelList,
      page: (state) => state.label.page,
      total_count: (state) => state.label.total_count,
      pending: (state) => state.label.pending,
    }),
  },
  mixins: [reachBottom],
  beforeMount() {
    // https://api.github.com/search/issues?q=+repo:yanyue404/blog+label:%E4%B8%93%E9%A2%98%E5%AD%A6%E4%B9%A0%E8%AE%A1%E5%88%92+state:open&page=1&per_page=30
    this.getIssueListByLabel({
      page: this.page,
      label: this.label,
    });
  },
  beforeDestroy() {
    this.resetPage();
  },
  methods: {
    ...mapMutations({
      resetPage: "label/resetPage",
    }),
    ...mapActions({
      getIssueListByLabel: "label/getIssueListByLabel",
    }),
    reachBottomFn() {
      if (!this.pending && this.total_count > this.labelList.length) {
        this.getIssueListByLabel({
          page: this.page + 1,
          label: this.label,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.empty-block:first-child {
  margin-top: 0;
}
.empty-block {
  margin-top: 24px;
}
::v-deep {
  .el-skeleton__h6 {
    height: 2em;
  }
  .el-skeleton__text {
    height: 1.5em;
  }
  .el-skeleton__p {
    margin-top: 0.5em;
  }
}
</style>
