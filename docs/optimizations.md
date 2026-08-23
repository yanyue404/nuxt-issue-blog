# 博客优化记录

记录 2026-08-20 针对「线上首页不是最新 GitHub Issues」的改造，以及尚未执行的优化项。

相关站点：

- 博客：[https://yanyue404.github.io/blog/](https://yanyue404.github.io/blog/)
- 内容源：[https://github.com/yanyue404/blog/issues](https://github.com/yanyue404/blog/issues)

---

## 问题回顾

部署后首次打开首页，看到的是旧文章（停在 `#307`），而 Issues 最新已是 `#309 Cloudflare D1`、`#308 威斯敏斯特大要理问答`。

根因叠加了三层：

1. `nuxt generate` 把文章列表打进静态 HTML / `__NUXT__` payload，GitHub Pages 没有服务器，之后访问一直是构建快照。
2. 首页 `beforeMount` 在 `serverLoaded === true` 时跳过 GitHub API，客户端不再拉最新。
3. `vuex-persistedstate` 把整份 store（含 `postList`）写入 `sessionStorage`，同标签刷新会用旧列表盖掉新 payload。

另外：构建仓库是 `nuxt-issue-blog`，内容仓库是 `yanyue404/blog`。新建 Issue **不会**自动触发本仓库的 generate；定时 cron 还可能因仓库 60 天无提交被 GitHub 停掉。

本地访问 `/blog/post/309` 曾出现 GitHub API **403 rate limit**：Token 从浏览器拿掉后，客户端直连 `api.github.com`，未认证额度仅 60 次/小时。Cloudflare 出口 IP 容易被打满。

---

## 已完成（P0 / P1）

### P0 新鲜度与正确性

| 项                          | 做法                                                                                      | 主要文件                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 首页每次打开拉最新          | 去掉 `serverLoaded` 短路，`beforeMount` 始终 `getIssueList`                               | `pages/index.vue`                                                 |
| 列表按创建时间倒序          | 无关键词走 `GET /repos/{owner}/{repo}/issues`；搜索补 `sort=created&order=desc`           | `store/blog.js`                                                   |
| 不再缓存文章列表            | 移除 `vuex-persistedstate`                                                                | `plugins/entry-plugin/main.js`                                    |
| Token 不进前端包            | `blog.config.js` 不再导出 `accessToken`；仅服务端读 `GITHUB_TOKEN` / `blog.config.cjs`    | `blog.config.js`、`plugins/http/http.js`、`nuxt.config.js`        |
| HTTP 错误不再被吞掉         | 拦截器 `Promise.reject`，请求失败打日志                                                   | `plugins/http/http.js`、`store/blog.js`、`store/label.js`         |
| 构建可手动 / 被内容仓库触发 | `workflow_dispatch` + `repository_dispatch: blog-content-updated`                         | `.github/workflows/pages-deploy.yml`                              |
| 线上不再直连 GitHub API     | 生产环境读 `dist/data/posts.json`；点文章整页打开静态 HTML，403 不再覆盖成 Post not found | `store/blog.js`、`pages/post/_id.vue`、`utils/posts-snapshot.cjs` |
| 禁用 Jekyll                 | `static/.nojekyll`，避免 GitHub Pages 处理静态文件时踩坑                                  | `static/.nojekyll`                                                |

本地开发时，Network 里应看到：

```
http://localhost:9527/repos/yanyue404/blog/issues/309
```

而不是 `https://api.github.com/...`。改代理后需重启 `yarn serve`。

### P1 SEO 与列表体验

| 项                   | 做法                                                                              | 主要文件                                  |
| -------------------- | --------------------------------------------------------------------------------- | ----------------------------------------- |
| 文章页可预渲染       | 路由改为 `/post/:id`，`asyncData` 拉正文；generate 预生成全部 open issues         | `pages/post/_id.vue`、`nuxt.config.js`    |
| 旧文章链接兼容       | `/post/?id=309` → `/post/309`                                                     | `pages/post/index.vue`                    |
| 标签页与首页分页一致 | 取消无限滚动；路由 `/label/:name`；旧 `/label/?name=` 重定向                      | `pages/label/_name.vue`、`store/label.js` |
| 搜索先本地后全库     | 输入即时过滤当前页，500ms 后再走 GitHub Search                                    | `pages/index.vue`                         |
| 未知新文章可打开     | `generate.fallback: '404.html'`，GitHub Pages 用 404 回退到 SPA，再客户端拉 Issue | `nuxt.config.js`                          |

### 路由对照

| 旧地址                       | 新地址                 |
| ---------------------------- | ---------------------- |
| `/blog/post/?id=309`         | `/blog/post/309`       |
| `/blog/label/?name=唯独基督` | `/blog/label/唯独基督` |

### 构建与部署注意

- generate 时用环境变量 `GITHUB_TOKEN`（CI 里来自 `secrets.ACCESS_TOKEN`），避免 287 篇文章预渲染撞未认证限额。
- CI `PATH_TYPE=production`，客户端走静态 `posts.json`，不要打 `api.github.com`。
- `generate.concurrency: 2`、`interval: 50`，降低预渲染打 GitHub 的并发。
- 内容仓库发 Issue 后要重建站点：把 `.github/workflows/trigger-blog-rebuild.yml` **放到 `yanyue404/blog`**（不要只放在本仓库）。该仓库需配置能对本仓库发 `repository_dispatch` 的 `ACCESS_TOKEN`。

### 线上 403 /「刷新带 hash 才正常」说明

这不是 hash 路由和文章路由不一致。

1. 列表点进 `/blog/post/294` 是 **Vue SPA 跳转**，页面还是首页那份 JS，会再请求 `api.github.com`。未认证限额 60 次/小时用尽就 **403**，`asyncData` 曾把 403 当成 404，于是出现 Post not found。静态文件其实一直在 [gh-pages/post/294](https://github.com/yanyue404/blog/tree/gh-pages/post/294)。
2. 地址栏刷新（你加了 `#main-heading-H2-0`）是 **整页加载** `post/294/index.html`，用的是 generate 好的正文，不再依赖 GitHub API，所以能打开。
3. `/?page=4` 以前同样在浏览器里请求 GitHub 第 4 页，403 后列表不会变。现在分页切 `posts.json` 本地切片。

---

## 未完成 / 后续待办

按优先级排列。P0 里还有一项运营配置未做完。

### P0 收尾（运营）

- [ ] 将 `trigger-blog-rebuild.yml` 安装到内容仓库 [yanyue404/blog](https://github.com/yanyue404/blog)，确认新建/编辑 Issue 能触发本仓库 Pages 部署。
- [x] 生产环境不再让浏览器直连 GitHub API（已改为 `posts.json` + 静态 HTML）。
- [x] 文章页评论：构建时预渲染已有 comments；新留言走页内 [Utterances](https://utteranc.es/)（按标题 Search API）。详见 [comments.md](./comments.md)。

### P2 工程健康度

- [x] CI 升级到 Node 16（原为 12 EOL）。
- [x] `blog.config.js` 改为 re-export `blog.config.cjs`，Token 仅留在 cjs / 环境变量。
- [x] `nuxt.config.js` 里 `build.analyze: true`，生产构建会出 webpack 分析页，拖慢 CI，建议默认关掉。
- [ ] HTTP 拦截器里仍用 `qs.parse(error)` 取 status，可读性差，可改为 `error.response`。

### P3 产品能力（已完成）

以下均在 2026-08-22 完成：

| 功能            | 说明                                           | 主要文件                                                 |
| --------------- | ---------------------------------------------- | -------------------------------------------------------- |
| Label 标签云    | 首页侧边栏显示所有标签+计数，点击过滤文章      | `components/LabelCloud.vue`、`pages/index.vue`           |
| 上一篇/下一篇   | 文章底部导航相邻文章                           | `components/PostNav.vue`                                 |
| 阅读进度条      | 页面顶部绿色进度条                             | `components/ReadingProgress.vue`                         |
| 阅读时间估算    | 文章 meta 显示预计阅读时间                     | `pages/post/_id.vue`                                     |
| 暗色模式重构    | 纯 CSS 变量 + localStorage，去除 darken 库依赖 | `components/darkMode.vue`、`layouts/default.vue`         |
| 代码块复制按钮  | 文章代码块右上角 Copy 按钮                     | `plugins/code-copy.client.js`                            |
| 文章页三栏布局  | 左侧浮动目录 + 中间正文 + 右侧推荐             | `pages/post/_id.vue`                                     |
| 相关推荐        | 右侧栏按标签推荐相似文章                       | `components/RelatedPosts.vue`                            |
| Command Palette | Ctrl+K 全局搜索弹窗，键盘导航                  | `components/CommandPalette.vue`、`components/Header.vue` |
| Hero 首屏       | 渐变背景 + 淡网格，明暗双主题（CSS 变量驱动） | `components/Hero.vue`、`layouts/default.vue`             |
| 图片懒加载      | IntersectionObserver 延迟加载文章图片          | `plugins/lazy-images.client.js`                          |
| 系统字体栈      | 去除未加载的 Montserrat，统一系统字体          | `styles/reset.css`、`layouts/default.vue`                |
| 全局 CSS 变量化 | 所有颜色使用变量，暗黑模式全面适配             | 多文件                                                   |

#### 2026-08-22 二次迭代（暗黑修复 + 交互增强）

| 功能                | 说明                                                                                              | 主要文件                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 暗黑模式白屏根因修复 | Hero 内 `position:absolute; inset:0` 装饰层在切换 dark class 重绘时合成泄漏，糊满整页；改用 `isolation:isolate` + `::before/::after` 伪元素装饰彻底隔离 | `components/Hero.vue`                                                 |
| markdown 样式变量化 | 弃用硬编码亮色 `github-markdown-light.css`，改为 `--md-*` 变量驱动的 `github-markdown-vars.scss`，明暗一套 | `styles/github-markdown-vars.scss`、`layouts/default.vue`、`nuxt.config.js` |
| 去毛玻璃改实色      | Header/侧栏/作者卡去掉 `backdrop-filter`，改 `--card-bg` 实色（避免磨砂合成 bug、清理未用 `--glass-*` 变量） | `components/Header.vue`、`components/Nav.vue`、`pages/index.vue`、`layouts/default.vue` |
| 骨架屏结构对齐      | 首页骨架按真实卡片结构还原（标题→日期+标签→两行摘要），消除加载→内容跳动                            | `components/BlogItem.vue`                                             |
| 搜索正文 + 高亮     | Command Palette 从仅搜标题扩展到标题+正文摘要，命中词 `<mark>` 高亮并展示正文片段，标题命中优先     | `components/CommandPalette.vue`                                       |
| 文章页 SEO meta     | 每篇文章 `<title>`/`description`/`og:title`/`og:description`/`og:type`/`twitter:*` 用文章标题与摘要 | `pages/post/_id.vue`                                                  |

#### 页内评论

| 功能 | 说明 | 主要文件 |
| ---- | ---- | -------- |
| 页内评论（Utterances） | 文章底部 iframe 留言，写入内容仓库对应 Issue；`issue-term` 用文章标题（Search API） | `components/Utterances.vue`、`components/comment.vue`、`pages/post/_id.vue` |

详见 [comments.md](./comments.md)。

### P3 产品能力（待做）

按优先级排列，以下是当前博客最必要的后续优化：

#### 高优先级（推荐尽快做）

- [x] **首页搜索联动优化**：Command Palette 已扩展为搜索标题 + 正文摘要，并高亮匹配词（见上方二次迭代表）
- [x] **文章页 SEO meta**：每篇文章的 `<title>`、`og:title`、`og:description` 已改为文章标题和摘要
- [x] **骨架屏优化**：骨架屏已与真实卡片结构对齐
- [ ] **移动端适配完善**：Hero/Header/三栏布局在小屏下的断点和交互体验（如 hamburger 菜单）

#### 中优先级

- [ ] **RSS 输出**：generate 时输出 `/feed.xml`，方便订阅
- [ ] **文章页锚点分享**：点击标题自动复制带锚点的链接
- [ ] **首页按年份归档**：侧边栏增加按年份分组的归档导航
- [x] **评论区预渲染 + 页内留言**：generate 时把已有 comments 写入 HTML；新评论用 Utterances（见 [comments.md](./comments.md)）
- [ ] **Lighthouse 性能审计**：CSS/JS 拆分、关键 CSS 内联、图片格式 WebP

#### 低优先级

- [ ] **PWA 离线支持**：Service Worker 缓存已访问文章
- [ ] **Nuxt 3 迁移**：长期路线，Vue 3 + Vite 性能和 DX 更优
- [ ] **深色模式跟随系统**：`prefers-color-scheme` 自动切换

### 已知限制（当前设计如此，不是漏做）

- 纯静态托管下，列表/分页/搜索来自上次 generate 写入的 `/blog/data/posts.json`，新鲜度和部署同步。
- 文章正文以预渲染 HTML 为准；从列表进入会整页打开静态文件，而不是 SPA 再打 GitHub。
- 线上文章页不请求 GitHub comments API（避免 403）；已有评论来自 generate 快照，新留言走 Utterances iframe。
- Utterances 必须安装在文章仓库；用文章标题匹配 Issue，标题改了可能对不上。

---

## 验证清单

1. 重启 `yarn serve` 后打开 http://localhost:9527/blog/post/309 ，文章正常，Network 走同源 `/repos/...`，无 403。
2. 首页第一条为 GitHub Issues 最新一篇（当前应为 `#309`）。
3. `/blog/post/?id=309` 跳转到 `/blog/post/309`。
4. 点标签进入 `/blog/label/...`，底部分页与首页一致。
5. Ctrl+K 打开搜索弹窗，输入正文关键词也能命中，命中词高亮并展示正文片段，ESC 关闭。
6. 暗黑模式：所有文字可见、卡片边框分明、Hero 深色渐变正确、无整页发白磨砂。
9. 首页刷新时骨架屏与真实卡片结构一致（标题/日期+标签/两行摘要），加载完成无跳动。
10. 文章页浏览器标签标题为「文章标题 | 站点名」，分享时 og/twitter 描述为文章摘要。
7. 重新 `generate` 并部署后：首页分页 `/?page=4` 有第 4 页数据；点进 `/blog/post/294` 直接出正文；Network 不应再出现 `api.github.com` 的 403。
8. 打开 `/blog/data/posts.json` 应能看到文章列表 JSON。
11. 线上文章页底部有 Utterances 留言框；GitHub 登录后可发评论，并出现在对应 Issue。
