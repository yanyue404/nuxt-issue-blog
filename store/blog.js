import blogConfig from "../blog.config";
import http from "../plugins/http/http";
import { isServer } from "@/utils";

export const state = () => ({
  ...blogConfig,
  serverLoaded: false,
  postList: [],
  page: 0,
  total_count: 0,
  pending: false,
});

export const getters = {
  repository(s) {
    return `${s.username}/${s.repository}`;
  },
};

export const mutations = {
  updatePostList(state, data) {
    if (isServer()) {
      state.serverLoaded = true;
    }
    console.log("data.total_count", data.total_count);
    state.page = data.page;
    state.pending = false;
    state.postList = [...state.postList, ...data.posts];
    state.total_count = data.total_count;
  },
};

export const actions = {
  async getIssueList(
    { commit, state, rootState, getters },
    { page = 1, number = 30, keyWorld = "" }
  ) {
    let url = `/search/issues?q=+repo:${getters.repository}+state:open&page=${page}&per_page=${number}`;
    state.pending = true;
    await http.get(url).then((res) => {
      // 分页模式 拼接数据
      commit("updatePostList", {
        page,
        posts: res.data.items,
        total_count: res.data.total_count,
      });
    });
  },
};
