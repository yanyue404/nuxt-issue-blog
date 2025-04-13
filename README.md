<div align="center">
  <h1>Nuxt Issue Blog</h1>
  <p>🚀 A static blog generator powered by GitHub Issues and Nuxt.js</p>
  
  [English](./README.md) | [简体中文](./README.zh-CN.md)
  
  <p align="center">
    <img src="./assets/light.jpg" width="49%" alt="Light Theme">
    <img src="./assets/dark.jpg" width="49%" alt="Dark Theme">
  </p>
</div>

## ✨ Features

- 📦 SSG for fast deployment and SEO
- 🌙 Light/Dark theme support
- 💬 GitHub Issues as CMS
- 🔄 Auto-deploy with GitHub Actions
- 📱 Mobile-friendly responsive design
- 🎨 Clean and minimal UI
- 🔍 Full-text search support
- 📝 Markdown with code highlighting
- 🏷️ Label-based categorization
- 📊 Table of contents navigation

## 🚀 Quick Start

### Prerequisites

```bash
- git: ^v2.0.0
- node: ^v12.18.3
- yarn: ^v1.12.0
```

### Setup GitHub Token

1. Go to [GitHub Token Settings](https://github.com/settings/tokens/new)
2. Select these permissions:

```
read: user        Read all user profile data
user: email       Access user email addresses (read-only)
```

3. For organization projects, also select:

```
read: org         Read org and team membership
```

⚠️ Warning: Don't select other permissions for security reasons.

### Configuration

1. Fork this repository
2. Clone to your local machine
3. Edit `blog.config.js`:

```js
module.exports = {
  baseUrl: '/blog/',
  userName: 'your-username',
  userEmail: 'your-email',
  repository: 'blog',
  accessToken: 'base64-encoded-token',
  blogName: 'Your Blog Name',
  seo: {
    title: 'Your Blog Title',
    description: 'Your Blog Description',
    keywords: 'your, keywords'
  }
}
```

### Development

```bash
# Install dependencies
yarn install

# Start development server
yarn serve

# Build for production
yarn build

# Deploy to GitHub Pages
yarn deploy
```

## 🤝 Contributing

1. Fork it
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a new Pull Request

## 📝 License

[MIT](./LICENSE)

## 🙏 Acknowledgments

- [Nuxt.js](https://nuxtjs.org/)
- [GitHub API](https://docs.github.com/en/rest)
- [Element UI](https://element.eleme.io/)
