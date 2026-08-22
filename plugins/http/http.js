import * as axios from "axios";
import qs from "qs";

global.Buffer = global.Buffer || require("buffer").Buffer;

function resolveGithubToken() {
  if (!process.server) return "";
  const envToken = process.env["GITHUB_TOKEN"];
  if (envToken) return envToken;
  try {
    const conf = require("../../blog.config.cjs");
    if (conf.accessToken) {
      return Buffer.from(conf.accessToken, "base64").toString();
    }
  } catch (e) {
    console.warn("[http] server token missing", e && e.message);
  }
  return "";
}

function resolveBaseURL() {
  // 本地 nuxt 开发：走同源代理，由服务端附带 Token，避免浏览器 60次/小时限额
  if (process.client && process.env.PATH_TYPE !== "production") {
    return "/";
  }
  return "https://api.github.com";
}

const token = resolveGithubToken();
const baseURL = resolveBaseURL();
const headers = {
  Accept: "application/vnd.github.v3.html",
};
if (token) {
  headers.Authorization = `token ${token}`;
}

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
  (error) => {
    let errMsg = {};
    if (qs.parse(error).response) {
      switch (qs.parse(error).response.status) {
        case 400:
          errMsg.message = "请求错误(400)";
          break;
        case 401:
          errMsg.message = "未授权，请重新登录(401)";
          break;
        case 403:
          errMsg.message = "拒绝访问(403)";
          break;
        case 404:
          errMsg.message = "请求出错(404)";
          break;
        case 408:
          errMsg.message = "请求超时(408)";
          break;
        case 500:
          errMsg.message = "服务器错误(500)";
          break;
        case 501:
          errMsg.message = "服务未实现(501)";
          break;
        case 502:
          errMsg.message = "网络错误(502)";
          break;
        case 503:
          errMsg.message = "服务不可用(503)";
          break;
        case 504:
          errMsg.message = "网络超时(504)";
          break;
        case 505:
          errMsg.message = "HTTP版本不受支持(505)";
          break;
        default:
          errMsg.message = `连接出错(${qs.parse(error).response.status})!`;
      }
      errMsg.status = qs.parse(error).response.status;
      errMsg.url = qs.parse(error).response.config.url;
    } else {
      errMsg.message = error.message || "网络异常";
    }
    console.error("[http] github api error", errMsg);
    return Promise.reject(error);
  }
);

export default http;
