<template>
  <div class="author-card">
    <img class="avatar" :src="user.avatar_url" :alt="user.name" />
    <div class="author-info">
      <a class="author-name" :href="user.html_url" target="_blank">{{ user.name }}</a>
      <p class="author-bio">{{ user.bio }}</p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Nav',
  computed: {
    ...mapState({
      user: (state) => state.user
    })
  }
}
</script>

<style lang="scss" scoped>
.author-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none !important;
  flex-shrink: 0;
  transition: transform 0.6s ease;

  &:hover {
    transform: rotate(360deg);
  }
}

.author-info {
  min-width: 0;
}

.author-name {
  font-weight: 600;
  color: var(--juejin-font-1, #252933);
  text-decoration: none;
  font-size: 15px;

  &:hover {
    color: var(--theme-color);
  }
}

.author-bio {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--juejin-font-3, #8a919f);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .author-card {
    padding: 16px;
  }
}
</style>
