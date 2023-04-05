<template>
  <div>
    <div class="">
      <!-- 这里要展示博客列表 -->
      <div v-show="postList.length !== 0" padding>
        <Item :postList="postList" />
      </div>
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
  async fetch({ app }) {
    await app.store.dispatch("user/getUserInfo");
    return await app.store.dispatch("blog/getIssueList", {
      page: 1,
    });
  },
  computed: {
    ...mapState({
      serverLoaded: (state) => state.blog.serverLoaded,
      postList: (state) => state.blog.postList,
      page: (state) => state.blog.page,
      total_count: (state) => state.blog.total_count,
      pending: (state) => state.blog.pending,
    }),
  },
  mixins: [reachBottom],
  beforeMount() {
    if (!this.serverLoaded) {
      this.getIssueList(this.page);
    } else {
      console.log("首屏数据在服务端加载好了！");
    }
  },
  methods: {
    ...mapActions({
      getIssueList: "blog/getIssueList",
    }),
    reachBottomFn() {
      if (!this.pending && this.total_count > this.postList.length) {
        this.getIssueList({ page: this.page + 1 });
      }
    },
  },
};
</script>
