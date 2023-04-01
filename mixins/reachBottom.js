export default {
  data() {
    return {
      _isReachBottom: false,
      reachBottomDistance: 2 / 3, // 滑动多少触发底部加载事件
    };
  },
  mounted() {
    window.addEventListener("scroll", this._windowScrollHandler);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this._windowScrollHandler);
  },
  methods: {
    _windowScrollHandler() {
      const bottomOfWindow =
        document.documentElement.scrollHeight -
          document.documentElement.scrollTop <=
        document.documentElement.scrollHeight * this.reachBottomDistance;
      if (bottomOfWindow) {
        this._isReachBottom = true;
        // 触发事件会调用页面 methods 的 reachBottomFn 方法。
        typeof this.reachBottomFn === "function" && this.reachBottomFn();
      }
    },
  },
};
