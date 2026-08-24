<template>
  <div class="comment-container">
    <!-- 作者连载区域 -->
    <div v-if="hasAuthorComments" class="series-container">
      <h2>{{ $t('comment.seriesCount', { count: authorComments.length }) }}</h2>
      <div
        v-for="comment in authorComments"
        :key="comment.id"
        class="series-item"
      >
        <div class="series-header">
          <div class="user-info">
            <div class="avatar">
              <img alt="avatar" :src="comment.user.avatar_url" />
            </div>
            <span class="username">{{ comment.user.login }}</span>
            <span class="time">{{ timeAgo(comment.updated_at) }}</span>
          </div>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="goEditComment(comment.id)"
          >
            {{ $t('comment.editPost') }}
          </el-button>
        </div>
        <div
          class="series-content markdown-body"
          v-html="processSeriesContent(comment.body_html, comment.id)"
        ></div>
      </div>
    </div>

    <!-- 访客留言区域 -->
    <div id="blog-comments" class="comments-container">
      <h2>{{ $t('comment.commentsCount', { count: visitorComments.length }) }}</h2>
      <div v-if="!visitorComments.length" class="comment-empty">
        {{ $t('comment.emptyComments') }}
      </div>
      <div
        v-for="comment in visitorComments"
        :key="comment.id"
        class="comment-item"
      >
        <div class="user-info">
          <div class="avatar">
            <img alt="avatar" :src="comment.user.avatar_url" />
          </div>
          <a
            class="username"
            :href="comment.user.html_url"
            target="_blank"
            rel="noopener noreferrer"
          >{{ comment.user.login }}</a>
          <a
            class="time"
            :href="commentPermalink(comment.id)"
            target="_blank"
            rel="noopener noreferrer"
            :title="$t('comment.viewOnGithub')"
          >{{ timeAgo(comment.updated_at) }}</a>
        </div>
        <div class="comment-content markdown-body" v-html="comment.body_html"></div>
      </div>
    </div>

    <!-- 在当前页留言 -->
    <div class="comment-action">
      <p class="comment-hint">{{ $t('comment.addCommentHint') }}</p>
      <Utterances
        v-if="githubRepo && issueTerm"
        :repo="githubRepo"
        :issue-term="issueTerm"
      />
    </div>
  </div>
</template>

<script>
import http from '../plugins/http/http'
import { formatPassTime } from '@/utils/date'
import { SERIES_KEY } from '@/utils/constants'
import Catalog from './Catalog.vue'
import Utterances from './Utterances.vue'
import { isStaticClient } from '@/utils/github'

export default {
  name: 'Comment',
  components: {
    Catalog,
    Utterances
  },
  props: {
    preloadedComments: {
      type: Array,
      default: () => []
    },
    issueTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      comments: [],
      authorName: this.$store.state.blog.userName
    }
  },
  computed: {
    postId() {
      return this.$route.params.id || this.$route.query.id
    },
    githubRepo() {
      return this.$store.getters['blog/repository']
    },
    issueTerm() {
      return (this.issueTitle || '').trim()
    },
    issueUrl() {
      return `https://github.com/${this.githubRepo}/issues/${this.postId}`
    },
    authorComments() {
      return this.comments.filter(
        (comment) => comment.user.login === this.authorName
      )
    },
    visitorComments() {
      return this.comments.filter(
        (comment) => comment.user.login !== this.authorName
      )
    },
    hasAuthorComments() {
      return this.authorComments.length > 0
    }
  },
  watch: {
    authorComments: {
      handler(newComments) {
        if (newComments.length > 0) {
          this.$nextTick(() => {
            this.processSeriesContent()
          })
        }
      },
      immediate: true
    }
  },
  created() {
    this.comments = this.preloadedComments || []
    if (process.server) return
    if (this.comments.length) return
    if (isStaticClient()) {
      console.warn('[comment] skip github comments on static host')
      return
    }
    this.getComments()
  },
  methods: {
    timeAgo(d) {
      return formatPassTime(new Date(d), this.$t.bind(this))
    },
    processSeriesContent(content, commentId) {
      if (!content) return ''

      // generate / SSR 没有 document，不能用 DOM；只注入标题 id，目录在客户端再收集
      if (typeof document === 'undefined') {
        let i = -1
        return String(content).replace(
          /<h([23])([^>]*)>([\s\S]*?)<\/h[23]>/gi,
          (match, level, attrs, text) => {
            i++
            const hType = level === '2' ? 'H2' : 'H3'
            const id = `series-heading-${commentId}-${hType}-${i}`
            return `<h${level} id="${id}">${text}</h${level}>`
          }
        )
      }

      // 创建临时 DOM 元素来解析 HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content

      // 只获取 h2 和 h3 标签
      const headings = tempDiv.querySelectorAll('h2, h3')
      let i = -1

      // 收集标题信息
      const seriesHeadings = []
      headings.forEach((heading) => {
        i++
        const tagName = heading.tagName.toLowerCase() // h2 或 h3
        const hType = tagName === 'h2' ? 'H2' : 'H3' // 转换为 H2 或 H3
        const id = `series-heading-${commentId}-${hType}-${i}`

        // 为标题添加 id
        heading.id = id

        // 收集标题信息，添加正确的类型
        seriesHeadings.push({
          id,
          type: hType, // 确保类型是 H2 或 H3
          text: heading.textContent.trim(),
          level: tagName === 'h2' ? 2 : 3 // 可选：添加层级信息
        })
      })

      // 按层级组织标题
      const organizedHeadings = []
      let currentH2 = null

      seriesHeadings.forEach((heading) => {
        if (heading.type === 'H2') {
          currentH2 = heading
          currentH2.children = []
          organizedHeadings.push(currentH2)
        } else if (heading.type === 'H3' && currentH2) {
          currentH2.children.push(heading)
        }
      })

      // 发送标题数据给父组件
      if (seriesHeadings.length > 0) {
        this.$nextTick(() => {
          const seriesNav = {
            text: SERIES_KEY,
            children: organizedHeadings
          }

          this.$emit('series-content-updated', seriesNav)
        })
      }

      return tempDiv.innerHTML
    },

    async getComments() {
      try {
        const { data } = await http.get(
          `/repos/${this.$store.getters['blog/repository']}/issues/${this.postId}/comments`
        )
        this.comments = data
      } catch (err) {
        console.warn('[comment] skip comments after network error', err && err.message)
      }
    },

    commentPermalink(commentId) {
      return `${this.issueUrl}#issuecomment-${commentId}`
    },

    goEditComment(commentId) {
      window.open(this.commentPermalink(commentId), '_blank', 'noopener,noreferrer')
    },

    scrollToSection(id) {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    },

    updateCurrentSeries() {
      // 获取当前可见的连载文章内容
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const seriesItem = entry.target
              this.currentSeriesContent = seriesItem.innerHTML
            }
          })
        },
        {
          threshold: 0.5
        }
      )

      // 观察所有连载文章
      document.querySelectorAll('.series-content').forEach((content) => {
        observer.observe(content)
      })
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.updateCurrentSeries()
    })
  }
}
</script>

<style scoped lang="scss">
.comment-container {
  margin: 20px 0;
}

.series-container,
.comments-container {
  margin-bottom: 30px;
}

.series-item,
.comment-item {
  padding: 20px;
  margin-bottom: 16px;
  border-radius: 4px;
  background: var(--background-color);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

.series-item {
  border-left: 4px solid #409eff;
}

.series-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.username {
  font-weight: 600;
  margin-right: 10px;
  color: var(--juejin-font-1);
  text-decoration: none;

  &:hover {
    color: var(--theme-color);
  }
}

.time {
  color: var(--juejin-font-3);
  font-size: 13px;
  text-decoration: none;

  &:hover {
    color: var(--theme-color);
    text-decoration: underline;
  }
}

.comment-empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--juejin-font-3);
  font-size: 14px;
  background: var(--card-bg);
  border: 1px dashed var(--border-color);
  border-radius: 8px;
}

.series-content,
.comment-content {
  padding: 10px 0;
  line-height: 1.6;
}

.comment-action {
  margin: 30px 0;
  text-align: left;
}

.comment-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--juejin-font-3);
  line-height: 1.6;
}

.comment-github-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 6px;
  background: var(--theme-color);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;

  &:hover {
    opacity: 0.9;
    color: #fff;
    text-decoration: none;
  }
}

.comment-subhint {
  margin: 12px 0 0;
  font-size: 12px;
  color: var(--juejin-font-3);

  a {
    color: var(--theme-color);
  }
}

h2 {
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 18px;
  color: var(--juejin-font-1);
}

.series-catalog {
  position: fixed;
  top: 100px;
  right: 20px;
  width: 300px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  @media (max-width: 1600px) {
    display: none;
  }
}
</style>
