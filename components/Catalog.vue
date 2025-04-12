<template>
  <nav class="article-catalog catalog-block">
    <div class="catalog-title">
      <div>{{ title }}</div>
    </div>
    <div class="catalog-body unfold">
      <ul class="catalog-list" style="margin-top: 0px">
        <!-- 普通文章目录 -->
        <template v-for="(h2Item, index) in normalNavList">
          <!-- H2 标题 -->
          <li
            :key="`h2-${index}`"
            :class="['item', 'd2', { active: activeId === h2Item.id }]"
          >
            <div class="a-container">
              <a
                :href="`${basePath}#${h2Item.id}`"
                :title="h2Item.text"
                class="catalog-aTag d2-aTag-title"
                @click.prevent="handleClick(h2Item.id)"
              >
                {{ toText(h2Item.text) }}
              </a>
            </div>
            <!-- H3 子标题列表 -->
            <ul
              v-if="h2Item.children && h2Item.children.length"
              class="sub-list"
            >
              <li
                v-for="(h3Item, h3Index) in h2Item.children"
                :key="`h3-${h3Index}`"
                :class="['item', 'd3', { active: activeId === h3Item.id }]"
              >
                <div class="a-container">
                  <a
                    :href="`${basePath}#${h3Item.id}`"
                    :title="h3Item.text"
                    class="catalog-aTag d3-aTag-title"
                    @click.prevent="handleClick(h3Item.id)"
                  >
                    {{ toText(h3Item.text) }}
                  </a>
                </div>
              </li>
            </ul>
          </li>
        </template>

        <!-- 连载文章目录 -->
        <li v-if="seriesNavList && seriesNavList.length" class="item d2">
          <div class="a-container">
            <a class="catalog-aTag d2-aTag-title">连载文章</a>
          </div>
          <ul class="sub-list">
            <template v-for="(h2Item, index) in seriesNavList">
              <!-- H2 标题 -->
              <li
                :key="`series-h2-${index}`"
                :class="['item', 'd2', { active: activeId === h2Item.id }]"
              >
                <div class="a-container">
                  <a
                    :href="`${basePath}#${h2Item.id}`"
                    :title="h2Item.text"
                    class="catalog-aTag d2-aTag-title"
                    @click.prevent="handleClick(h2Item.id)"
                  >
                    {{ toText(h2Item.text) }}
                  </a>
                </div>
                <!-- H3 子标题列表 -->
                <ul
                  v-if="h2Item.children && h2Item.children.length"
                  class="sub-list"
                >
                  <li
                    v-for="(h3Item, h3Index) in h2Item.children"
                    :key="`series-h3-${h3Index}`"
                    :class="['item', 'd3', { active: activeId === h3Item.id }]"
                  >
                    <div class="a-container">
                      <a
                        :href="`${basePath}#${h3Item.id}`"
                        :title="h3Item.text"
                        class="catalog-aTag d3-aTag-title"
                        @click.prevent="handleClick(h3Item.id)"
                      >
                        {{ toText(h3Item.text) }}
                      </a>
                    </div>
                  </li>
                </ul>
              </li>
            </template>
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
  border-radius: 8px;
  margin-bottom: 20px;
  min-height: 540px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
}

.catalog-title {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  color: var(--textTitle);
}

.catalog-body.unfold {
  width: 296px;
  margin: 8px 4px;
  max-height: 70vh;
  overflow-y: auto;
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
  line-height: 1.6;

  &.d2 {
    margin-top: 8px;

    &:first-child {
      margin-top: 0;
    }
  }
}

.a-container {
  position: relative;
  display: flex;
  align-items: center;
  padding: 6px 16px;
  color: var(--textNormal);
  transition: all 0.2s ease;
  border-radius: 4px;
  margin: 0 8px;

  &:hover {
    background: var(--hover-bg);
  }
}

.catalog-aTag {
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;

  &:hover {
    color: var(--theme-color);
  }
}

.d2-aTag-title {
  font-size: 14px;
  font-weight: 500;
}

.d3-aTag-title {
  font-size: 13px;
  color: var(--textSecondary);
}

.item.d2 .a-container {
  padding-left: 16px;
}

.item.d3 .a-container {
  padding-left: 32px;

  &::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 50%;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--textSecondary);
    opacity: 0.6;
    transform: translateY(-50%);
  }
}

.active {
  > .a-container {
    background: var(--hover-bg);

    > .catalog-aTag {
      color: var(--theme-color);
      font-weight: 500;
    }

    &::before {
      background: var(--theme-color);
      opacity: 1;
    }
  }
}

// 连载文章目录样式
.sub-list {
  list-style: none;
  padding: 0;
  margin: 4px 0;

  .item.d2 {
    margin-top: 4px;

    .a-container {
      padding-left: 32px;
    }
  }

  .item.d3 {
    .a-container {
      padding-left: 48px;

      &::before {
        left: 36px;
      }
    }
  }
}

// 滚动条样式
.catalog-body {
  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--scrollbar-thumb-hover);
  }
}
</style>
