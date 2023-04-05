<template>
  <div class="markdown-body">
    <header class="flex-sb-c" v-show="routeName === 'index'">
      <h1 class="blog-title">{{ blogName }}</h1>
      <el-switch class="dark-change" v-model="dark" active-color="#282c35">
      </el-switch>
    </header>

    <button v-show="false" id="darkmode-button">Toggle dark mode</button>
    <Nuxt />
  </div>
</template>

<script>
import darken from "darken";
import { mapState } from "vuex";
import { getUser } from "../plugins/http/api";
import { isServer } from "@/utils";

export default {
  data() {
    return {
      dark: !isServer()
        ? localStorage.getItem("darken-mode") === "dark"
        : false,
      user: {},
    };
  },
  computed: {
    routeName() {
      return this.$route.name;
    },
    ...mapState({
      blogName: (state) => state.blog.blogName,
    }),
  },
  watch: {
    dark: (newVal) => {
      document.querySelector("#darkmode-button").click();
    },
  },
  created() {
    this.getUserInfo();
  },
  mounted() {
    // https://github.com/ColinEspinas/darken
    const darkmode = new darken({
      class: "darkmode-active",
      variables: {
        "--markdown-body": ["#24292e", "#fff"],
        "--theme-color": ["rgb(9, 105, 218)", "#ffa7c4"],
        "--primary-color": ["#000000", "#fafafa"],
        "--background-color": ["#fff", "#0d1117"],
        "--textNormal": ["#353535", "hsla(0,0%,100%,0.88)"],
      },
      toggle: "#darkmode-button",
      stylesheets: {
        id: "darkmode-stylesheet",
        dark: "./css/github-markdown-dark.css",
        light: "./css/github-markdown-light.css",
      },
    });
  },
  methods: {
    getUserInfo() {
      getUser({ userName: `yanyue404` }).then((res) => {
        this.$set(this, "user", res.data);
      });
    },
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
.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
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
</style>
