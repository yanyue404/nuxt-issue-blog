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

- 📦 SSG for fast GitHub Pages deployment; production reads `posts.json` instead of calling GitHub from the browser
- 🌙 Light/Dark theme via CSS variables (`localStorage` persistence); markdown colors share the same `--md-*` tokens
- 💬 GitHub Issues as CMS
- 🔄 Auto-deploy with GitHub Actions (manual dispatch + content-repo trigger)
- 🌐 i18n: Chinese / English
- 📱 Mobile-friendly responsive design
- 🎨 Gradient hero with a fading grid, separate palettes for light and dark
- 🔍 Command Palette (`Ctrl/⌘ + K`) searches titles & excerpts, highlights matches, ESC to close
- 📝 Markdown with syntax highlighting and one-click code copy
- 🏷️ Label cloud: filter the homepage by tag
- 📊 Three-column article page: sticky TOC + content + related posts
- ⏱️ Reading progress bar, reading-time estimate, prev/next navigation
- 🖼️ Image lazy loading and skeleton screens that match the real list layout
- 🔎 Per-article SEO: `<title>`, `description`, Open Graph & Twitter cards from the post title and excerpt

More implementation notes: [docs/optimizations.md](./docs/optimizations.md)

## 🚀 Quick Start

### Prerequisites

```bash
- git: ^v2.0.0
- node: >=16
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
3. Edit `blog.config.cjs` (the single source of truth; `blog.config.js` re-exports it without the token):

```js
module.exports = {
  baseUrl: '/blog/',
  userName: 'your-username',
  userEmail: 'your-email',
  repository: 'blog',
  // Build-time only (nuxt.config.js / CI). Never bundled into the client.
  accessToken: 'base64-encoded-token',
  blogName: 'Your Blog Name',
  heroTitle: 'Welcome to my blog',
  heroSubtitle: 'A short tagline for the hero section',
  seo: {
    title: 'Your Blog Title',
    description: 'Your Blog Description',
    keywords: 'your, keywords'
  }
}
```

> The token is only read on the server/build side (via `GITHUB_TOKEN` or `blog.config.cjs`) and is stripped from the public config, so it never ships in the client bundle.

### Development

```bash
# Install dependencies
yarn install

# Start development server (default: http://localhost:9527/blog/)
yarn serve

# Build for production
yarn build

# Deploy to GitHub Pages
yarn deploy
```

### Production notes

- CI should set `GITHUB_TOKEN` (from `secrets.ACCESS_TOKEN`) so `nuxt generate` can pre-render all open issues.
- The generated site writes `/blog/data/posts.json` for list, search, labels, and pagination.
- Article pages are static HTML. Comments are not fetched on the live site (to avoid GitHub rate limits); readers leave comments on the Issue.

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
