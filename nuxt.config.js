const path = require("path");
import prdConfig from "./prd-config";

//资源路径前缀，生产环境使用cdn域名
let publicPath = process.env.PATH_TYPE !== "production" ? "/_nuxt/" : "/_nuxt/";

export default {
  mode: "universal", // 普遍的 —— 同构应用程序(服务端呈现 + 客户端路由导航)
  env: {
    PATH_TYPE: process.env.PATH_TYPE, // 在项目代码中直接使用 process.env.PATH_TYPE 直接获取环境参数
  },
  vue: {
    config: {
      productionTip: false,
      devtools: process.env.PATH_TYPE !== "production" ? true : false,
    },
  },
  router: {
    base: prdConfig.baseUrl, //项目访问路径
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      } else {
        return { x: 0, y: 0 };
      }
    },
  },
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: prdConfig.title,
    meta: [
      {
        name: "description",
        content: prdConfig.description,
      },
      {
        name: "keywords",
        content: prdConfig.keywords,
      },
    ],
  },
  loading: {
    color: "rgb(0, 197, 142)",
    height: "3px",
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ["~/styles/reset.css", "~/styles/global.scss"],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    {
      src: "~/plugins/entry-plugin/main.js",
      ssr: true,
    },
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ["@nuxtjs/axios"],
  axios: {
    proxy: true, // 表示开启代理
    // prefix: '/api/chanel', // 表示给请求url加个前缀 /api
    credentials: true, // 表示跨域请求时是否需要使用凭证
  },
  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    babel: {
      babelrc: false,
      plugins: [
        [
          "lodash",
          {
            libraryName: "lodash", // 配置lodash按需加载
            libraryDirectory: "",
            camel2DashComponentName: false,
          },
          "lodash",
        ],
        [
          "component",
          {
            libraryName: "element-ui",
            styleLibraryName: "theme-chalk",
          },
        ],
      ],
    },
    /*
     ** You can extend webpack config here
     */
    // extend(config, ctx) {}
    extend(config, { isClient }) {
      // 为 客户端打包 进行扩展配置
      if (isClient) {
        config.externals = {};
        // 非开发环境移除runtime打包
        if (process.env.PATH_TYPE != "development") {
          config.externals["vue"] = "Vue";
          config.externals["vuex"] = "Vuex";
          config.externals["vue-router"] = "VueRouter";
        }

        // 非生产环境开启 source-map
        if (process.env.PATH_TYPE !== "production") {
          config.devtool = "eval-source-map";
          Object.assign(config.output, {
            devtoolModuleFilenameTemplate: "yanyue404://[resource-path]",
          });
        }

        // 添加别名
        config.resolve.alias["@"] = path.resolve(__dirname);
      }
    },
    publicPath: publicPath,
    transpile: [/vant.*?less/],
    babel: {
      plugins: [
        [
          "lodash",
          {
            libraryName: "lodash", //配置lodash按需加载
            libraryDirectory: "",
            camel2DashComponentName: false,
          },
          "lodash",
        ],
      ],
    },
    extractCSS: { allChunks: false },
    analyze: true,
    profile: false,
  },
  render: {
    resourceHints: false,
    asyncScripts: true,
  },
  proxy: ["https://api.github.com/search", "https://api.github.com/repos"],
  server: {
    port: 7711,
    host: "127.0.0.1",
  },
};
