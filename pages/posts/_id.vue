<template>
  <div class="article-block">
    <!-- 加载中，文章骨架屏 -->
    <div v-show="!post.id" class="main-area article-area">
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
    <!-- 加载完毕 -->
    <div v-show="post.id" class="main-area article-area" padding>
      <div class="article-header">
        <h1 class="rainbow">{{ post.title }}</h1>
        <div class="header-bottom">
          <code class="text-italic"
            >Updated by {{ userName }} {{ post.updated_at | timeAgo }}</code
          >
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            class="edit-button"
            @click="goEditPost"
          >
            编辑文章
          </el-button>
        </div>
      </div>
      <div class="q-mt-lg" v-html="post.body_html" />
      <el-backtop />
      <Comment
        ref="commentComponent"
        @series-content-updated="handleSeriesContentUpdated"
      ></Comment>
    </div>
    <div class="article-gap"></div>

    <!-- 统一的目录 -->
    <div v-show="post.id" class="article-sideBar">
      <Catalog
        :nav-list="allNavList"
        :active-id="activeId"
        :base-path="currentPath"
        @catalog-click="handleCatalogClick"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import http from '../../plugins/http/http'
import Comment from '../../components/comment'
import Catalog from '../../components/Catalog'
import { formatPassTime } from '@/utils/date'

export default {
  name: 'Post',
  components: {
    Comment,
    Catalog
  },
  filters: {
    timeAgo(d) {
      return d && formatPassTime(new Date(d))
    }
  },
  data() {
    return {
      post: {},
      navList: [],
      seriesNavList: [],
      activeId: '',
      seriesHeadings: [], // 存储所有连载文章的标题
      allSeriesChildren: [] // 存储所有连载文章的目录项
    }
  },
  computed: {
    ...mapState({
      userName: (state) => state.blog.userName
    }),
    currentPath() {
      return `/blog/posts/?id=${this.$route.query.id}`
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
          text: '连载文章',
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
    $route() {
      // 路由变化时重新获取文章
      this.getIssue()
      this.resetSeriesChildren()
    }
  },
  created() {
    // this.$q.loading.show({ delay: 250 });
    this.resetSeriesChildren()
    this.getIssue()
  },
  mounted() {
    this.initIntersectionObserver()
  },
  methods: {
    getIssue() {
      http
        .get(
          `/repos/${this.$store.getters['blog/repository']}/issues/${this.$route.query.id}`
        )
        .then((res) => {
          this.post = res.data
          let i = -1
          let h2Index = -1

          this.post.body_html = res.data.body_html.replace(
            /<h([2-3]) (.*?)>(.*?)<\/h[2-3]>/g,
            (_, hType, style, text) => {
              i++
              const id = `main-heading-H${hType}-${i}`

              if (hType === '2') {
                h2Index++
                this.navList.push({
                  text: text,
                  id,
                  type: 'H2',
                  children: []
                })
              } else if (hType === '3' && h2Index >= 0) {
                // 确保有父级 h2 标题
                if (!this.navList[h2Index]) {
                  // 如果没有父级 h2,创建一个默认分组
                  h2Index++
                  this.navList.push({
                    text: '未分组',
                    id: `default-h2-${h2Index}`,
                    type: 'H2',
                    children: []
                  })
                }
                this.navList[h2Index].children.push({
                  text: text,
                  id,
                  type: 'H3'
                })
              }
              return `<h${hType} id="${id}">${text}</h${hType}>`
            }
          )
          // this.$q.loading.hide();
        })
        .catch((err) => {
          if (err.response.status === 404) {
            this.$router.push('/404')
          }
        })
    },
    chipClickHandler(labelName) {
      this.$router.push(`/labels/?label=${labelName}`)
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
        (item) => item.text === '连载文章'
      )

      if (existingSeriesIndex >= 0) {
        // 更新现有的连载文章目录，使用完整的集合
        this.navList[existingSeriesIndex].children = this.allSeriesChildren
      } else {
        // 添加新的连载文章目录，使用完整的集合
        this.navList.push({
          text: '连载文章',
          children: this.allSeriesChildren
        })
      }
    },
    initIntersectionObserver() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.activeId = entry.target.id
            }
          })
        },
        {
          threshold: 0.5
        }
      )

      this.$nextTick(() => {
        document.querySelectorAll('h2, h3').forEach((heading) => {
          observer.observe(heading)
        })
      })
    },
    handleCatalogClick(id) {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        // 更新 URL
        const newUrl = `${this.currentPath}#${id}`
        window.history.replaceState(null, '', newUrl)
      }
    },
    goEditPost() {
      const editUrl = `https://github.com/${this.$store.getters['blog/repository']}/issues/${this.$route.query.id}`
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
            text: '连载文章',
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
    }
  }
}
</script>

<style lang="scss" scoped>
.article-block {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.article-header {
  margin-bottom: 20px;

  h1 {
    margin: 0 0 12px 0;
  }
}
.article-area {
  position: relative;
  width: 820px;
  max-width: 100%;
  box-sizing: border-box;
  padding-right: 15px;
}
.article-gap {
  width: 15px;
  min-height: 100vh;
  background-color: #f2f3f5;
}
.article-sideBar {
  width: 300px;
  position: relative;
  margin-right: -15px;
  background-color: #f2f3f5;
}
.article-catalog {
  position: sticky;
  top: 20px;
  width: 300px;
  background: var(--background-color);
  border-radius: 12px;
  padding: 16px 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  }

  .catalog-title {
    padding: 0 24px;
    margin-bottom: 12px;
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-color);
    line-height: 1.5;
    border-bottom: 2px solid #eee;
    padding-bottom: 12px;

    div {
      position: relative;
      display: inline-block;

      &::after {
        content: '';
        position: absolute;
        bottom: -14px;
        left: 0;
        width: 100%;
        height: 2px;
        background: var(--theme-color);
        transition: all 0.3s ease;
      }
    }
  }

  .catalog-body {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    padding: 0 8px;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #e0e0e0;
      border-radius: 4px;

      &:hover {
        background: #d0d0d0;
      }
    }
  }

  .catalog-list {
    .item {
      margin: 4px 0;

      .a-container {
        position: relative;
        border-radius: 6px;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(30, 128, 255, 0.05);
        }
      }

      .catalog-aTag {
        display: block;
        padding: 8px 16px;
        color: #666;
        font-size: 14px;
        line-height: 1.5;
        transition: all 0.2s ease;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &:hover {
          color: var(--theme-color);
        }
      }

      &.active {
        > .a-container {
          background: rgba(30, 128, 255, 0.08);

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
            width: 3px;
            height: 24px;
            background: var(--theme-color);
            border-radius: 0 3px 3px 0;
          }
        }
      }

      &.d1 {
        .catalog-aTag {
          font-weight: 500;
          color: #333;
        }
      }

      &.d3 {
        .a-container {
          padding-left: 24px;

          &::before {
            left: 24px;
          }
        }
      }
    }
  }
}
.catalog-block {
  border-radius: 4px;
  margin-bottom: 20px;
  min-height: 540px;
}

.catalog-body.unfold {
  width: 296px;
  margin: 12px 4px 0 0;
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
  overflow: hidden;
  text-overflow: ellipsis;
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
.markdown-body {
  background-color: #f2f3f5 !important;
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
