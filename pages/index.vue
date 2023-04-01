<template>
  <div class="markdown-body">
    <!-- 这里要展示博客列表 -->
    <div v-if="postList.length !== 0" padding>
      <Item :postList="postList" />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import Item from "@/components/item.vue";
export default {
  components: {
    Item,
  },
  data() {
    return {};
  },
  async fetch({ app }) {
    return await app.store.dispatch("blog/getIssueList", {
      page: 1,
    });
  },
  computed: {
    ...mapState({
      author: (state) => state.user.author,
      serverLoaded: (state) => state.blog.serverLoaded,
      postList: (state) => state.blog.postList,
      page: (state) => state.blog.page,
      total_count: (state) => state.blog.total_count,
      pending: (state) => state.blog.pending,
    }),
  },
  beforeMount() {
    if (!this.serverLoaded) {
      this.getIssueList(this.page);
    } else {
      console.log("首屏数据在服务端加载好了！");
    }
  },
  mounted() {
    this.handleScroll();
  },
  methods: {
    ...mapActions({
      getIssueList: "blog/getIssueList",
    }),
    handleScroll() {
      window.onscroll = () => {
        // 滚动过可滚动的 2/3 加载下一页
        const bottomOfWindow =
          document.documentElement.scrollHeight -
            document.documentElement.scrollTop <=
          (document.documentElement.scrollHeight * 2) / 3;
        if (
          bottomOfWindow &&
          !this.pending &&
          this.total_count > this.postList.length
        ) {
          this.getIssueList({ page: this.page + 1 });
        }
      };
    },
  },
};
</script>
