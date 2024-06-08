<template>
  <div class="markdown-body">
    <header class="flex-sb-c" v-show="routeName === 'index'">
      <h1 class="blog-title">{{ blogName }}</h1>
      <DarkMode v-model="dark"></DarkMode>
    </header>
    <button v-show="false" id="darkmode-button">Toggle dark mode</button>
    <aside class="flex-sb-c" v-show="routeName === 'index'">
      <div style="display: flex; margin-bottom: 1.5rem">
        <img
          class="avatar"
          :src="user.avatar_url"
          :alt="user.name"
          style=""
          title=""
        />
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
      <!-- <el-input
        v-model="keyWorldVal"
        placeholder="搜索博客文章"
        :clearable="true"
      ></el-input> -->
    </aside>
    <Nuxt />
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { isServer } from "@/utils";
import DarkMode from "@/components/darkMode.vue";

export default {
  components: {
    DarkMode,
  },
  data() {
    return {
      dark: !isServer()
        ? localStorage.getItem("darken-mode") === "dark"
        : false,
    };
  },
  computed: {
    routeName() {
      return this.$route.name;
    },
    ...mapState({
      blogName: (state) => state.blog.blogName,
      userName: (state) => state.blog.userName,
      keyWorld: (state) => state.blog.keyWorld,
      user: (state) => state.user,
    }),
    keyWorldVal: {
      get() {
        return this.keyWorld || "";
      },
      set(val) {
        this.updateKeyWorld(val);
      },
    },
  },
  watch: {
    dark: (newVal) => {
      document.querySelector("#darkmode-button").click();
    },
  },
  methods: {
    ...mapMutations({
      updateKeyWorld: "blog/updateKeyWorld",
    }),
  },
};
</script>
<style lang="scss">
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}
body {
  background-color: #f2f3f5;
}
.blog-wrap {
  h2 {
    font-weight: 600;
    padding-bottom: .3em;
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
  img {
    box-sizing: border-box !important;
    border: 0.3em solid #e0dfcc !important;
    border-radius: 1em;
    &[width="40%"] {
      width: 40%;
    }
    &[width="50%"] {
      width: 50%;
    }
    &[width="60%"] {
      width: 60%;
    }
    &[width="70%"] {
      width: 70%;
    }
    &[width="80%"] {
      width: 80%;
    }
    &[width="90%"] {
      width: 90%;
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
@media (max-width: 767px) {
}
aside {
  .avatar {
    margin-right: 0.875rem;
    margin-bottom: 0px;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    border: none !important;
  }
  p {
    margin-bottom: 0 !important;
  }
}
</style>
