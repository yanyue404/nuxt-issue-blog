import blogConfig from '../blog.config'
import http from '../plugins/http/http'
import { isServer } from '@/utils'
import {
  ISSUE_PAGE_SIZE,
  isPullRequest,
  isStaticClient,
  mapIssueToPost
} from '@/utils/github'

const publicBlogConfig = Object.assign({}, blogConfig)
delete publicBlogConfig.accessToken

export const state = () => ({
  ...publicBlogConfig,
  serverLoaded: false,
  postList: [],
  allPosts: [],
  page: 0,
  total_count: 0,
  pending: false,
  keyWorld: ''
})

export const getters = {
  repository(s) {
    return `${s.userName}/${s.repository}`
  },
  authorName: (state) => state.userName
}

export const mutations = {
  updatePostList(state, data) {
    if (isServer()) {
      state.serverLoaded = true
    }
    state.page = data.page
    state.pending = false

    state.postList = [...data.posts]
    state.total_count = data.total_count
  },
  setAllPosts(state, posts) {
    state.allPosts = posts || []
  },
  setPending(state, val) {
    state.pending = val
  },
  updatePage(state, val) {
    state.page = val
  },
  updateKeyWorld(state, val) {
    state.keyWorld = val
  }
}

function paginate(posts, page, number) {
  const start = (page - 1) * number
  return posts.slice(start, start + number)
}

function filterByKey(posts, key) {
  const q = (key || '').trim().toLowerCase()
  if (!q) return posts
  return posts.filter((post) => {
    const title = (post.title || '').toLowerCase()
    const body = (post.body_html || '').toLowerCase()
    return title.includes(q) || body.includes(q)
  })
}

export const actions = {
  async ensureStaticPosts({ state, commit, getters }) {
    if (state.allPosts && state.allPosts.length) {
      return state.allPosts
    }
    // 优先尝试加载 posts.json（静态/生产环境）
    try {
      const url = `${state.baseUrl || '/blog/'}data/posts.json`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        const posts = data.posts || []
        if (posts.length) {
          commit('setAllPosts', posts)
          return posts
        }
      }
    } catch (e) {
      // posts.json 不存在，走 API fallback
    }
    // 开发模式 fallback：从 GitHub API 分页拉取全部文章
    try {
      const allPosts = []
      let page = 1
      const perPage = 100
      while (page <= 20) {
        const res = await http.get(
          `/repos/${getters.repository}/issues?state=open&sort=created&direction=desc&page=${page}&per_page=${perPage}`
        )
        const posts = (res.data || [])
          .filter((item) => !isPullRequest(item))
          .map(mapIssueToPost)
        allPosts.push(...posts)
        if (posts.length < perPage) break
        page++
      }
      commit('setAllPosts', allPosts)
      return allPosts
    } catch (e) {
      return []
    }
  },

  async getIssueList(
    { commit, dispatch, state, getters },
    { page = 1, number = ISSUE_PAGE_SIZE, keyWorld = '' } = {}
  ) {
    const key = keyWorld || state.keyWorld
    commit('setPending', true)

    try {
      if (isStaticClient()) {
        const all = await dispatch('ensureStaticPosts')
        const filtered = filterByKey(all, key)
        commit('updatePostList', {
          page,
          posts: paginate(filtered, page, number),
          total_count: filtered.length
        })
        return
      }

      if (key) {
        const q = `${key} repo:${getters.repository} is:issue state:open`
        const url = `/search/issues?q=${encodeURIComponent(
          q
        )}&sort=created&order=desc&page=${page}&per_page=${number}`
        const res = await http.get(url)
        const posts = (res.data.items || [])
          .filter((item) => !isPullRequest(item))
          .map(mapIssueToPost)
        commit('updatePostList', {
          page,
          posts,
          total_count: res.data.total_count || posts.length
        })
        return
      }

      const listRes = await http.get(
        `/repos/${getters.repository}/issues?state=open&sort=created&direction=desc&page=${page}&per_page=${number}`
      )
      const posts = (listRes.data || [])
        .filter((item) => !isPullRequest(item))
        .map(mapIssueToPost)
      let total_count = posts.length
      try {
        const countRes = await http.get(
          `/search/issues?q=repo:${getters.repository}+is:issue+state:open&per_page=1`
        )
        if (countRes.data && countRes.data.total_count) {
          total_count = countRes.data.total_count
        }
      } catch (countErr) {
        console.warn(
          '[blog/getIssueList] total_count fallback',
          countErr && countErr.message
        )
      }

      commit('updatePostList', {
        page,
        posts,
        total_count
      })
    } catch (err) {
      console.error('[blog/getIssueList] failed', {
        page,
        key,
        message: err && err.message
      })
      commit('setPending', false)
    }
  }
}
