// 仅服务端：generate 时从磁盘读 posts.json，避免每页再打 GitHub
// 文件名 .server.js，不会打进客户端包
export default ({ store }) => {
  if (store.state.blog.allPosts && store.state.blog.allPosts.length) return
  try {
    const { readPostsJsonFromDisk } = require('../utils/posts-snapshot.cjs')
    const posts = readPostsJsonFromDisk()
    if (posts.length) {
      store.commit('blog/setAllPosts', posts)
    }
  } catch (e) {
    // ignore
  }
}
