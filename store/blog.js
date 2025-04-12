import blogConfig from '../blog.config'
import http from '../plugins/http/http'
import { isServer, displayCodeText } from '@/utils'

export const state = () => ({
  ...blogConfig,
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
  updatePage(state, val) {
    state.page = val
  },
  updateKeyWorld(state, val) {
    state.keyWorld = val
  }
}

export const actions = {
  async getIssueList(
    { commit, state, rootState, getters },
    { page = 1, number = 25, keyWorld = '' }
  ) {
    let url = `/search/issues?q=+repo:${getters.repository}+state:open&page=${page}&per_page=${number}`
    // 关键词搜索 q=
    const key = keyWorld || state.keyWorld
    if (key) {
      url = url.replace(/\+repo/g, (m) => `${key}${m}`)
    }
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
      commit('updatePostList', {
        page,
        posts,
        total_count: res.data.total_count
      })
    })
  }
}
