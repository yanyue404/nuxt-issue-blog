<template>
  <div class="card-list">
    <div class="card" v-for="post in postList" :key="post.index">
      <div class="q-item">
        <div
          class="q-item__section q-item__section--main"
          @click="toPostDetail(post.number)"
        >
          <div>
            <div class="text-h6 rainbow">{{ post.title }}</div>
            <div class="text-gray-light text-weight-thin q-mt-sm q-mb-sm">
              {{ post.created_at | dateFormate }}
            </div>
          </div>
          <!-- 展示 4 行内容 -->
          <div class="q-item__label text-body1 text-gray-light text-justify">
            {{ post.body_html | htmlToText }}
          </div>
        </div>
        <div class="q-item__section column">
          <div
            v-for="label in post.labels"
            outline
            square
            clickable
            class="q-chip label"
            :key="label.index"
            :style="`border-color: 1px solid rgba(27,31,35,.2); color: #fff;background: #${label.color}!important`"
            @click="chipClickHandler(label.name)"
          >
            {{ label.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { dateFormat } from "@/utils/date";
export default {
  name: "Item",
  props: {
    postList: {
      type: Array,
      required: true,
    },
  },
  filters: {
    dateFormate(d) {
      return dateFormat("YYYY-MM-dd hh:mm:ss", new Date(d));
    },
    htmlToText(h) {
      return h.replace(/<\/?.+?>/g, "");
    },
  },
  methods: {
    toPostDetail(id) {
      this.$router.push(`/posts/?id=${id}`);
    },
    chipClickHandler(labelName) {
      this.$router.push(`/labels/?name=${labelName}`);
    },
  },
};
</script>

<style scoped lang="scss">
.label:hover {
  box-shadow: 4px 4px 2px #888;
}
.markdown-body hr {
  height: unset;
}
@media (max-width: 767px) {
  .label,
  .created-at {
    display: none;
  }
}
.text-h6 {
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 2rem;
  letter-spacing: 0.0125em;
}
.text-body1 {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5rem;
  letter-spacing: 0.03125em;
}
.text-justify {
  text-align: justify;
  -webkit-hyphens: auto;
  -ms-hyphens: auto;
  hyphens: auto;
}

.q-item {
  position: relative;
  margin-top: 24px;
  outline: 0;
  text-decoration: none;
  display: flex;
  flex-wrap: nowrap;
  min-height: 48px;
  padding: 8px 16px;
  color: inherit;
  transition: color 0.3s, background-color 0.3s;
  cursor: pointer !important;
  border-top: 1px solid rgba(0, 0, 0, 0.125);
}
.card:nth-of-type(1) .q-item {
  margin-top: 0;
  border-top: none;
}

.q-item__label {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}
.q-item__label + .q-item__label {
  margin-top: 4px;
}

.q-item__section {
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  flex-wrap: wrap;
  padding-right: 0;
  padding-left: 16px;
  width: auto;
  min-width: 0;
  max-width: 100%;
  cursor: pointer !important;
}

.q-item__section--main {
  width: auto;
  min-width: 0;
  max-width: 100%;
  flex: 10000 1 0%;
}

.q-chip {
  display: inline-flex;
  vertical-align: middle;
  border-radius: 16px;
  flex-direction: column;
  outline: 0;
  position: relative;
  // height: 2em;
  max-width: 100%;
  margin: 4px;
  background: #e0e0e0;
  color: rgba(0, 0, 0, 0.87);
  font-size: 14px;
  padding: 0.5em 0.9em;
}

.column {
  flex-direction: column;
}
</style>
