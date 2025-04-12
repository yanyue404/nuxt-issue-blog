import Vue from "vue";
import createPersistedState from "vuex-persistedstate";
import "github-markdown-css/github-markdown.css";
import {
  Button,
  Skeleton,
  SkeletonItem,
  Backtop,
  Message,
  Notification,
  Switch,
  Icon,
  Pagination,
  Input,
  Tooltip
} from "element-ui";
import $http from "@/plugins/http/http";
import "element-ui/lib/theme-chalk/index.css";

let main = {
  install(Vue) {
    // 变量的内容 后期可以在vue中 this->$api.xxx 使用
    Vue.prototype.$http = $http;
    // element-ui
    Vue.use(Button);
    Vue.use(Skeleton);
    Vue.use(SkeletonItem);
    Vue.use(Backtop);
    Vue.use(Switch);
    Vue.use(Icon);
    Vue.use(Pagination);
    Vue.use(Input);
    Vue.use(Tooltip);
    Vue.prototype.$message = Message;
    Vue.prototype.$notify = Notification;
  },
};
Vue.use(main); // 这里不能丢

// 这里是 为了在 asyncData 方法中使用
export default ({ store }, inject) => {
  //同时注入到vue实例和context
  if (!process.server) {
    // vuex缓存
    createPersistedState({
      key: "__NUXT_ISSUE_BLOG_STORAGE",
      storage: window.sessionStorage,
    })(store);
  }
};
