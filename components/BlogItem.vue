<template>
  <div class="card-list">
    <div v-show="pending" class="card-container">
      <el-skeleton style="width: 100%" animated>
        <template slot="template">
          <div v-for="item in emptyArr" :key="item" class="empty-block">
            <el-skeleton-item variant="h3" class="sk-title" />
            <div class="sk-meta">
              <el-skeleton-item variant="text" class="sk-date" />
              <el-skeleton-item variant="text" class="sk-tag" />
              <el-skeleton-item variant="text" class="sk-tag" />
            </div>
            <el-skeleton-item variant="text" class="sk-line" />
            <el-skeleton-item variant="text" class="sk-line sk-line--short" />
          </div>
        </template>
      </el-skeleton>
    </div>
    <div v-show="!pending" class="card-container">
      <article
        v-for="post in postList"
        :key="post.number"
        class="post-item"
        @click="toPostDetail(post.number)"
      >
        <h2 class="post-title">{{ post.title }}</h2>
        <div class="post-meta">
          <time class="post-date">{{ post.created_at | dateFormate }}</time>
          <span
            v-for="label in post.labels"
            :key="label.id || label.name"
            class="post-tag"
            :style="`--label-color: #${label.color}`"
            @click.stop="chipClickHandler(label.name)"
          >{{ label.name }}</span>
        </div>
        <p class="post-excerpt">{{ post.body_html | htmlToText }}</p>
      </article>
    </div>
  </div>
</template>

<script>
import { dateFormat } from '@/utils/date'
import { isStaticClient } from '@/utils/github'
export default {
  name: 'Item',
  filters: {
    dateFormate(d) {
      return dateFormat('YYYY-MM-dd', new Date(d))
    },
    htmlToText(html) {
      if (!html) return ''
      return (
        html
          .replace(/<\/?.+?>/g, '')
          .replace(/\s+/g, ' ')
          .replace(/&[a-zA-Z]+;/g, '')
          .trim()
          .substring(0, 160) + '...'
      )
    }
  },
  props: {
    pending: {
      type: Boolean,
      default: false
    },
    postList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      emptyArr: Array.from({ length: 8 }, (_, i) => i)
    }
  },
  methods: {
    toPostDetail(id) {
      const path = `/post/${id}`
      if (isStaticClient()) {
        let target = this.$router.resolve(path).href
        if (target.slice(-1) !== '/') target += '/'
        window.location.href = target
        return
      }
      this.$router.push(path)
    },
    chipClickHandler(labelName) {
      this.$router.push(`/label/${encodeURIComponent(labelName)}`)
    }
  }
}
</script>

<style scoped lang="scss">
.card-list {
  margin-top: 0;
}

.card-container {
  background: transparent;
}

.empty-block {
  padding: 24px 0;
  border-bottom: 1px solid var(--border-color, #f0f0f0);

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    border-bottom: none;
  }
}

/* 骨架屏尺寸与真实 .post-item 结构对齐 */
.sk-title {
  width: 62%;
  height: 22px;
  margin-bottom: 12px;
  border-radius: 4px;
}

.sk-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.sk-date {
  width: 76px;
  height: 13px;
  border-radius: 3px;
}

.sk-tag {
  width: 52px;
  height: 18px;
  border-radius: 3px;
}

.sk-line {
  width: 100%;
  height: 13px;
  margin-bottom: 8px;
  border-radius: 3px;
}

.sk-line--short {
  width: 72%;
  margin-bottom: 0;
}

@media (max-width: 767px) {
  .empty-block {
    padding: 16px 0;
  }

  .sk-title {
    height: 18px;
  }
}

.post-item {
  padding: 24px 0;
  border-bottom: 1px solid var(--border-color, #f0f0f0);
  cursor: pointer;
  animation: slideUp 0.4s ease both;

  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.05}s;
    }
  }

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    border-bottom: none;
  }

  &:hover .post-title {
    color: var(--theme-color);
  }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.post-title {
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.5;
  margin: 0 0 8px;
  color: var(--juejin-font-1);
  border-bottom: none;
  transition: color 0.15s;
}

.post-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.post-date {
  font-size: 13px;
  color: var(--juejin-font-3);
}

.post-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 3px;
  background: var(--label-color);
  color: #fff;
  cursor: pointer;
  opacity: 0.85;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
}

.post-excerpt {
  font-size: 14px;
  line-height: 1.7;
  color: var(--juejin-font-2);
  margin: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

@media (max-width: 767px) {
  .post-item {
    padding: 16px 0;
  }

  .post-title {
    font-size: 1rem;
  }

  .post-excerpt {
    font-size: 13px;
    -webkit-line-clamp: 2;
  }
}
</style>
