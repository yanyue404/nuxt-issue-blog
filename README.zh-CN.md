<div align="center">
  <h1>Nuxt Issue Blog</h1>
  <p>🚀 基于 GitHub Issues 和 Nuxt.js 的静态博客生成器</p>
  
  [English](./README.md) | [简体中文](./README.zh-CN.md)
  
  <p align="center">
    <img src="./assets/light.jpg" width="49%" alt="浅色主题">
    <img src="./assets/dark.jpg" width="49%" alt="深色主题">
  </p>
</div>

## ✨ 特性

- 📦 使用 SSG 静态生成，部署快速，支持 SEO
- 🌙 支持浅色/深色主题切换
- 💬 使用 GitHub Issues 作为 CMS
- 🔄 GitHub Actions 自动部署
- 📱 移动端适配，响应式设计
- 🎨 简洁优雅的界面设计
- 🔍 支持全文搜索
- 📝 Markdown 支持代码高亮
- 🏷️ 基于 Label 的文章分类
- 📊 文章目录导航

## 🚀 快速开始

### 环境要求

```bash
- git: ^v2.0.0
- node: ^v12.18.3
- yarn: ^v1.12.0
```

### 配置 GitHub Token

1. 访问 [GitHub Token 设置页面](https://github.com/settings/tokens/new)
2. 选择以下权限：

```
read: user        读取用户信息
user: email       读取用户邮箱
```

3. 如果是组织项目，还需要：

```
read: org         读取组织信息
```

⚠️ 注意：为了账号安全，请勿选择其他权限。

### 配置项目

1. Fork 本仓库
2. 克隆到本地
3. 编辑 `blog.config.js`：

```js
module.exports = {
  baseUrl: '/blog/',
  userName: '你的用户名',
  userEmail: '你的邮箱',
  repository: 'blog',
  accessToken: '经过base64编码的token',
  blogName: '你的博客名称',
  seo: {
    title: '博客标题',
    description: '博客描述',
    keywords: '关键词'
  }
}
```

### 开发部署

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn serve

# 构建生产版本
yarn build

# 部署到 GitHub Pages
yarn deploy
```

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交改动 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 📝 开源协议

[MIT](./LICENSE)

## 🙏 致谢

- [Nuxt.js](https://nuxtjs.org/)
- [GitHub API](https://docs.github.com/en/rest)
- [Element UI](https://element.eleme.io/)
