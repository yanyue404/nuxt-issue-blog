# 评论功能（Utterances）

文章页底部支持页内留言。访客用 GitHub 登录后即可评论，内容写入对应文章的 GitHub Issue。

相关组件：`components/Utterances.vue`、`components/comment.vue`、`pages/post/_id.vue`。

## 页面上怎么展示

1. **作者连载**：Issue 里作者自己的评论，当作文章续写，单独成区。
2. **历史留言**：构建时从 GitHub API 拉下来的访客评论，打进静态 HTML。
3. **页内留言框**：[Utterances](https://utteranc.es/) iframe。访客 Sign in with GitHub 后直接发评论，落到当前文章对应的 Issue。

## 一次性安装

Utterances 必须装在 **文章仓库**（`blog.config.cjs` 里的 `userName/repository`），不是本模板仓库 `nuxt-issue-blog`。

1. 打开 [Utterances GitHub App](https://github.com/apps/utterances)，Install。
2. 选择文章仓库（例如 `yanyue404/blog`），授予 Issues 读写权限。
3. 无需改配置文件。组件会用 store 里的 `userName/repository`，并用**文章标题**作为 `issue-term`。

配置页默认的 `issue-term="pathname"` **不要用**：本博客路径形如 `/blog/post/309/`，对不上 Issue 标题，会另开一条 Issue。也不要用 `issue-number`：会打 GitHub core API，匿名访客只有 60 次/小时，超限 iframe 空白。

## 访客怎么留言

1. 打开文章页，滚到评论区。
2. 在 Utterances 里 **Sign in with GitHub**。
3. 直接在输入框发评论，会出现在当前 Issue 的评论列表里。

请保证 Issue 标题唯一，发布后不要随意改标题，否则可能匹配不到原 Issue。
