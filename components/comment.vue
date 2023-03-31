<template>
  <div>
    <ul
      v-for="comment in comments"
      bordered
      class="rounded-borders q-mt-lg"
      :key="comment.index"
    >
      <div class="q-pa-md">
        <div avatar>
          <q-avatar rounded>
            <img alt="avatar" :src="comment.user.avatar_url" />
          </q-avatar>
        </div>
        <div>
          <q-item-label lines="1">
            <span class="text-weight-bold">{{ comment.user.login }}</span>
            <span class="text-gray-light">
              {{ comment.updated_at | timeAgo }}</span
            >
          </q-item-label>
          <q-item-label
            v-html="comment.body_html"
            class="q-pt-sm"
          ></q-item-label>
        </div>
      </div>
    </ul>
    <div class="comment-btn">
      <button outline no-caps class="rainbow" @click="goAddComment">
        <div left size="2rem" name="add_comment" />
        <div>Add Comment</div>
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
      debugger;
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
.q-item__section--side > .q-avatar {
  font-size: 48px;
}
@media (max-width: 767px) {
  .q-item__section--side > .q-avatar {
    font-size: 36px;
  }
}
.comment-btn {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin-top: 48px;
  padding-bottom: 30px;
}
</style>
