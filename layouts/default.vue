<template>
  <div class="markdown-body">
    <button v-show="false" id="darkmode-button">Toggle dark mode</button>
    <Nuxt />
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout'
}
</script>

<style lang="scss">
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}
:root {
  --theme-color-rgb: 62, 175, 124;
  --border-color: rgba(0, 0, 0, 0.1);
}
body {
  background-color: #f2f3f5;
}

.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 1146px;
  margin: 0 auto;
  padding: 0 15px;
  // padding: 45px;
  // color: var(--markdown-body);
  background: var(--background-color);
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: var(--theme-color);
  }
  h1 {
    font-family: 'Montserrat', sans-serif;
  }
  img {
    box-sizing: border-box !important;
    border: 0.3em solid #e0dfcc !important;
    border-radius: 1em;
    &[width='40%'] {
      width: 40%;
    }
    &[width='50%'] {
      width: 50%;
    }
    &[width='60%'] {
      width: 60%;
    }
    &[width='70%'] {
      width: 70%;
    }
    &[width='80%'] {
      width: 80%;
    }
    &[width='90%'] {
      width: 90%;
    }
  }
}
</style>
