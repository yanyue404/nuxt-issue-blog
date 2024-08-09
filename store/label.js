import http from '../plugins/http/http'
import { displayCodeText } from '@/utils'

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
    state.labelList = [...state.labelList, ...data.posts]
    state.total_count = data.total_count
  },
  resetPage(state) {
    state.page = 1
    state.labelList = []
    state.total_count = 0
  }
}

export const actions = {
  async getIssueListByLabel(
    { commit, state, rootState, rootGetters, getters },
    { page = 1, label = '', number = 25 }
  ) {
    const url = `/search/issues?q=+repo:${rootGetters['blog/repository']}+label:${label}+state:open&page=${page}&per_page=${number}`
    state.pending = true
    await http.get(url).then((res) => {
      // 分页模式 拼接数据

      const posts = (res.data.items || []).map((item) => {
        return {
          number: item.number,
          title: item.title,
          created_at: item.created_at,
          body_html: displayCodeText(item.body_html).slice(0, 500),
          labels: (item.labels || []).map(({ color, name, id }) => {
            return {
              color,
              name,
              id
            }
          })
        }
      })
      commit('updateLabelList', {
        page,
        posts,
        total_count: res.data.total_count
      })
    })
  }
}
