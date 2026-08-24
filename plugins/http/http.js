import * as axios from "axios";

global.Buffer = global.Buffer || require("buffer").Buffer;

function resolveGithubToken() {
  if (!process.server) return "";
  const { resolveGithubToken: resolveToken } = require("../../utils/github-token.cjs");
  return resolveToken();
}

function resolveBaseURL() {
  // 本地 nuxt 开发：走同源代理，由服务端附带 Token，避免浏览器 60次/小时限额
  if (process.client && process.env.PATH_TYPE !== "production") {
    return "/";
  }
  return "https://api.github.com";
}

function githubAuthHeaders(token) {
  const headers = {
    Accept: "application/vnd.github.v3.html",
    "User-Agent": "nuxt-issue-blog",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

const token = resolveGithubToken();
const baseURL = resolveBaseURL();
const headers = githubAuthHeaders(token);

console.log("[http] github client", {
  baseURL,
  hasToken: Boolean(token),
  server: Boolean(process.server),
  pathType: process.env.PATH_TYPE,
});

const http = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers,
});

function isTransientNetworkError(error) {
  if (!error) return false;
  const code = error.code || "";
  if (
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "ECONNABORTED" ||
    code === "ENOTFOUND"
  ) {
    return true;
  }
  const msg = String(error.message || "").toLowerCase();
  return (
    msg.includes("aborted") ||
    msg.includes("socket hang up") ||
    msg.includes("timeout") ||
    msg.includes("network")
  );
}

http.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const reqConfig = error.config || {};
    reqConfig.__retryCount = reqConfig.__retryCount || 0;
    if (isTransientNetworkError(error) && reqConfig.__retryCount < 2) {
      reqConfig.__retryCount += 1;
      await new Promise((resolve) =>
        setTimeout(resolve, 600 * reqConfig.__retryCount)
      );
      return http(reqConfig);
    }

    let errMsg = {};
    if (error.response) {
      const status = error.response.status;
      const messages = {
        400: "请求错误(400)",
        401: "未授权，请重新登录(401)",
        403: "拒绝访问(403)",
        404: "请求出错(404)",
        408: "请求超时(408)",
        500: "服务器错误(500)",
        502: "网络错误(502)",
        503: "服务不可用(503)",
        504: "网络超时(504)",
      };
      errMsg.message = messages[status] || `连接出错(${status})!`;
      errMsg.status = status;
      errMsg.url = error.response.config && error.response.config.url;
    } else {
      errMsg.message = error.message || "网络异常";
    }
    console.warn("[http] github api error", errMsg);
    return Promise.reject(error);
  }
);

export default http;
