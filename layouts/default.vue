<template>
  <div class="markdown-body">
    <Nuxt />
  </div>
</template>

<script>
import { getUser } from "../plugins/http/api";
export default {
  data() {
    return {
      user: {},
    };
  },
  created() {
    this.getUserInfo();
  },
  methods: {
    getUserInfo() {
      getUser({ userName: `yanyue404` }).then((res) => {
        this.$set(this, "user", res.data);
      });
    },
  },
};
</script>
<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}
.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
}
@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}

.rainbow {
  color: #027be3;
}
</style>
