<template>
  <div class="markdown-body">
    <!-- 这里要展示博客列表 -->
    <div v-if="labelList.length !== 0" padding>
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
    return {};
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
