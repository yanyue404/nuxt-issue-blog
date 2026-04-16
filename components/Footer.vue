<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="project-info">
        <h3>🚀 {{ $t('footer.wantBlog') }}</h3>
        <p>
          {{ $t('footer.builtWith') }}
          <a
            href="https://github.com/yanyue404/nuxt-issue-blog"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nuxt Issue Blog
          </a>
          {{ $t('footer.build') }}
        </p>
        <p class="description">
          {{ $t('footer.description') }}
        </p>
        <div class="features">
          <span>✨ {{ $t('footer.featureSSG') }}</span>
          <span>🌙 {{ $t('footer.featureDark') }}</span>
          <span>💬 {{ $t('footer.featureComment') }}</span>
          <span>🔄 {{ $t('footer.featureDeploy') }}</span>
        </div>
      </div>
      <div class="github-stats">
        <a
          href="https://github.com/yanyue404/nuxt-issue-blog"
          target="_blank"
          rel="noopener noreferrer"
          class="github-button"
        >
          <i class="el-icon-star-on"></i>
          {{ $t('footer.starOnGithub') }}
        </a>
      </div>
    </div>
    <div class="copyright">
      © 2023-{{ new Date().getFullYear() }} Built with Nuxt Issue Blog
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style lang="scss" scoped>
.footer {
  margin-top: 3rem;
  padding: 2rem 1rem;
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  border-top: 1px solid var(--border-color);

  .footer-content {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
    }
  }

  .project-info {
    h3 {
      margin-bottom: 1rem;
      color: var(--theme-color);
    }

    p {
      margin-bottom: 0.5rem;

      a {
        color: var(--theme-color);
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .description {
      color: #666;
      max-width: 500px;
    }

    .features {
      margin-top: 1rem;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;

      @media (max-width: 768px) {
        justify-content: center;
      }

      span {
        padding: 0.3rem 0.8rem;
        background: rgba(var(--theme-color-rgb), 0.1);
        border-radius: 20px;
        font-size: 0.9rem;
        color: var(--theme-color);
      }
    }
  }

  .github-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1.5rem;
    background: #24292e;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    i {
      font-size: 1.2rem;
    }
  }

  .copyright {
    margin-top: 2rem;
    text-align: center;
    color: #666;
    font-size: 0.9rem;
  }
}
</style>
