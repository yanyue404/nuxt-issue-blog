<template>
  <div v-if="relatedPosts.length" class="related-posts">
    <h3 class="related-title">{{ $t('post.relatedPosts') }}</h3>
    <div class="related-list">
      <a
        v-for="post in relatedPosts"
        :key="post.number"
        class="related-item"
        :href="postHref(post.number)"
        @click.prevent="navigate(post.number)"
      >
        <span class="related-item-title">{{ post.title }}</span>
        <span class="related-item-date">{{ formatDate(post.created_at) }}</span>
      </a>
    </div>
  </div>
</template>

<script>
import { isStaticClient } from '@/utils/github'

export default {
  name: 'RelatedPosts',
  props: {
    currentId: {
      type: [Number, String],
      required: true
    },
    labels: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      relatedPosts: []
    }
  },
  watch: {
    currentId: {
      handler() {
        this.loadRelated()
      },
      immediate: true
    }
  },
  methods: {
    async loadRelated() {
      try {
        const posts = await this.getAllPosts()
        if (!posts || !posts.length || !this.labels.length) return
        const labelNames = this.labels.map((l) => l.name)
        const related = posts.filter((p) => {
          if (String(p.number) === String(this.currentId)) return false
          return (p.labels || []).some((l) => labelNames.includes(l.name))
        })
        this.relatedPosts = related.slice(0, 5)
      } catch (e) {
        // silently fail
      }
    },
    async getAllPosts() {
      const store = this.$store
      if (store.state.blog.allPosts && store.state.blog.allPosts.length) {
        return store.state.blog.allPosts
      }
      return await store.dispatch('blog/ensureStaticPosts')
    },
    postHref(number) {
      const base = this.$store.state.blog.baseUrl || '/blog/'
      return `${base}post/${number}/`
    },
    navigate(number) {
      if (isStaticClient()) {
        window.location.href = this.postHref(number)
      } else {
        this.$router.push(`/post/${number}`)
      }
    },
    formatDate(d) {
      if (!d) return ''
      return new Date(d).toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style lang="scss" scoped>
.related-posts {
  margin: 0;
  padding: 0;
}

.related-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--juejin-font-3);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin: 0 0 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.related-item {
  display: block;
  padding: 8px 0;
  text-decoration: none;
  border-bottom: 1px dashed var(--border-color, #f0f0f0);
  transition: color 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover .related-item-title {
    color: var(--theme-color);
  }
}

.related-item-title {
  font-size: 13px;
  color: var(--juejin-font-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.related-item-date {
  font-size: 11px;
  color: var(--juejin-font-3);
  margin-top: 3px;
  display: block;
}
</style>
