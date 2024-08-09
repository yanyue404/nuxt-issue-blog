import { getUser } from '@/plugins/http/api'

export const state = () => ({
  id: '',
  avatar_url: '',
  name: '', // 昵称
  html_url: '', // 个人 github 账号
  bio: '', // 个人描述
  type: 'User' // 个人或组织
})

export const getters = {}

export const mutations = {
  // https://api.github.com/users/yanyue404
  updateUser(state, { avatar_url, id, bio, name, html_url, type }) {
    state.avatar_url = avatar_url
    state.id = id
    state.bio = bio
    state.name = name
    state.html_url = html_url
    state.type = type
  }
}

export const actions = {
  getUserInfo({ rootState, commit }) {
    getUser({ userName: rootState.blog.userName }).then((res) => {
      commit('updateUser', res.data)
    })
  }
}
