<template>
  <div class="article-block">
    <!-- 加载中，文章骨架屏 -->
    <div class="main-area article-area" v-show="!post.id">
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
    <div class="main-area article-area" v-show="post.id" padding>
      <div class="article-header">
        <h1 class="rainbow">{{ post.title }}</h1>
        <code class="text-italic"
          >Updated by {{ userName }} {{ post.updated_at | timeAgo }}</code
        >
      </div>
      <div v-html="post.body_html" class="q-mt-lg" />
      <el-backtop />
      <Comment></Comment>
    </div>
    <div class="article-gap"></div>
    <!-- 目录的骨架屏 -->
    <div class="article-sideBar" v-show="!post.id">
      <nav class="article-catalog catalog-block">
        <el-skeleton style="width: 100%" animated>
          <template slot="template">
            <div v-for="item in [1]" :key="item">
              <el-skeleton-item variant="h2" style="width: 40%; margin-left: 18px;" />
              <div style="padding: 14px">
                <el-skeleton  :rows="7" style="margin-left: 5px;" animated />
              </div>
            </div>
          </template>
        </el-skeleton>
      </nav>
    </div>
    <!-- 侧边栏 -->
    <div class="article-sideBar" v-show="post.id">
      <!-- 导航目录 -->
      <nav class="article-catalog catalog-block">
        <div class="catalog-title">
          <div>目录</div>
        </div>
        <div class="catalog-body unfold">
          <ul class="catalog-list" style="margin-top: 0px">
            <!-- active 给 li 是选中 -->
            <li
              class="item d1"
              v-for="(item, index) in navList"
              :key="`${item.type}-${index}`"
            >
              <div class="a-container">
                <a
                  :href="`#${item.id}`"
                  :title="item.text"
                  @click.stop.self="toH1"
                  class="catalog-aTag d1-aTag-title"
                >
                  {{ item.text }}
                </a>
              </div>
              <ul v-show="item.children.length > 0" class="sub-list">
                <li
                  class="item d3"
                  v-for="(o, oIndex) in item.children"
                  :key="`${o.type}-${oIndex}`"
                >
                  <div class="a-container">
                    <a
                      :href="`#${o.id}`"
                      :title="o.text"
                      @click.stop.self="toH1"
                      class="catalog-aTag d1-aTag-title"
                    >
                      {{ o.text }}
                    </a>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </div>
</template>

<script>
import http from "../../plugins/http/http";
import { mapState, mapGetters } from "vuex";
import Comment from "../../components/comment";
import { formatPassTime } from "@/utils/date";

export default {
  name: "Post",
  components: {
    Comment,
  },
  data() {
    return {
      post: {},
      navList: [],
    };
  },
  filters: {
    timeAgo(d) {
      return d && formatPassTime(new Date(d));
    },
  },
  computed: {
    ...mapState({
      userName: (state) => state.blog.userName,
    }),
  },
  watch: {
    $route() {
      // 标签分类
      if (this.$route.query.label) {
        this.getIssueList(1, 50);
      } else {
        // 普通分页
        this.getIssueList(this.page, this.number);
      }
    },
    searchKeyWords(val) {
      this.getIssueList(1, 50, false, val);
    },
  },
  methods: {
    getIssue() {
      http
        .get(
          `/repos/${this.$store.getters["blog/repository"]}/issues/${this.$route.query.id}`
        )
        .then((res) => {
          this.post = res.data;
          let i = -1;
          let h2Index = -1;

          this.post.body_html = res.data.body_html.replace(
            /<h([2-3]) (.*?)>(.*?)<\/h[2-3]>/g,
            (_, hType, style, text) => {
              i++;
              let id = `heading-H${hType}-${i}`;

              if (hType === "2") {
                h2Index++;
                this.navList.push({
                  type: "H" + hType,
                  text: text,
                  id,
                  children: [],
                });
              } else {
                this.navList[h2Index].children.push({
                  type: "H" + hType,
                  text: text,
                  id,
                });
              }
              return `<h${hType} id=${id}>${text}</h${hType}>`;
            }
          );
          // this.$q.loading.hide();
        })
        .catch((err) => {
          if (err.response.status === 404) {
            this.$router.push("/404");
          }
        });
    },
    chipClickHandler(labelName) {
      this.$router.push(`/labels/?label=${labelName}`);
    },
    toH1(e) {
      e.preventDefault();
      let toElement = document.querySelector(e.target.hash);
      toElement && toElement.scrollIntoView(true);
    },
  },
  created() {
    // this.$q.loading.show({ delay: 250 });
    this.getIssue();
  },
  mounted() {
    console.log("nav", this.navList);
  },
};
</script>

<style lang="scss" scoped>
.article-block {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.article-header {
  margin-bottom: 10px;
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
  top: 0px;
  width: 300px;
  margin-right: -15px;
  background-color: #fff;
  border-radius: 6px;
  padding: 0;
  display: flex;
  flex-direction: column;
  .catalog-title {
    font-weight: 500;
    margin: 0 1.667rem;
    font-size: 16px;
    line-height: 2rem;
    color: #252933;
    border-bottom: 1px solid #e4e6eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 56px;
    .direction {
      color: #8a919f;
      display: flex;
      font-size: 13px;
      font-weight: 400;
      align-items: center;
      cursor: pointer;
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
  content: "";
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
</style>
