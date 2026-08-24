import http from '../plugins/http/http'
import {
  ISSUE_PAGE_SIZE,
  isPullRequest,
  isStaticClient,
  mapIssueToPost
} from '@/utils/github'

export const state = () => ({
  labelList: [],
  page: 1,
  total_count: 0,
  pending: false
})

export const getters = {}

export const mutations = {
  updateLabelList(state, data) {
    state.page = data.page
    state.pending = false
    state.labelList = [...data.posts]
    state.total_count = data.total_count
  },
  setPending(state, val) {
    state.pending = val
  },
  resetPage(state) {
    state.page = 1
    state.labelList = []
    state.total_count = 0
  }
}

export const actions = {
  async getIssueListByLabel(
    { commit, dispatch, rootGetters },
    { page = 1, label = '', number = ISSUE_PAGE_SIZE } = {}
  ) {
    commit('setPending', true)
    try {
      if (process.static || isStaticClient()) {
        const all = await dispatch('blog/ensureStaticPosts', null, {
          root: true
        })
        const filtered = (all || []).filter((post) =>
          (post.labels || []).some((item) => item.name === label)
        )
        const start = (page - 1) * number
        commit('updateLabelList', {
          page,
          posts: filtered.slice(start, start + number),
          total_count: filtered.length
        })
        return
      }

      const q = `repo:${rootGetters['blog/repository']} label:"${label}" is:issue state:open`
      const url = `/search/issues?q=${encodeURIComponent(
        q
      )}&sort=created&order=desc&page=${page}&per_page=${number}`
      const res = await http.get(url)
      const posts = (res.data.items || [])
        .filter((item) => !isPullRequest(item))
        .map(mapIssueToPost)
      commit('updateLabelList', {
        page,
        posts,
        total_count: res.data.total_count || posts.length
      })
    } catch (err) {
      console.warn('[label/getIssueListByLabel] failed', {
        page,
        label,
        message: err && err.message
      })
      commit('setPending', false)
    }
  }
}
