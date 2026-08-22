<template>
  <nav v-if="prevPost || nextPost" class="post-nav">
    <a
      v-if="prevPost"
      class="post-nav-item prev"
      :href="postHref(prevPost.number)"
      @click.prevent="navigate(prevPost.number)"
    >
      <span class="post-nav-arrow">←</span>
      <span class="post-nav-body">
        <span class="post-nav-label">{{ $t('post.prevPost') }}</span>
        <span class="post-nav-title">{{ prevPost.title }}</span>
      </span>
    </a>
    <span v-else class="post-nav-item placeholder"></span>
    <a
      v-if="nextPost"
      class="post-nav-item next"
      :href="postHref(nextPost.number)"
      @click.prevent="navigate(nextPost.number)"
    >
      <span class="post-nav-body">
        <span class="post-nav-label">{{ $t('post.nextPost') }}</span>
        <span class="post-nav-title">{{ nextPost.title }}</span>
      </span>
      <span class="post-nav-arrow">→</span>
    </a>
    <span v-else class="post-nav-item placeholder"></span>
  </nav>
</template>

<script>
import { isStaticClient } from '@/utils/github'

export default {
  name: 'PostNav',
  props: {
    currentId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      prevPost: null,
      nextPost: null
    }
  },
  watch: {
    currentId: {
      handler() {
        this.loadNeighbors()
      },
      immediate: true
    }
  },
  methods: {
    async loadNeighbors() {
      try {
        const posts = await this.getAllPosts()
        if (!posts || !posts.length) return
        const idx = posts.findIndex(
          (p) => String(p.number) === String(this.currentId)
        )
        if (idx === -1) return
        this.prevPost = idx > 0 ? posts[idx - 1] : null
        this.nextPost = idx < posts.length - 1 ? posts[idx + 1] : null
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
    }
  }
}
</script>

<style lang="scss" scoped>
.post-nav {
  display: flex;
  gap: 16px;
  margin: 40px 0 20px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.post-nav-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  border: 1px solid var(--border-color);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--theme-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &.next {
    text-align: right;
    justify-content: flex-end;
  }

  &.placeholder {
    visibility: hidden;
  }
}

.post-nav-arrow {
  font-size: 20px;
  color: var(--theme-color);
  flex-shrink: 0;
}

.post-nav-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.post-nav-label {
  font-size: 12px;
  color: var(--juejin-font-3, #8a919f);
  text-transform: uppercase;
}

.post-nav-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--juejin-font-1, #252933);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-word;
  white-space: normal;
}

@media (max-width: 768px) {
  .post-nav {
    flex-direction: column;
    gap: 10px;
  }

  .post-nav-item.placeholder {
    display: none;
  }
}
</style>
