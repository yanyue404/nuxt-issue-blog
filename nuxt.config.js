import blogConfig from './blog.config'
const path = require('path')
const { mapIssue, writePostsJson } = require('./utils/posts-snapshot.cjs')
const {
  resolveGithubToken,
  githubAuthHeaders,
  tokenCandidates,
  isRetryableGithubError,
  githubErrorDetail
} = require('./utils/github-token.cjs')

if (!String(process.env.GITHUB_TOKEN || '').trim()) {
  const fromConfig = resolveGithubToken()
  if (fromConfig) {
    process.env.GITHUB_TOKEN = fromConfig
  } else {
    console.warn('[nuxt.config] GITHUB_TOKEN not set')
  }
}

// 资源路径前缀，生产环境使用cdn域名
const publicPath =
  process.env.PATH_TYPE !== 'production' ? '/_nuxt/' : '/_nuxt/'

export default {
  mode: 'universal', // 普遍的 —— 同构应用程序(服务端呈现 + 客户端路由导航)
  env: {
    PATH_TYPE: process.env.PATH_TYPE // 在项目代码中直接使用 process.env.PATH_TYPE 直接获取环境参数
  },
  vue: {
    config: {
      productionTip: false,
      devtools: process.env.PATH_TYPE !== 'production'
    }
  },
  router: {
    base: blogConfig.baseUrl, // 项目访问路径
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      } else {
        return { x: 0, y: 0 }
      }
    }
  },
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: blogConfig.seo.title,
    meta: [
      {
        name: 'description',
        content: blogConfig.seo.description
      },
      {
        name: 'keywords',
        content: blogConfig.seo.keywords
      }
    ]
  },
  loading: {
    color: 'rgb(0, 197, 142)',
    height: '3px'
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/styles/reset.css',
    '~/styles/global.scss',
    '~/styles/github-markdown-vars.scss'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    {
      src: '~/plugins/entry-plugin/main.js',
      ssr: true
    },
    {
      src: '~/plugins/i18n.js',
      ssr: true
    },
    {
      src: '~/plugins/posts-disk.server.js',
      ssr: true
    },
    {
      src: '~/plugins/code-copy.client.js',
      ssr: false
    },
    {
      src: '~/plugins/lazy-images.client.js',
      ssr: false
    }
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ['@nuxtjs/axios'],
  axios: {
    proxy: true, // 表示开启代理
    credentials: false
  },
  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    publicPath: publicPath,
    transpile: [/vant.*?less/],
    babel: {
      babelrc: false,
      plugins: [
        [
          'lodash',
          {
            libraryName: 'lodash', // 配置lodash按需加载
            libraryDirectory: '',
            camel2DashComponentName: false
          },
          'lodash'
        ]
      ]
    },
    /*
     ** You can extend webpack config here
     */
    // extend(config, ctx) {}
    extend(config, { isClient }) {
      // 为 客户端打包 进行扩展配置
      if (isClient) {
        config.externals = {}
        // 非开发环境移除runtime打包
        if (process.env.PATH_TYPE != 'development') {
          config.externals.vue = 'Vue'
          config.externals.vuex = 'Vuex'
          config.externals['vue-router'] = 'VueRouter'
        }

        // 非生产环境开启 source-map
        if (process.env.PATH_TYPE !== 'production') {
          config.devtool = 'eval-source-map'
          Object.assign(config.output, {
            devtoolModuleFilenameTemplate: 'yanyue404://[resource-path]'
          })
        }

        // 添加别名
        config.resolve.alias['@'] = path.resolve(__dirname)
      }
    },
    extractCSS: { allChunks: false },
    analyze: false,
    profile: false
  },
  render: {
    resourceHints: false,
    asyncScripts: true
  },
  proxy: (function githubProxy() {
    const token = resolveGithubToken()
    const headers = githubAuthHeaders(token)
    if (!token) {
      console.warn('[nuxt.config] github proxy has no token')
    }
    const makeProxy = () => ({
      target: 'https://api.github.com',
      changeOrigin: true,
      headers: Object.assign({}, headers)
    })
    return {
      '/repos': makeProxy(),
      '/search': makeProxy(),
      '/users': makeProxy()
    }
  })(),
  generate: {
    fallback: '404.html',
    failOnError: false,
    interval: 120,
    concurrency: 2,
    async routes() {
      const axios = require('axios')
      const { writeIssueCache } = require('./utils/posts-snapshot.cjs')
      const config = require('./blog.config.cjs')
      const tokens = tokenCandidates()
      console.log(
        '[generate] github token sources',
        tokens.map((t) => (t ? 'present' : 'anonymous'))
      )
      async function fetchPage(page, perPage) {
        let lastErr
        for (let t = 0; t < tokens.length; t++) {
          const headers = githubAuthHeaders(tokens[t])
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              return await axios.get(
                `https://api.github.com/repos/${config.userName}/${config.repository}/issues`,
                {
                  params: {
                    state: 'open',
                    sort: 'created',
                    direction: 'desc',
                    per_page: perPage,
                    page
                  },
                  headers,
                  timeout: 30000
                }
              )
            } catch (err) {
              lastErr = err
              const detail = githubErrorDetail(err)
              console.warn('[generate] list issues failed', {
                page,
                attempt,
                token: tokens[t] ? `candidate-${t + 1}` : 'anonymous',
                ...detail
              })
              if (!isRetryableGithubError(err)) break
              await new Promise((resolve) => setTimeout(resolve, 800 * attempt))
            }
          }
        }
        throw lastErr
      }
      const perPage = 100
      let page = 1
      const routes = []
      const labels = new Set()
      const posts = []
      const rawIssues = []
      while (page <= 20) {
        const res = await fetchPage(page, perPage)
        const issues = (res.data || []).filter((item) => !item.pull_request)
        if (!issues.length) break
        issues.forEach((issue) => {
          rawIssues.push(issue)
          posts.push(mapIssue(issue))
          routes.push({
            route: '/post/' + issue.number,
            payload: {
              id: issue.id,
              number: issue.number,
              title: issue.title,
              created_at: issue.created_at,
              updated_at: issue.updated_at,
              body_html: issue.body_html || issue.body || '',
              user: issue.user,
              labels: issue.labels || [],
              html_url: issue.html_url
            }
          })
          ;(issue.labels || []).forEach((label) => {
            if (label.name) labels.add(label.name)
          })
        })
        if (issues.length < perPage) break
        page += 1
      }
      labels.forEach((name) => {
        routes.push('/label/' + encodeURIComponent(name))
      })
      writeIssueCache(rawIssues)
      writePostsJson(posts)
      console.log('[generate] pre-render routes', routes.length, 'posts', posts.length)
      return routes
    }
  },
  server: {
    port: 9527,
    host: '127.0.0.1'
  }
}
