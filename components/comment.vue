<template>
  <div class="comment-container">
    <!-- 作者连载区域 -->
    <div v-if="hasAuthorComments" class="series-container">
      <h2>文章连载（{{ authorComments.length }} 篇）</h2>
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
            <span class="time">{{ comment.updated_at | timeAgo }}</span>
          </div>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="goEditComment(comment.id)"
          >
            编辑文章
          </el-button>
        </div>
        <div
          class="series-content"
          v-html="processSeriesContent(comment.body_html, comment.id)"
        ></div>
      </div>
    </div>

    <!-- 访客留言区域 -->
    <div class="comments-container">
      <h2>留言（{{ visitorComments.length }} 条）</h2>
      <div
        v-for="comment in visitorComments"
        :key="comment.id"
        class="comment-item"
      >
        <div class="user-info">
          <div class="avatar">
            <img alt="avatar" :src="comment.user.avatar_url" />
          </div>
          <span class="username">{{ comment.user.login }}</span>
          <span class="time">{{ comment.updated_at | timeAgo }}</span>
        </div>
        <div class="comment-content" v-html="comment.body_html"></div>
      </div>
    </div>

    <!-- 评论按钮 -->
    <div class="comment-action">
      <el-button type="primary" @click="goAddComment">
        <i class="el-icon-plus"></i>
        添加留言
      </el-button>
    </div>
  </div>
</template>

<script>
import http from '../plugins/http/http'
import { formatPassTime } from '@/utils/date'
import Catalog from './Catalog.vue'

export default {
  name: 'Comment',
  components: {
    Catalog
  },
  filters: {
    timeAgo(d) {
      return formatPassTime(new Date(d))
    }
  },
  data() {
    return {
      comments: [],
      addCommentUrl: `https://github.com/${this.$store.getters['blog/repository']}/issues/${this.$route.query.id}`,
      authorName: this.$store.state.blog.userName
    }
  },
  computed: {
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
    this.getComments()
  },
  methods: {
    processSeriesContent(content, commentId) {
      if (!content) return ''

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
        const hType = heading.tagName.charAt(1) // 获取标题级别（2或3）
        const id = `series-heading-${commentId}-H${hType}-${i}`

        // 为标题添加 id
        heading.id = id

        // 收集标题信息
        seriesHeadings.push({
          id,
          type: `H${hType}`,
          text: heading.textContent.trim()
        })
      })

      // 发送标题数据给父组件
      if (seriesHeadings.length > 0) {
        this.$nextTick(() => {
          const seriesNav = {
            text: '连载文章',
            children: seriesHeadings
          }
          this.$emit('series-content-updated', seriesNav)
        })
      }

      return tempDiv.innerHTML
    },

    async getComments() {
      try {
        const { data } = await http.get(
          `/repos/${this.$store.getters['blog/repository']}/issues/${this.$route.query.id}/comments`
        )
        this.comments = data
      } catch (err) {
        console.error('Failed to fetch comments:', err)
      }
    },

    goAddComment() {
      location.href = this.addCommentUrl
    },

    goEditComment(commentId) {
      const editUrl = `https://github.com/${this.$store.getters['blog/repository']}/issues/${this.$route.query.id}#issuecomment-${commentId}`
      window.open(editUrl, '_blank')
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
    },

    processedContent(content) {
      // 处理连载文章的内容，为标题添加 id
      let i = -1
      const processedHtml = (content || '').replace(
        /<h([2-3]) (.*?)>(.*?)<\/h[2-3]>/g,
        (_, hType, style, text) => {
          i++
          const id = `series-heading-H${hType}-${i}`
          return `<h${hType} id="${id}">${text}</h${hType}>`
        }
      )

      // 发送处理后的内容给父组件更新目录
      this.$emit('series-content-updated', processedHtml)
      return processedHtml
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
  background: #fff;
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;

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
}

.time {
  color: #909399;
  font-size: 13px;
}

.series-content,
.comment-content {
  padding: 10px 0;
  line-height: 1.6;
}

.comment-action {
  text-align: center;
  margin: 30px 0;
}

h2 {
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 18px;
  color: #303133;
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
