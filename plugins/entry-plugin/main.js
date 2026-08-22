import Vue from "vue";
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

export default () => {}
