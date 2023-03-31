<template>
  <div v-show="post.id" padding>
    <div class="q-mb-lg">
      <h1 class="rainbow">{{ post.title }}</h1>
      <code class="text-italic"
        >Updated by {{ username }} {{ post.updated_at | timeAgo }}</code
      >
    </div>
    <div v-html="post.body_html" class="q-mt-lg" />
    <!-- <div>
      <div
        v-for="label in post.labels"
        outline
        square
        clickable
        class="label"
        :key="label.index"
        :style="`border-color: 1px solid rgba(27,31,35,.2); color: #fff;background: #${label.color}`"
        @click="chipClickHandler(label.name)"
      >
        {{ label.name }}
      </div>
    </div> -->
    <!-- <q-separator class="rainbow" style="height: 1px" /> -->
    <Comment></Comment>
  </div>
</template>

<script>
import http from "../plugins/http/http";
import { mapState, mapGetters } from "vuex";
import Comment from "../components/comment";
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
    ...mapGetters({
      username: "blog/username",
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
          this.$set(this, "post", res.data);
          // this.$q.loading.hide();
        })
        .catch((err) => {
          if (err.response.status === 404) {
            this.$router.push("/404");
          }
        });
    },
    chipClickHandler(labelName) {
      this.$router.push(`/?label=${labelName}`);
    },
  },
  created() {
    // this.$q.loading.show({ delay: 250 });
    this.getIssue();
  },
};
</script>

<style lang="scss" scoped>
.q-mb-lg {
}
</style>
