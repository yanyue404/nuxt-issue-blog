import blogConfig from "../blog.config";

export const state = () => blogConfig;

export const getters = {
  username(s) {
    return s.username;
  },
  repository(s) {
    return `${s.username}/${s.repository}`;
  },
  accessToken(s) {
    return s.accessToken;
  },
  blogName(s) {
    return s.blogName;
  },
  links(s) {
    return s.links;
  },
};

export const mutations = {};

export const actions = {};
