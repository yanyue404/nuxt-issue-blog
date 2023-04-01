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
<style lang="scss">
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
  img {
    border: 0.3em solid #e0dfcc;
    border-radius: 1em;
    &[width="40%"] {
      width: 40%;
    }
    &[width="50%"] {
      width: 50%;
    }
    &[width="60%"] {
      width: 60%;
    }
    &[width="70%"] {
      width: 70%;
    }
    &[width="80%"] {
      width: 80%;
    }
    &[width="90%"] {
      width: 90%;
    }
  }
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
