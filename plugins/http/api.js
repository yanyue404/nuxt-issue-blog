import http from "./http.js";

export const getUser = (params, config) =>
  http.get(`https://api.github.com/users/${params.userName}`, config);
