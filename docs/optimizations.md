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

| 项 | 做法 | 主要文件 |
|----|------|----------|
| 首页每次打开拉最新 | 去掉 `serverLoaded` 短路，`beforeMount` 始终 `getIssueList` | `pages/index.vue` |
| 列表按创建时间倒序 | 无关键词走 `GET /repos/{owner}/{repo}/issues`；搜索补 `sort=created&order=desc` | `store/blog.js` |
| 不再缓存文章列表 | 移除 `vuex-persistedstate` | `plugins/entry-plugin/main.js` |
| Token 不进前端包 | `blog.config.js` 不再导出 `accessToken`；仅服务端读 `GITHUB_TOKEN` / `blog.config.cjs` | `blog.config.js`、`plugins/http/http.js`、`nuxt.config.js` |
| HTTP 错误不再被吞掉 | 拦截器 `Promise.reject`，请求失败打日志 | `plugins/http/http.js`、`store/blog.js`、`store/label.js` |
| 构建可手动 / 被内容仓库触发 | `workflow_dispatch` + `repository_dispatch: blog-content-updated` | `.github/workflows/pages-deploy.yml` |
| 本地开发避免 403 | 浏览器请求同源 `/repos`、`/search`、`/users`，Nuxt 代理带 Token 转发 GitHub | `plugins/http/http.js`、`nuxt.config.js` |

本地开发时，Network 里应看到：

```
http://localhost:9527/repos/yanyue404/blog/issues/309
```

而不是 `https://api.github.com/...`。改代理后需重启 `yarn serve`。

### P1 SEO 与列表体验

| 项 | 做法 | 主要文件 |
|----|------|----------|
| 文章页可预渲染 | 路由改为 `/post/:id`，`asyncData` 拉正文；generate 预生成全部 open issues | `pages/post/_id.vue`、`nuxt.config.js` |
| 旧文章链接兼容 | `/post/?id=309` → `/post/309` | `pages/post/index.vue` |
| 标签页与首页分页一致 | 取消无限滚动；路由 `/label/:name`；旧 `/label/?name=` 重定向 | `pages/label/_name.vue`、`store/label.js` |
| 搜索先本地后全库 | 输入即时过滤当前页，500ms 后再走 GitHub Search | `pages/index.vue` |
| 未知新文章可打开 | `generate.fallback: '404.html'`，GitHub Pages 用 404 回退到 SPA，再客户端拉 Issue | `nuxt.config.js` |

### 路由对照

| 旧地址 | 新地址 |
|--------|--------|
| `/blog/post/?id=309` | `/blog/post/309` |
| `/blog/label/?name=唯独基督` | `/blog/label/唯独基督` |

### 构建与部署注意

- generate 时用环境变量 `GITHUB_TOKEN`（CI 里来自 `secrets.ACCESS_TOKEN`），避免 287 篇文章预渲染撞未认证限额。
- `generate.concurrency: 2`、`interval: 50`，降低预渲染打 GitHub 的并发。
- 内容仓库发 Issue 后要重建站点：把 `.github/workflows/trigger-blog-rebuild.yml` **放到 `yanyue404/blog`**（不要只放在本仓库）。该仓库需配置能对本仓库发 `repository_dispatch` 的 `ACCESS_TOKEN`。

---

## 未完成 / 后续待办

按优先级排列。P0 里还有一项运营配置未做完。

### P0 收尾（运营）

- [ ] 将 `trigger-blog-rebuild.yml` 安装到内容仓库 [yanyue404/blog](https://github.com/yanyue404/blog)，确认新建/编辑 Issue 能触发本仓库 Pages 部署。
- [ ] 生产环境 GitHub Pages **没有 Node 代理**，浏览器仍可能直连 `api.github.com`（未认证 60 次/小时）。Cloudflare WARP / 共享出口 IP 会再次 403。可选方案：Cloudflare Worker / 其它同源反代带 Token，或接受「静态 HTML 兜底 + 客户端刷新失败时保留 generate 快照」。

### P2 工程健康度

- [ ] CI 仍使用 Node 12（已 EOL），`ubuntu-latest` 随时可能跑不起来，至少升到 16/18。
- [ ] `nuxt.config.js` 里 `build.analyze: true`，生产构建会出 webpack 分析页，拖慢 CI，建议默认关掉。
- [ ] `blog.config.js` 与 `blog.config.cjs` 两份配置，改漏风险仍在；Token 只应出现在 cjs / 环境变量。
- [ ] `Header` 回首页使用 `location.reload()`，可改为路由重置，避免整页刷新。
- [ ] HTTP 拦截器里仍用 `qs.parse(error)` 取 status，可读性差，可改为 `error.response`。

### P3 产品能力

- [ ] 首页没有按 Label 导航（目前约 287 篇，只能搜索/分页）。
- [ ] 没有 RSS、上一篇/下一篇、阅读进度。
- [ ] 暗色模式靠点击隐藏按钮，实现比较脆。
- [ ] 文章页目录、连载评论仍偏客户端，无 JS 时体验一般。
- [ ] Element UI + Nuxt 2 对博客偏重；升级 Nuxt 3 是大改，不急。

### 已知限制（当前设计如此，不是漏做）

- 纯静态托管下，**无 JS 用户**看到的是上次 generate 的快照；有 JS 时首页会再拉一遍最新列表。
- 搜索完整结果依赖 GitHub Search API，有索引延迟和频率限制；当前页过滤只覆盖已加载的那一页。
- List Issues API 会带上 Pull Request，代码里已过滤 `pull_request`；本仓库目前 PR 为 0。

---

## 验证清单

1. 重启 `yarn serve` 后打开 http://localhost:9527/blog/post/309 ，文章正常，Network 走同源 `/repos/...`，无 403。
2. 首页第一条为 GitHub Issues 最新一篇（当前应为 `#309`）。
3. `/blog/post/?id=309` 跳转到 `/blog/post/309`。
4. 点标签进入 `/blog/label/...`，底部分页与首页一致。
5. 搜索框输入后当前页立刻过滤，稍后出现全库搜索结果。
6. 重新 `generate` 并部署后，线上首页与 Issues 最新列表一致。
