import http from '../plugins/http/http'
import { ISSUE_PAGE_SIZE, isPullRequest, mapIssueToPost } from '@/utils/github'

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
    { commit, rootGetters },
    { page = 1, label = '', number = ISSUE_PAGE_SIZE } = {}
  ) {
    const q = `repo:${rootGetters['blog/repository']} label:"${label}" is:issue state:open`
    const url = `/search/issues?q=${encodeURIComponent(
      q
    )}&sort=created&order=desc&page=${page}&per_page=${number}`
    commit('setPending', true)
    try {
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
      console.error('[label/getIssueListByLabel] failed', {
        page,
        label,
        message: err && err.message
      })
      commit('setPending', false)
    }
  }
}
