<template>
  <div>
    <h2>留言（{{ comments.length }} 条）</h2>
    <ul
      v-for="comment in comments"
      bordered
      class="comment rounded-borders q-mt-lg"
      :key="comment.index"
    >
      <div class="q-pa-md">
        <div class="item-section">
          <div class="avatar">
            <img alt="avatar" :src="comment.user.avatar_url" />
          </div>
          <span class="text-weight-bold">{{ comment.user.login }}</span>
          <span class="text-gray-light">
            {{ comment.updated_at | timeAgo }}</span
          >
        </div>
        <div v-html="comment.body_html" class="q-pt-sm"></div>
      </div>
    </ul>
    <div class="comment-btn">
      <button outline no-caps class="rainbow" @click="goAddComment">
        <div left size="2rem" name="add_comment" />
        <div class="text">Add Comment</div>
      </button>
    </div>
  </div>
</template>

<script>
import { formatPassTime } from "@/utils/date";
import http from "../plugins/http/http";
export default {
  name: "Comment",
  data() {
    return {
      comments: [],
      addCommentUrl: `https://github.com/${this.$store.getters["blog/repository"]}/issues/${this.$route.query.id}/#new_comment_field`,
    };
  },
  filters: {
    timeAgo(d) {
      return formatPassTime(new Date(d));
    },
  },
  methods: {
    getComments() {
      http
        .get(
          `/repos/${this.$store.getters["blog/repository"]}/issues/${this.$route.query.id}/comments`
        )
        .then((res) => {
          this.$set(this, "comments", res.data);
        });
    },
    goAddComment() {
      location.href = this.addCommentUrl;
    },
  },
  created() {
    this.getComments();
  },
};
</script>

<style scoped lang="scss">
ul {
  padding-left: 0;
}
.q-pa-md {
  padding: 16px 16px;
}
.q-pt-sm {
  padding-top: 8px;
}
.text-weight-bold {
  font-weight: 700;
}
.comment-btn {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  padding-bottom: 30px;
}
.comment {
  border-bottom: 1px dashed #d3d3d3;
}
.item-section {
  display: flex;
  align-items: center;
  span {
    margin-left: 10px;
  }
}
.rounded-borders {
  border-radius: 4px;
}
.avatar {
  position: relative;
  vertical-align: middle;
  display: inline-block;
  border-radius: 50%;
  font-size: 48px;
  height: 1em;
  width: 1em;
  img {
    border: none !important;
  }
}
button {
  background: #fff;
  outline: 0;
  cursor: pointer;
  border-radius: 3px;
  border: 0;
  box-shadow: 0 1px 5px #0003, 0 2px 2px #00000024, 0 3px 1px -2px #0000001f;
}
.text {
  padding: 4px 16px;
  font-size: 1em;
  line-height: 24px;
  font-weight: 500;
}
</style>
