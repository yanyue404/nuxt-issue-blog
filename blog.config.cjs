// 唯一配置源 —— blog.config.js 会 re-export 此文件（剥离 accessToken）
module.exports = {
  baseUrl: '/blog/',
  userName: 'yanyue404',
  userEmail: '1656800216@qq.com',
  repository: 'blog',
  // Token 仅用于构建阶段（nuxt.config.js / CI），不会进入前端包
  accessToken: 'MWM2YmE5NmMwODJhODgyYzBiZmM2ZWExNGVhNzFhYjFkZTM4MzcwYw==',
  blogName: 'Just blog and unjust blog',
  heroTitle: '欢迎来到我的博客',
  heroSubtitle: '记录技术与信仰的思考，分享前端开发实践',
  seo: {
    title: '闫越的网络日志',
    description: 'Just blog and unjust blog',
    keywords: '基督徒 | F2E'
  }
}
