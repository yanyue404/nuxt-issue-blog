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
  --markdown-body: #24292e;
  --theme-color: #3eaf7c;
  --theme-color-hover: rgba(62, 175, 124, 0.8);
  --primary-color: #000000;
  --background-color: #fff;
  --card-bg: rgba(255, 255, 255, 0.8);
  --textNormal: #353535;
  --border-color: rgba(0, 0, 0, 0.1);
  --juejin-font-1: #252933;
  --juejin-font-2: #515767;
  --juejin-font-3: #8a919f;
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
  color: var(--markdown-body);
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

.el-button--primary {
  background-color: var(--theme-color);
  border-color: var(--theme-color);
  color: #fff;
  transition: all 0.3s ease;

  &:hover,
  &:focus {
    color: #fff;
    background-color: var(--theme-color-hover);
    border-color: var(--theme-color-hover);
    opacity: 0.9;
  }

  &:active {
    color: #fff;
    background-color: var(--theme-color);
    border-color: var(--theme-color);
  }
}

.edit-button {
  padding: 8px 16px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  .el-icon-edit {
    margin-right: 4px;
  }
}
</style>
