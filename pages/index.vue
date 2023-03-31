<template>
  <div class="markdown-body">
    <!-- 这里要展示博客列表 -->
    <div v-if="postList.length !== 0" padding>
      <Item :postList="postList" />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import http from "../plugins/http/http";
import Item from "@/components/item.vue";
export default {
  components: {
    Item,
  },
  data() {
    return {
      postList: [],
      loaded: false,
      page: 1,
      number: 30,
      total_count: "",
    };
  },
  computed: {
    ...mapState({
      author: (state) => state.user.author,
    }),
  },
  created() {
    this.getIssueList(this.page, this.number);
  },
  mounted() {
    this.handleScroll();
  },
  methods: {
    getIssueList(page, number, pagination = false, keyWorld = "") {
      this.$set(this, "loaded", false);
      if (!this.$route.query.label) {
        this.$set(this, "page", page);
      }
      if (this.postList.length === 0) {
        // this.$q.loading.show({ delay: 250 });
      }
      let url = `/search/issues?q=+repo:${this.$store.getters["blog/repository"]}+state:open&page=${page}&per_page=${number}`;
      // 标签搜索 label:
      if (this.$route.query.label) {
        const that = this;
        url = url.replace(
          /\+state/g,
          (m) => `+label:${that.$route.query.label}${m}`
        );
      }
      // 关键词搜索 q=
      if (keyWorld) {
        const that = this;
        url = url.replace(/\+repo/g, (m) => `${that.searchKeyWords}${m}`);
      }
      http.get(url).then((res) => {
        // 分页模式 拼接数据
        if (pagination === true) {
          this.$set(this, "postList", this.postList.concat(res.data.items));
        } else {
          this.$set(this, "postList", res.data.items);
          // 恢复第一页
          this.$set(this, "page", 1);
        }
        this.$set(this, "total_count", res.data.total_count);
        this.$set(this, "loaded", true);
      });
    },
    handleScroll() {
      const that = this;
      window.onscroll = () => {
        // 距离底部200px时加载一次
        const bottomOfWindow =
          document.documentElement.offsetHeight -
            document.documentElement.scrollTop -
            window.innerHeight <=
          200;
        if (
          bottomOfWindow &&
          that.loaded &&
          that.total_count > that.postList.length
        ) {
          that.getIssueList(that.page + 1, that.number, true);
        }
      };
    },
  },
};
</script>


