<template>
  <div class="markdown-body">
    <Nuxt />
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout',
  head() {
    return {
      htmlAttrs: {
        lang: this.$i18n.locale === 'zh-CN' ? 'zh' : 'en'
      },
      title: this.$t('seo.title'),
      meta: [
        { hid: 'description', name: 'description', content: this.$t('seo.description') },
        { hid: 'keywords', name: 'keywords', content: this.$t('seo.keywords') }
      ]
    }
  }
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
  --card-bg: #ffffff;
  --textNormal: #353535;
  --border-color: rgba(0, 0, 0, 0.06);
  --juejin-font-1: #252933;
  --juejin-font-2: #515767;
  --juejin-font-3: #8a919f;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.08);
  // Markdown 颜色变量 (亮色)
  --md-text: #24292f;
  --md-canvas: var(--background-color);
  --md-canvas-subtle: #f6f8fa;
  --md-link: #0969da;
  --md-border: #d0d7de;
  --md-border-muted: #d8dee4;
  --md-code-bg: rgba(175, 184, 193, 0.2);
  --md-text-muted: #57606a;
  --md-text-subtle: #6e7781;
  --md-highlight-bg: #fff8c5;
  --md-danger: #cf222e;
  --md-success: #116329;
  --md-constant: #0550ae;
  --md-entity: #8250df;
  --md-variable: #953800;
  --md-string: #0a3069;
  --md-diff-del-bg: #ffebe9;
  --md-diff-add-bg: #dafbe1;
  --md-diff-change-bg: #ffd8b5;
  // Hero 首屏 (亮色)
  --hero-gradient: linear-gradient(135deg, #6366f1 0%, #3eaf7c 55%, #06b6d4 100%);
  --hero-glow-1: rgba(255, 255, 255, 0.18);
  --hero-glow-2: rgba(255, 255, 255, 0.12);
  --hero-grid: rgba(255, 255, 255, 0.55);
  --hero-grid-opacity: 0.14;
}
html.dark-mode {
  --markdown-body: #c9d1d9;
  --theme-color: #ffa7c4;
  --theme-color-hover: rgba(255, 167, 196, 0.8);
  --primary-color: #fafafa;
  --background-color: #0d1117;
  --card-bg: #161b22;
  --textNormal: hsla(0, 0%, 100%, 0.88);
  --border-color: rgba(255, 255, 255, 0.08);
  --juejin-font-1: #e6edf3;
  --juejin-font-2: #b1bac4;
  --juejin-font-3: #8b949e;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.4);
  // Markdown 颜色变量 (暗色)
  --md-text: #c9d1d9;
  --md-canvas: #0d1117;
  --md-canvas-subtle: #161b22;
  --md-link: #58a6ff;
  --md-border: #30363d;
  --md-border-muted: #21262d;
  --md-code-bg: rgba(110, 118, 129, 0.4);
  --md-text-muted: #8b949e;
  --md-text-subtle: #6e7781;
  --md-highlight-bg: rgba(187, 128, 9, 0.15);
  --md-danger: #f85149;
  --md-success: #3fb950;
  --md-constant: #79c0ff;
  --md-entity: #d2a8ff;
  --md-variable: #ffa657;
  --md-string: #a5d6ff;
  --md-diff-del-bg: rgba(248, 81, 73, 0.15);
  --md-diff-add-bg: rgba(63, 185, 80, 0.15);
  --md-diff-change-bg: rgba(210, 153, 34, 0.15);
  // Hero 首屏 (暗色)
  --hero-gradient: linear-gradient(135deg, #0f0c29 0%, #241b45 50%, #3a1c5a 100%);
  --hero-glow-1: rgba(129, 140, 248, 0.35);
  --hero-glow-2: rgba(244, 114, 182, 0.22);
  --hero-grid: rgba(129, 140, 248, 0.45);
  --hero-grid-opacity: 0.18;
}
html.dark-mode body {
  background-color: #0d1117;
}
html.dark-mode .glass-card {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}
body {
  background-color: #fafbfc;
  transition: background-color 0.3s ease;
}

.glass-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  color: var(--md-text);
  background-color: var(--md-canvas);
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: var(--theme-color);
  }
  h1 {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-weight: 700;
  }
  img {
    box-sizing: border-box !important;
    border: 0.3em solid var(--md-border) !important;
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
