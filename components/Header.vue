<template>
  <header class="flex-sb-c">
    <h1 class="blog-title" @click="toIndex">{{ blogName }}</h1>
    <DarkMode v-model="dark"></DarkMode>
  </header>
</template>

<script>
import { mapState } from 'vuex'
import { isServer } from '@/utils'
import DarkMode from '@/components/darkMode.vue'

export default {
  name: 'Header',
  components: {
    DarkMode
  },
  data() {
    return {
      dark: !isServer() ? localStorage.getItem('darken-mode') === 'dark' : false
    }
  },
  computed: {
    ...mapState({
      blogName: (state) => state.blog.blogName
    })
  },
  watch: {
    dark: (newVal) => {
      document.querySelector('#darkmode-button').click()
    }
  },
  methods: {
    toIndex() {
      location.reload()
    }
  }
}
</script>

<style lang="scss" scoped>
header.flex-sb-c {
  padding: 1rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));

  .blog-title {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(45deg, var(--theme-color), #666);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      background: linear-gradient(45deg, #666, var(--theme-color));
      -webkit-background-clip: text;
      cursor: pointer;
    }
  }
}

.blog-title {
  font-size: 1.98818rem;
  line-height: 2.625rem;
  margin-bottom: 0px !important;
  margin-top: 0px !important;
  padding-top: 1.8rem;
  padding-bottom: 1.8rem !important;
  border-bottom: none !important;
  font-family: Montserrat, sans-serif;
}
</style>
