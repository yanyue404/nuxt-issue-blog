import blogConfig from '../blog.config'
import http from '../plugins/http/http'
import { isServer } from '@/utils'
import { ISSUE_PAGE_SIZE, isPullRequest, mapIssueToPost } from '@/utils/github'

const publicBlogConfig = Object.assign({}, blogConfig)
delete publicBlogConfig.accessToken

export const state = () => ({
  ...publicBlogConfig,
  serverLoaded: false,
  postList: [],
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

export const actions = {
  async getIssueList(
    { commit, state, getters },
    { page = 1, number = ISSUE_PAGE_SIZE, keyWorld = '' } = {}
  ) {
    const key = keyWorld || state.keyWorld
    commit('setPending', true)

    try {
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
