<template>
  <div>
    <div v-show="!post.id">
      <el-skeleton style="width: 100%" animated>
        <template slot="template">
          <div class="q-mb-lg">
            <div><el-skeleton-item variant="h1" style="width: 50%" /></div>
            <code class="text-italic">
              <el-skeleton-item variant="text" style="width: 25%"
            /></code>
          </div>
          <div v-for="item in [1, 2, 3, 4]" :key="item">
            <el-skeleton-item variant="h2" style="width: 40%" />
            <div style="padding: 14px">
              <el-skeleton v-show="item % 2 === 1" :rows="10" animated />
              <el-skeleton v-show="item % 2 === 0" :rows="4" animated />

              <el-skeleton-item
                v-show="item % 2 === 0"
                variant="image"
                style="width: 100%; height: 240px"
              />
              <el-skeleton v-show="item % 2 === 0" :rows="6" animated />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>
    <div v-show="post.id" padding>
      <div class="q-mb-lg">
        <h1 class="rainbow">{{ post.title }}</h1>
        <code class="text-italic"
          >Updated by {{ username }} {{ post.updated_at | timeAgo }}</code
        >
      </div>
      <div v-html="post.body_html" class="q-mt-lg" />
      <el-backtop>
        <div
          style="
             {
              height: 100%;
              width: 100%;
              background-color: #f2f5f6;
              box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
              text-align: center;
              line-height: 40px;
              color: #1989fa;
            }
          "
        >
          UP
        </div>
      </el-backtop>
      <Comment></Comment>
    </div>
  </div>
</template>

<script>
import http from "../../plugins/http/http";
import { mapState, mapGetters } from "vuex";
import Comment from "../../components/comment";
import { formatPassTime } from "@/utils/date";

export default {
  name: "Post",
  components: {
    Comment,
  },
  data() {
    return {
      post: {},
    };
  },
  filters: {
    timeAgo(d) {
      return d && formatPassTime(new Date(d));
    },
  },
  computed: {
    ...mapState({
      username: (state) => state.blog.username,
    }),
  },
  watch: {
    $route() {
      // 标签分类
      if (this.$route.query.label) {
        this.getIssueList(1, 50);
      } else {
        // 普通分页
        this.getIssueList(this.page, this.number);
      }
    },
    searchKeyWords(val) {
      this.getIssueList(1, 50, false, val);
    },
  },
  methods: {
    getIssue() {
      http
        .get(
          `/repos/${this.$store.getters["blog/repository"]}/issues/${this.$route.query.id}`
        )
        .then((res) => {
          this.post = res.data;
          // this.$q.loading.hide();
        })
        .catch((err) => {
          if (err.response.status === 404) {
            this.$router.push("/404");
          }
        });
    },
    chipClickHandler(labelName) {
      this.$router.push(`/labels/?label=${labelName}`);
    },
  },
  created() {
    // this.$q.loading.show({ delay: 250 });
    this.getIssue();
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-skeleton__h1 {
    height: 2.5em;
    margin-bottom: 16px;
    margin-top: 24px;
    padding-bottom: 0.3em;
  }
  .el-skeleton__h2 {
    height: 1.5em;
    margin-bottom: 16px;
    margin-top: 24px;
    padding-bottom: 0.3em;
  }
}
</style>
