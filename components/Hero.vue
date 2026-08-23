<template>
  <section class="hero">
    <div class="hero-content">
      <h2 class="hero-title">{{ heroTitle }}</h2>
      <p v-if="heroSubtitle" class="hero-desc">{{ heroSubtitle }}</p>
      <div class="hero-actions">
        <button class="hero-btn primary" @click="scrollToList">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
          {{ $t('label.recentPosts') }}
        </button>
        <button class="hero-btn secondary" @click="openSearch">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          {{ $t('nav.searchPlaceholder') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Hero',
  computed: {
    ...mapState({
      heroTitle: (state) => state.blog.heroTitle || state.blog.blogName,
      heroSubtitle: (state) => state.blog.heroSubtitle || ''
    })
  },
  methods: {
    scrollToList() {
      const el = document.querySelector('.home-main')
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 70
        window.scrollTo({ top, behavior: 'smooth' })
      }
    },
    openSearch() {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true
      })
      document.dispatchEvent(event)
    }
  }
}
</script>

<style lang="scss" scoped>
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  width: 100%;
  padding: 72px 32px 56px;
  text-align: center;
  background: var(--hero-gradient);
}

/* 光晕：伪元素 + 负 z-index，被 isolation 限制在 hero 自身层叠上下文内，不会泄漏到全页 */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 20% 50%, var(--hero-glow-1) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 20%, var(--hero-glow-2) 0%, transparent 45%);
  animation: heroGlow 10s ease-in-out infinite alternate;
}

/* 科技感网格：向边缘渐隐，营造 HUD/网格质感 */
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: var(--hero-grid-opacity);
  background-image:
    linear-gradient(var(--hero-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--hero-grid) 1px, transparent 1px);
  background-size: 36px 36px;
  -webkit-mask-image: radial-gradient(ellipse at center, #000 25%, transparent 78%);
  mask-image: radial-gradient(ellipse at center, #000 25%, transparent 78%);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 560px;
  margin: 0 auto;
}

.hero-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px;
  border-bottom: none;
  letter-spacing: -0.3px;
  animation: heroFadeUp 0.5s ease both;
}

.hero-desc {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 28px;
  line-height: 1.6;
  animation: heroFadeUp 0.5s ease 0.1s both;
}

.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  animation: heroFadeUp 0.5s ease 0.2s both;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  &.primary {
    background: #ffffff;
    color: #2d2d3a;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.35);

    &:hover {
      background: rgba(255, 255, 255, 0.24);
      transform: translateY(-1px);
    }
  }
}

/* 暗黑主题：仅主按钮需微调，渐变/光晕/网格均由全局 CSS 变量驱动 */
:global(html.dark-mode) .hero-btn.primary {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.22);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

@keyframes heroGlow {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.9;
  }
  100% {
    transform: translate3d(0, -12px, 0) scale(1.08);
    opacity: 1;
  }
}

@keyframes heroFadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 48px 20px 36px;
  }

  .hero-title {
    font-size: 1.6rem;
  }

  .hero-desc {
    font-size: 0.9rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
