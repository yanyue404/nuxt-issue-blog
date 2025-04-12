<template>
  <nav class="article-catalog catalog-block">
    <div class="catalog-title">
      <div>{{ title }}</div>
    </div>
    <div class="catalog-body unfold">
      <ul class="catalog-list" style="margin-top: 0px">
        <!-- 普通文章目录 -->
        <template v-for="(item, index) in normalNavList">
          <li
            :key="`${item.type}-${index}`"
            :class="[
              'item',
              item.type === 'H2' ? 'd2' : 'd3',
              { active: activeId === item.id }
            ]"
          >
            <div class="a-container">
              <a
                :href="`${basePath}#${item.id}`"
                :title="item.text"
                class="catalog-aTag"
                :class="item.type === 'H2' ? 'd2-aTag-title' : 'd3-aTag-title'"
                @click.prevent="handleClick(item.id)"
              >
                {{ toText(item.text) }}
              </a>
            </div>
          </li>
        </template>

        <!-- 连载文章目录 -->
        <li v-if="seriesNavList && seriesNavList.length" class="item d2">
          <div class="a-container">
            <a class="catalog-aTag d2-aTag-title">连载文章</a>
          </div>
          <ul class="sub-list">
            <li
              v-for="(item, index) in seriesNavList"
              :key="`series-${index}`"
              class="item d3"
            >
              <div class="a-container">
                <a
                  :href="`${basePath}#${item.id}`"
                  :title="item.text"
                  class="catalog-aTag d3-aTag-title"
                  @click.prevent="handleClick(item.id)"
                >
                  {{ toText(item.text) }}
                </a>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Catalog',
  props: {
    title: {
      type: String,
      default: '目录'
    },
    navList: {
      type: Array,
      required: true
    },
    activeId: {
      type: String,
      default: ''
    },
    basePath: {
      type: String,
      required: true
    }
  },
  computed: {
    // 分离普通目录和连载文章目录
    normalNavList() {
      return this.navList.filter((item) => item.text !== '连载文章')
    },
    seriesNavList() {
      const seriesItem = this.navList.find((item) => item.text === '连载文章')
      return seriesItem ? seriesItem.children : []
    }
  },
  methods: {
    handleClick(id) {
      // 触发点击事件
      this.$emit('catalog-click', id)

      // 滚动到目标元素
      this.$nextTick(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    },
    toText(text) {
      return (text || '')
        .replace(/<[^>]+>/g, '')
        .replace(/&[^;]+;/g, '')
        .trim()
    }
  }
}
</script>

<style scoped lang="scss">
.catalog-block {
  border-radius: 4px;
  margin-bottom: 20px;
  min-height: 540px;
}

.catalog-title {
  font-size: 16px;
  font-weight: 500;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-color);
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
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  position: relative;
  margin: 0;
  padding: 0;
  font-size: 14px;
  line-height: 1.8;
}

.a-container {
  position: relative;
  display: flex;
  align-items: center;
  padding: 4px 16px;
  color: var(--juejin-font-2);
  transition: all 0.15s;
  cursor: pointer;
}

.catalog-aTag {
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
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

.item.d2 .a-container {
  padding-left: 26px;

  &:before {
    left: 24px;
  }
}

.item.d3 .a-container {
  padding-left: 41px;

  &:before {
    left: 39px;
  }
}

.active {
  > .a-container > .catalog-aTag {
    color: var(--theme-color);
  }

  > .a-container:before {
    content: '';
    position: absolute;
    top: 2px;
    left: 0;
    width: 3px;
    height: 14px;
    background: var(--theme-color);
    border-radius: 2px;
  }
}
</style>
