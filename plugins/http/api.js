import http from "./http.js";

export const getUser = (params, config) =>
  http.get(`/users/${params.userName}`, config);

// 所有的 labels
// /repos/{owner}/{repo}/labels
