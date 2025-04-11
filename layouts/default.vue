<template>
  <div class="markdown-body">
    <!-- 头部 header -->
    <header class="flex-sb-c" v-show="routeName === 'index'">
      <h1 class="blog-title">{{ blogName }}</h1>
      <DarkMode v-model="dark"></DarkMode>
    </header>
    <button v-show="false" id="darkmode-button">Toggle dark mode</button>
    <!-- 导航栏 -->
    <nav class="flex-sb-c" v-show="routeName === 'index'">
      <div style="display: flex; margin-bottom: 1.5rem">
        <img class="avatar" :src="user.avatar_url" :alt="user.name" />
        <div class="columnBetweenStart" style="max-width: 310px">
          <p>
            Personal blog by
            <a :href="user.html_url">{{ user.name }}</a>
          </p>
          <p>{{ user.bio }}</p>
        </div>
      </div>
      <div style="margin-bottom: 1.5rem; flex: 0.9">
        <el-input
          v-model="keyWorldVal"
          placeholder="搜索文章标题/关键字"
          :clearable="true"
        ></el-input>
      </div>
    </nav>
    <Nuxt />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { isServer } from '@/utils'
import DarkMode from '@/components/darkMode.vue'

export default {
  components: {
    DarkMode
  },
  data() {
    return {
      dark: !isServer() ? localStorage.getItem('darken-mode') === 'dark' : false
    }
  },
  computed: {
    routeName() {
      return this.$route.name
    },
    ...mapState({
      blogName: (state) => state.blog.blogName,
      userName: (state) => state.blog.userName,
      keyWorld: (state) => state.blog.keyWorld,
      user: (state) => state.user
    }),
    keyWorldVal: {
      get() {
        return this.keyWorld || ''
      },
      set(val) {
        this.updateKeyWorld(val)
      }
    }
  },
  watch: {
    dark: (newVal) => {
      document.querySelector('#darkmode-button').click()
    }
  },
  methods: {
    ...mapMutations({
      updateKeyWorld: 'blog/updateKeyWorld'
    })
  }
}
</script>
<style lang="scss">
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}
:root {
  --theme-color: #3eaf7c;
  --theme-color-rgb: 62, 175, 124;
  --border-color: rgba(0, 0, 0, 0.1);
  --card-bg: rgba(255, 255, 255, 0.8);
}
body {
  background-color: #f2f3f5;
}
.blog-wrap {
  h2 {
    font-weight: 600;
    padding-bottom: 0.3em;
    font-size: 1.5em;
  }
}
.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 1146px;
  margin: 0 auto;
  padding: 0 15px;
  // padding: 45px;
  // color: var(--markdown-body);
  background: var(--background-color);
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: var(--theme-color);
  }
  h1 {
    font-family: 'Montserrat', sans-serif;
  }
  img {
    box-sizing: border-box !important;
    border: 0.3em solid #e0dfcc !important;
    border-radius: 1em;
    &[width='40%'] {
      width: 40%;
    }
    &[width='50%'] {
      width: 50%;
    }
    &[width='60%'] {
      width: 60%;
    }
    &[width='70%'] {
      width: 70%;
    }
    &[width='80%'] {
      width: 80%;
    }
    &[width='90%'] {
      width: 90%;
    }
  }
}
// 优化头部样式
header.flex-sb-c {
  padding: 1rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));

  .blog-title {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(45deg, var(--theme-color), #666);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      background: linear-gradient(45deg, #666, var(--theme-color));
      -webkit-background-clip: text;
    }
  }
}
.blog-title {
  font-size: 1.98818rem;
  line-height: 2.625rem;
  margin-bottom: 0px !important;
  margin-top: 0px !important;
  padding-top: 1.8rem;
  padding-bottom: 1.8rem !important;
  border-bottom: none !important;
  font-family: Montserrat, sans-serif;
}

nav {
  .avatar {
    margin-right: 0.875rem;
    margin-bottom: 0px;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    border: none !important;
    transition: transform 0.6s ease;

    &:hover {
      transform: rotate(360deg);
    }
  }
  p {
    margin-bottom: 0 !important;
  }
}

// 优化导航栏样式
nav.flex-sb-c {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 1rem 0;
  margin-bottom: 2rem;

  // 个人信息区域
  > div:first-child {
    flex: 1;
    min-width: 300px;
    padding: 1rem;
    background: var(--card-bg, rgba(255, 255, 255, 0.8));
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    }

    .columnBetweenStart {
      p {
        line-height: 1.6;

        a {
          color: var(--theme-color);
          text-decoration: none;
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }

  // 搜索框区域
  > div:last-child {
    flex: 1;
    min-width: 300px;

    .el-input {
      .el-input__inner {
        border-radius: 8px;
        border: 2px solid var(--border-color, rgba(0, 0, 0, 0.1));
        padding: 0.8rem 1rem;
        font-size: 1rem;
        transition: all 0.3s ease;

        &:focus {
          border-color: var(--theme-color);
          box-shadow: 0 0 0 3px rgba(var(--theme-color-rgb), 0.1);
        }
      }
    }
  }
}

// 添加响应式设计
@media (max-width: 768px) {
  .markdown-body {
    nav.flex-sb-c {
      gap: 1rem;

      > div:first-child,
      > div:last-child {
        flex: 1 1 100%;
      }
    }
  }
}
</style>
