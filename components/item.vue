<template>
  <div class="card-list">
    <div v-show="pending" class="card-container">
      <el-skeleton style="width: 100%; padding: 8px 16px 8px 32px" animated>
        <template slot="template">
          <div v-for="item in emptyArr" :key="item" class="empty-block">
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
    <div v-show="!pending" class="card-container">
      <div v-for="post in postList" :key="post.index" class="card">
        <div class="q-item">
          <div
            class="q-item__section q-item__section--main"
            @click="toPostDetail(post.number)"
          >
            <div>
              <h2 class="text-h6">{{ post.title }}</h2>
              <div class="text-desc text-weight-thin q-mt-sm q-mb-sm">
                {{ post.created_at | dateFormate }}
              </div>
            </div>
            <!-- 展示 4 行内容 -->
            <div class="q-item__label text-body1 text-intro text-justify">
              {{ post.body_html | htmlToText }}
            </div>
          </div>
          <div class="q-item__section column">
            <div
              v-for="label in post.labels"
              :key="label.index"
              outline
              square
              clickable
              class="q-chip label"
              :style="`border-color: 1px solid rgba(27,31,35,.2); color: #fff;background: #${label.color}!important`"
              @click="chipClickHandler(label.name)"
            >
              {{ label.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { dateFormat } from '@/utils/date'
export default {
  name: 'Item',
  filters: {
    dateFormate(d) {
      return dateFormat('YYYY-MM-dd hh:mm:ss', new Date(d))
    },
    htmlToText(h) {
      return h.replace(/<\/?.+?>/g, '')
    }
  },
  props: {
    pending: Boolean,
    postList: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      emptyArr: Array.from({ length: 10 }, (_, i) => i)
    }
  },
  methods: {
    toPostDetail(id) {
      this.$router.push(`/posts/?id=${id}`)
    },
    chipClickHandler(labelName) {
      this.$router.push(`/labels/?name=${labelName}`)
    }
  }
}
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
  // font-size: 1.25rem;
  // font-weight: 500;
  line-height: 2rem;
  margin: 0;
  letter-spacing: 0.0125em;
  color: var(--theme-color);
  border-bottom: none;
}
.text-body1 {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5rem;
  letter-spacing: 0.03125em;
}
.text-desc {
  color: #86909c !important;
}
.text-intro {
  color: var(--textNormal);
}
.text-justify {
  // text-align: justify;
  // -webkit-hyphens: auto;
  // -ms-hyphens: auto;
  // hyphens: auto;
}

.q-item {
  position: relative;
  margin-top: 16px;
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
  display: -webkit-box;
  word-break: break-all;
  text-overflow: ellipsis;
  overflow: hidden;
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
  // padding-left: 16px;
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
