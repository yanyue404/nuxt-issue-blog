<template>
  <div class="article-block">
    <ReadingProgress />

    <!-- 左侧：浮动目录 -->
    <div v-show="post.id" class="article-sidebar-left">
      <Catalog
        :nav-list="allNavList"
        :active-id="activeId"
        :base-path="currentPath"
        @catalog-click="handleCatalogClick"
      />
    </div>

    <!-- 中间：正文 -->
    <div class="article-center">
      <!-- 加载中骨架屏 -->
      <div v-show="!post.id" class="article-area">
        <el-skeleton style="width: 100%" animated>
          <template slot="template">
            <div class="article-header">
              <div><el-skeleton-item variant="h1" style="width: 50%" /></div>
              <code class="text-italic">
                <el-skeleton-item variant="text" style="width: 25%"
              /></code>
            </div>
            <div v-for="item in [1, 2, 3, 4]" :key="item">
              <el-skeleton-item variant="h2" style="width: 40%" />
              <div style="padding: 14px">
                <el-skeleton v-show="item % 2 === 1" :rows="10" animated />
                <el-skeleton v-show="item % 2 === 0" :rows="4" animated />
                <el-skeleton-item
                  v-show="item % 2 === 0"
                  variant="image"
                  style="width: 100%; height: 240px"
                />
                <el-skeleton v-show="item % 2 === 0" :rows="6" animated />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
      <!-- 正文 -->
      <div v-show="post.id" class="article-area">
        <nav class="breadcrumb">
          <a class="breadcrumb-link" href="/blog/" @click.prevent="goHome">
            <i class="el-icon-house"></i> {{ $t('post.backHome') }}
          </a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">{{ post.title }}</span>
        </nav>
        <PageHeader
          :title="post.title"
          :meta="[
            { icon: 'el-icon-user', text: userName },
            {
              icon: 'el-icon-time',
              text: $t('post.publishedAt', {
                date: formatDateTime(post.created_at)
              })
            },
            { icon: 'el-icon-reading', text: readingTime }
          ]"
        >
          <template #actions>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-edit"
              class="edit-button"
              @click="goEditPost"
            >
              {{ $t('post.editPost') }}
            </el-button>
          </template>
        </PageHeader>
        <div class="q-mt-lg markdown-body post-markdown" v-html="post.body_html" />
        <PostNav :current-id="postId" />
        <el-backtop />
        <Comment
          ref="commentComponent"
          :preloaded-comments="preloadedComments"
          :issue-title="post.title"
          @series-content-updated="handleSeriesContentUpdated"
        ></Comment>
      </div>
    </div>

    <!-- 右侧：推荐阅读 -->
    <div v-show="post.id" class="article-sidebar-right">
      <RelatedPosts :current-id="postId" :labels="post.labels || []" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import http from '@/plugins/http/http'
import Comment from '@/components/comment'
import Catalog from '@/components/Catalog'
import PageHeader from '@/components/PageHeader'
import ReadingProgress from '@/components/ReadingProgress'
import PostNav from '@/components/PostNav'
import RelatedPosts from '@/components/RelatedPosts'
import { formatPassTime, formatDateTime } from '@/utils/date'
import { SERIES_KEY } from '@/utils/constants'
import { decorateIssueHtml, getPostIdFromRoute, isStaticClient } from '@/utils/github'

export default {
  name: 'Post',
  components: {
    Comment,
    Catalog,
    ReadingProgress,
    PostNav,
    RelatedPosts,
    PageHeader
  },
  async asyncData({ params, payload, store, app, error }) {
    const id = params.id
    if (isStaticClient()) {
      console.warn('[post] skip github fetch on static host', id)
      return
    }
    const ungrouped =
      (app.i18n && app.i18n.t && app.i18n.t('post.ungrouped')) || ''
    const buildPayload = (issue, comments) => {
      const { html, navList } = decorateIssueHtml(
        issue.body_html || issue.body || '',
        ungrouped
      )
      return {
        post: Object.assign({}, issue, { body_html: html }),
        navList,
        preloadedComments: comments || []
      }
    }

    // nuxt generate 通过 routes().payload 传入全文；评论失败不阻断页面生成
    if (payload && (payload.id || payload.body_html || payload.title)) {
      let comments = []
      try {
        const repo = store.getters['blog/repository']
        const commentsRes = await http.get(
          `/repos/${repo}/issues/${id}/comments`,
          { timeout: 8000 }
        )
        comments = commentsRes.data || []
      } catch (e) {
        console.warn('[post] comments skipped', id, e && e.message)
      }
      return buildPayload(payload, comments)
    }

    const repo = store.getters['blog/repository']
    let lastErr = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await http.get(`/repos/${repo}/issues/${id}`)
        if (!res || !res.data || !res.data.id) {
          console.warn('[post] empty issue payload', id)
          lastErr = new Error('empty payload')
        } else {
          return buildPayload(res.data, [])
        }
      } catch (err) {
        lastErr = err
        const status = err.response && err.response.status
        console.warn('[post] fetch issue failed', id, {
          attempt,
          status,
          message: err && err.message
        })
        if (status === 404) {
          return error({ statusCode: 404, message: 'Post not found' })
        }
        await new Promise((resolve) => setTimeout(resolve, 600 * attempt))
      }
    }
    console.warn('[post] give up after retries', id, lastErr && lastErr.message)
  },
  data() {
    return {
      post: {},
      navList: [],
      seriesNavList: [],
      activeId: '',
      seriesHeadings: [],
      allSeriesChildren: [],
      observer: null,
      isScrollingToHash: false,
      hashActivated: false, // 用户点击目录后才开始更新 URL hash
      initialHash: '',
      scrollAttempts: 0,
      maxScrollAttempts: 10,
      preloadedComments: []
    }
  },
  head() {
    const postTitle = (this.post && this.post.title) || ''
    const siteTitle = this.$t('seo.title')
    const fullTitle = postTitle ? `${postTitle} | ${siteTitle}` : siteTitle
    const excerpt =
      this.post && this.post.body_html
        ? this.post.body_html
            .replace(/<[^>]+>/g, '')
            .replace(/&[a-zA-Z#0-9]+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 150)
        : ''
    const description = excerpt || this.$t('seo.description')
    const ogTitle = postTitle || siteTitle
    return {
      title: fullTitle,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:type', property: 'og:type', content: 'article' },
        { hid: 'og:title', property: 'og:title', content: ogTitle },
        {
          hid: 'og:description',
          property: 'og:description',
          content: description
        },
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary' },
        { hid: 'twitter:title', name: 'twitter:title', content: ogTitle },
        {
          hid: 'twitter:description',
          name: 'twitter:description',
          content: description
        }
      ]
    }
  },
  computed: {
    ...mapState({
      userName: (state) => state.blog.userName
    }),
    postId() {
      return getPostIdFromRoute(this.$route)
    },
    readingTime() {
      if (!this.post || !this.post.body_html) return ''
      const text = (this.post.body_html || '').replace(/<[^>]+>/g, '')
      const words = text.length
      const minutes = Math.max(1, Math.ceil(words / 400))
      return this.$t('post.readingTime', { min: minutes })
    },
    currentPath() {
      const base = this.$store.state.blog.baseUrl || '/blog/'
      return `${base}post/${this.postId}`
    },
    // 合并主文章和连载文章的目录
    allNavList() {
      // 确保 navList 存在且是数组

      const mainNavList = (this.navList || []).map((item) => ({
        ...item,
        type: 'H2',
        children: (item.children || []).map((child) => ({
          ...child,
          type: 'H3'
        }))
      }))

      // 确保 seriesNavList 存在且有内容
      if (this.seriesNavList && this.seriesNavList.length > 0) {
        mainNavList.push({
          id: 'series-title',
          type: 'H2',
          text: SERIES_KEY,
          children: this.seriesNavList.map((item) => ({
            ...item,
            type: 'H3'
          }))
        })
      }

      return mainNavList
    }
  },
  watch: {
    '$route.params.id'(id) {
      if (!id) return
      this.resetSeriesChildren()
    },
    'post.body_html'() {
      this.$nextTick(() => {
        this.scrollToHashElement()
      })
    }
  },
  created() {
    if (process.client) {
      this.initialHash = window.location.hash // eslint-disable-line nuxt/no-globals-in-created
      if (this.initialHash) {
        this.hashActivated = true
      }
    }
    this.resetSeriesChildren()
    if (this.post && this.post.id) {
      return
    }
    if (isStaticClient()) {
      let target = this.$router.resolve(`/post/${this.postId}`).href
      if (target.slice(-1) !== '/') target += '/'
      console.warn('[post] hard navigate to generated html', target)
      if (typeof window !== 'undefined' && target) {
        const here = window.location.pathname
        if (here.replace(/\/$/, '') + '/' === target.replace(/\/$/, '') + '/') {
          console.warn('[post] already on generated path, skip reload loop')
          return
        }
        window.location.replace(target)
      }
      return
    }
    this.getIssue()
  },
  mounted() {
    this.initIntersectionObserver()
    this.$nextTick(() => {
      this.scrollToHashElement()
    })
  },
  beforeDestroy() {
    // 清理 observer
    if (this.observer) {
      this.observer.disconnect()
    }
  },
  methods: {
    formatPassTime,
    formatDateTime,
    getIssue() {
      const id = this.postId
      if (!id) return
      this.navList = []
      http
        .get(`/repos/${this.$store.getters['blog/repository']}/issues/${id}`)
        .then((res) => {
          if (!res || !res.data) {
            console.error('[post] empty issue payload', id)
            return
          }
          const { html, navList } = decorateIssueHtml(
            res.data.body_html || '',
            this.$t('post.ungrouped')
          )
          this.post = Object.assign({}, res.data, { body_html: html })
          this.navList = navList
          this.$nextTick(() => {
            this.scrollToHashElement(this.initialHash)
          })
        })
        .catch((err) => {
          console.error('[post] fetch issue failed', id, err && err.message)
          if (err.response && err.response.status === 404) {
            this.$router.push('/404')
          }
        })
    },
    chipClickHandler(labelName) {
      this.$router.push(`/label/${encodeURIComponent(labelName)}`)
    },
    toH1(e) {
      e.preventDefault()
      const toElement = document.querySelector(e.target.hash)
      toElement && toElement.scrollIntoView({ behavior: 'smooth' })
    },
    toText(text) {
      return text.replace(/<[^>]*>/g, '')
    },
    handleSeriesContentUpdated(seriesNav) {
      // 将新的目录项添加到集合中
      this.allSeriesChildren = [
        ...this.allSeriesChildren,
        ...seriesNav.children
      ]

      // 找到现有的连载文章目录项或创建新的
      const existingSeriesIndex = this.navList.findIndex(
        (item) => item.text === SERIES_KEY
      )

      if (existingSeriesIndex >= 0) {
        // 更新现有的连载文章目录，使用完整的集合
        this.navList[existingSeriesIndex].children = this.allSeriesChildren
      } else {
        // 添加新的连载文章目录，使用完整的集合
        this.navList.push({
          text: SERIES_KEY,
          children: this.allSeriesChildren
        })
      }

      // 更新目录后，再次尝试滚动到初始 hash 位置
      this.$nextTick(() => {
        this.scrollToHashElement(this.initialHash)
      })
    },
    initIntersectionObserver() {
      // 确保在客户端执行
      if (!process.client) return

      if (this.observer) {
        this.observer.disconnect()
      }

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.activeId = entry.target.id
              // 只有用户主动点击过目录后才更新 URL hash
              if (this.hashActivated && !this.isScrollingToHash) {
                const newUrl = `${this.currentPath}#${entry.target.id}`
                window.history.replaceState(null, '', newUrl)
              }
            }
          })
        },
        {
          threshold: 0.5,
          rootMargin: '-70px 0px -70% 0px'
        }
      )

      this.$nextTick(() => {
        document.querySelectorAll('h2, h3').forEach((heading) => {
          this.observer.observe(heading)
        })
      })
    },
    handleCatalogClick(id) {
      const element = document.getElementById(id)
      if (element) {
        this.hashActivated = true
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        const newUrl = `${this.currentPath}#${id}`
        window.history.replaceState(null, '', newUrl)
        this.activeId = id
      }
    },
    goHome() {
      const base = this.$store.state.blog.baseUrl || '/blog/'
      if (isStaticClient()) {
        window.location.href = base
      } else {
        this.$router.push('/')
      }
    },
    goEditPost() {
      const editUrl = `https://github.com/${this.$store.getters['blog/repository']}/issues/${this.postId}`
      window.open(editUrl, '_blank')
    },
    updateCurrentSeries() {
      // 重置标题集合
      this.seriesHeadings = []

      // 获取所有连载文章内容
      const seriesContents = document.querySelectorAll('.series-content')
      if (!seriesContents.length) return

      // 处理所有连载文章的内容
      seriesContents.forEach((content) => {
        this.processSeriesContent(content.innerHTML)
      })
    },
    processSeriesContent(content) {
      if (!content || typeof content !== 'string') {
        console.warn('Invalid content provided to processSeriesContent')
        return ''
      }

      // 创建临时 DOM 元素来解析 HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content

      // 只获取 h2 和 h3 标签
      const headings = tempDiv.querySelectorAll('h2, h3')
      let i = -1

      headings.forEach((heading) => {
        i++
        const hType = heading.tagName.charAt(1) // 获取标题级别（2或3）
        const id = `series-heading-H${hType}-${i}`

        // 收集标题信息
        this.seriesHeadings.push({
          id,
          type: `H${hType}`,
          text: this.stripHtml(heading.innerHTML)
        })

        // 为标题添加 id
        heading.id = id
      })

      // 只在有处理结果时才发送更新
      if (this.seriesHeadings.length > 0) {
        this.$nextTick(() => {
          const seriesNav = {
            text: SERIES_KEY,
            children: this.seriesHeadings
          }
          this.handleSeriesContentUpdated(seriesNav)
        })
      }

      return tempDiv.innerHTML
    },
    stripHtml(html) {
      if (!html) return ''
      return html
        .replace(/<[^>]+>/g, '')
        .replace(/&[^;]+;/g, '')
        .trim()
    },
    // 在路由变化或组件创建时重置集合
    resetSeriesChildren() {
      this.allSeriesChildren = []
    },
    scrollToHashElement(hash) {
      // 确保在客户端执行
      if (!process.client) return

      const currentHash = hash || window.location.hash
      if (!currentHash) return

      const id = currentHash.slice(1)
      const element = document.getElementById(id)

      if (element) {
        this.isScrollingToHash = true
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
          this.activeId = id
          this.isScrollingToHash = false
          this.scrollAttempts = 0
        }, 100)
      } else if (this.scrollAttempts < this.maxScrollAttempts) {
        this.scrollAttempts++
        setTimeout(() => {
          this.scrollToHashElement(currentHash)
        }, 200)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.article-block {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 32px;
  gap: 48px;
  position: relative;
  box-sizing: border-box;
}
.article-sidebar-left {
  width: 220px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 8px;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.08);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.15);
  }
}
.article-center {
  flex: 1;
  min-width: 0;
  width: 100%;
  max-width: 820px;
}
.article-sidebar-right {
  width: 200px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding-top: 8px;

  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
}
.article-header {
  margin-bottom: 20px;

  h1 {
    margin: 0 0 12px 0;
  }
}
.article-area {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 0 20px;
  font-size: 13px;
  color: var(--juejin-font-3);
}
.breadcrumb-link {
  color: var(--juejin-font-3);
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: var(--theme-color);
  }

  i {
    margin-right: 2px;
  }
}
.breadcrumb-sep {
  color: #ccc;
}
.breadcrumb-current {
  color: var(--juejin-font-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 500px;
}

@media (max-width: 1200px) {
  .article-sidebar-right {
    display: none;
  }
  .article-block {
    gap: 32px;
    padding: 24px 20px;
  }
}
@media (max-width: 860px) {
  .article-sidebar-left {
    display: none;
  }
  .article-block {
    display: block;
    padding: 16px;
    gap: 0;
    max-width: 100%;
  }
  .article-center {
    max-width: 100%;
    width: 100%;
  }
  .breadcrumb-current {
    max-width: 50vw;
  }
}
.article-catalog {
  width: 100%;
  padding: 0;

  .catalog-title {
    padding: 0 0 10px;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--juejin-font-3);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    border-bottom: 1px solid var(--border-color);
    line-height: 1.5;

    div {
      display: inline-block;
    }
  }

  .catalog-body {
    max-height: calc(100vh - 180px);
    overflow-y: auto;
    padding: 0;

    &::-webkit-scrollbar {
      width: 2px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #e0e0e0;
      border-radius: 2px;
    }
  }

  .catalog-list {
    .item {
      margin: 0;

      .a-container {
        position: relative;
        transition: all 0.15s ease;
      }

      .catalog-aTag {
        display: block;
        padding: 5px 10px;
        color: var(--juejin-font-2);
        font-size: 13px;
        line-height: 1.5;
        transition: color 0.15s ease;
        text-decoration: none;
        white-space: nowrap;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: thin;
        scrollbar-color: transparent transparent;

        &::-webkit-scrollbar {
          height: 3px;
        }
        &::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 3px;
        }
        &:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
        }
        &:hover {
          color: var(--theme-color);
          scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
        }
      }

      &.active {
        > .a-container {
          .catalog-aTag {
            color: var(--theme-color);
            font-weight: 500;
          }

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 2px;
            height: 16px;
            background: var(--theme-color);
            border-radius: 1px;
          }
        }
      }

      &.d1 {
        .catalog-aTag {
          font-weight: 500;
          color: var(--juejin-font-1);
          font-size: 13px;
        }
      }

      &.d3 {
        .a-container {
          padding-left: 16px;

          &::before {
            left: 16px;
          }
        }
      }
    }
  }
}
.catalog-block {
  margin-bottom: 0;
  min-height: auto;
}

.catalog-body.unfold {
  width: 100%;
  margin: 8px 0 0 0;
  max-height: 70vh;
  overflow-y: auto;
}

.catalog-body::-webkit-scrollbar {
  width: 4px;
  height: 80px;
}

.catalog-body::-webkit-scrollbar-track {
  box-shadow: none;
  border-radius: 2px;
}

.catalog-body::-webkit-scrollbar-thumb {
  background-color: #e4e6eb;
  outline: none;
  border-radius: 50px;
}

.catalog-list {
  position: relative;
  padding: 0 0 12px;
}

.catalog-list .catalog-aTag {
  color: inherit;
  display: inline-block;
  padding: 0 8px 8px;
  width: 90%;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;

  &::-webkit-scrollbar {
    height: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 3px;
  }
  &:hover::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
  }
  &:hover {
    scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
  }
}

.catalog-list .catalog-aTag.d1-aTag-title {
  padding-top: 4px;
  line-height: 22px;
}

.catalog-list .a-container:hover {
  cursor: pointer;
}

.catalog-list .a-container:hover .catalog-aTag {
  color: #1e80ff;
}

.catalog-list .sub-list {
  margin: 0;
  padding: 0;
}

.catalog-list .item {
  margin: 0;
  padding: 0;
  font-size: 14px;
  font-weight: 400;
  // color: var(--juejin-font-1);
  list-style: none;
}

.catalog-list .item .a-container {
  display: block;
  position: relative;
  padding: 0 0 0 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.catalog-list .item.d1 {
  font-weight: 400;
  // color: var(--juejin-font-1);
}

.catalog-list .item.d1 .a-container {
  margin: 0;
  padding: 0 0 0 11px;
}

.catalog-list .item.d1 .a-container:before {
  left: 5px;
  margin-top: -3px;
  width: 6px;
  height: 6px;
}

.catalog-list .item.d1 .a-container .d1-aTag-title {
  font-size: 14px;
}

.catalog-list .item.d1:first-child .a-container {
  margin-top: 0;
}

.catalog-list .item.d2 {
  // color: var(--juejin-font-2);
}

.catalog-list .item.d2 .a-container {
  padding-left: 26px;
}

.catalog-list .item.d2 .a-container:before {
  left: 24px;
}

.catalog-list .item.d3 {
  // color: var(--juejin-font-3);
}

.catalog-list .item.d3 .a-container {
  padding-left: 41px;
}

.catalog-list .item.d3 .a-container:before {
  left: 39px;
}

.catalog-list .item.active > .a-container {
  color: #1e80ff;
}

.catalog-list .item.active > .a-container:before {
  content: '';
  position: absolute;
  top: -4px;
  left: 0;
  margin-top: 7px;
  width: 3px;
  height: 14px;
  background: #1e80ff;
  border-radius: 2px;
}

.catalog-list .item.d1.active > .a-container:before {
  top: 2px;
}

@-webkit-keyframes skeleton-keyframes {
  0% {
    background-position: 0 0;
  }

  to {
    background-position: 480px 0;
  }
}

::v-deep {
  .el-skeleton__h1 {
    height: 2.5em;
    margin-bottom: 16px;
    margin-top: 24px;
    padding-bottom: 0.3em;
  }
  .el-skeleton__h2 {
    height: 1.5em;
    margin-bottom: 16px;
    margin-top: 24px;
    padding-bottom: 0.3em;
  }
  .el-backtop {
    color: var(--theme-color);
  }
  .el-button--primary {
    // 样式已移至 default.vue
  }
}
::v-deep {
  .wrapper {
    width: 100%;
    height: 80vh;
  }
  a:hover {
    text-decoration: none;
  }
  a:active {
    color: #1e80ff;
  }
}

.series-title {
  color: var(--theme-color);
  font-weight: 600;
  cursor: default;
}

.catalog-aTag {
  &:hover {
    color: var(--theme-color);
  }
}

.active {
  > .a-container > .catalog-aTag {
    color: var(--theme-color);
  }
}

.d2-aTag-title {
  font-size: 13px;
}

.d3-aTag-title {
  font-size: 12px;
  color: var(--juejin-font-3);
}

.header-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-italic {
  font-style: italic;
  color: var(--juejin-font-3);
  font-size: 14px;
}

::v-deep .edit-button {
  // 样式已移至 default.vue
}
</style>
