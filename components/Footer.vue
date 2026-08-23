<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="project-info">
        <h3>🚀 {{ $t('footer.wantBlog') }}</h3>
        <p>
          {{ $t('footer.builtWith') }}
          <a
            :href="repoUrl"
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
          :href="repoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="github-button"
        >
          <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            ></path>
          </svg>
          <span>{{ $t('footer.starOnGithub') }}</span>
          <span v-if="starsDisplay" class="star-badge" :title="$t('footer.starCount', { n: starsDisplay })">
            <i class="el-icon-star-on"></i>
            {{ starsDisplay }}
          </span>
        </a>
      </div>
    </div>
    <div class="copyright">
      {{ $t('footer.copyright', { year: currentYear }) }}
    </div>
  </footer>
</template>

<script>
const TEMPLATE_REPO = 'yanyue404/nuxt-issue-blog'
const CACHE_TTL = 60 * 60 * 1000

export default {
  name: 'Footer',
  data() {
    return {
      starsDisplay: '',
      currentYear: new Date().getFullYear()
    }
  },
  computed: {
    repoUrl() {
      return `https://github.com/${TEMPLATE_REPO}`
    }
  },
  mounted() {
    this.fetchStars()
  },
  methods: {
    readCache(cacheKey) {
      try {
        const cached = sessionStorage.getItem(cacheKey)
        if (!cached) return ''
        const parsed = JSON.parse(cached)
        if (parsed && parsed.label && Date.now() - parsed.ts < CACHE_TTL) {
          return parsed.label
        }
      } catch (e) {}
      return ''
    },
    writeCache(cacheKey, label) {
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ label, ts: Date.now() }))
      } catch (e) {}
    },
    parseShieldsMessage(message) {
      const label = String(message || '').trim()
      if (!label || /^(unknown|invalid|none)$/i.test(label)) return ''
      return label
    },
    async fetchStars() {
      const cacheKey = `github-stars:${TEMPLATE_REPO}`
      const cached = this.readCache(cacheKey)
      if (cached) {
        this.starsDisplay = cached
        return
      }

      try {
        const res = await fetch(`https://img.shields.io/github/stars/${TEMPLATE_REPO}.json`)
        if (res.ok) {
          const data = await res.json()
          const label = this.parseShieldsMessage(data && data.message)
          if (label) {
            this.starsDisplay = label
            this.writeCache(cacheKey, label)
            return
          }
        }
      } catch (e) {}

      try {
        const res = await fetch(`https://api.github.com/repos/${TEMPLATE_REPO}`, {
          headers: { Accept: 'application/vnd.github+json' }
        })
        if (!res.ok) return
        const data = await res.json()
        if (typeof data.stargazers_count !== 'number') return
        const label = data.stargazers_count >= 1000
          ? `${(data.stargazers_count / 1000).toFixed(1).replace(/\.0$/, '')}k`
          : String(data.stargazers_count)
        this.starsDisplay = label
        this.writeCache(cacheKey, label)
      } catch (e) {
        console.warn('[footer] failed to fetch github stars', e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.footer {
  margin-top: 3rem;
  padding: 2rem 1rem;
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  border-top: 1px solid var(--border-color);
  width: 100%;
  box-sizing: border-box;

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
      font-size: 20px;
      font-weight: 600;
      color: var(--theme-color);
    }

    p {
      margin-bottom: 0.5rem;
      font-size: 15px;
      color: var(--textNormal);

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
      color: var(--juejin-font-3, #666);
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
    font-size: 14px;
    background: #24292e;
    color: #fff;
    text-decoration: none;
    border-radius: 6px;
    transition: all 0.3s ease;
    white-space: nowrap;

    html.dark-mode & {
      background: #21262d;
      border: 1px solid var(--border-color);
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    svg {
      flex-shrink: 0;
    }
  }

  .star-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 2px;
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.16);
    border-radius: 999px;
    font-variant-numeric: tabular-nums;
    font-size: 0.85rem;

    i {
      font-size: 0.95rem;
      color: #f8d64e;
    }
  }

  .copyright {
    margin-top: 2rem;
    text-align: center;
    color: var(--juejin-font-3, #666);
    font-size: 0.9rem;
  }
}
</style>
