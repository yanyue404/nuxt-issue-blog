<template>
  <nav class="flex-sb-c">
    <div style="display: flex; margin-bottom: 1.5rem">
      <img class="avatar" :src="user.avatar_url" :alt="user.name" />
      <div class="columnBetweenStart" style="max-width: 310px">
        <p>
          Personal blog by
          <a :href="user.html_url">{{ user.name }}</a>
        </p>
        <p>{{ user.bio }}</p>
      </div>
    </div>
    <div style="margin-bottom: 1.5rem; flex: 0.9">
      <el-input
        v-model="keyWorldVal"
        placeholder="搜索文章标题/关键字"
        :clearable="true"
      ></el-input>
    </div>
  </nav>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'Nav',
  computed: {
    ...mapState({
      user: (state) => state.user,
      keyWorld: (state) => state.blog.keyWorld
    }),
    keyWorldVal: {
      get() {
        return this.keyWorld || ''
      },
      set(val) {
        this.updateKeyWorld(val)
      }
    }
  },
  methods: {
    ...mapMutations({
      updateKeyWorld: 'blog/updateKeyWorld'
    })
  }
}
</script>

<style lang="scss" scoped>
nav.flex-sb-c {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 1rem 0;
  .avatar {
    margin-right: 0.875rem;
    margin-bottom: 0px;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    border: none !important;
    transition: transform 0.6s ease;

    &:hover {
      transform: rotate(360deg);
    }
  }

  > div:first-child {
    flex: 1;
    min-width: 300px;
    padding: 1rem;
    background: var(--card-bg, rgba(255, 255, 255, 0.8));
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    }
  }

  > div:last-child {
    flex: 1;
    min-width: 300px;

    :deep(.el-input) {
      .el-input__inner {
        border-radius: 8px;
        border: 2px solid var(--border-color, rgba(0, 0, 0, 0.1));
        padding: 0.8rem 1rem;
        font-size: 1rem;
        transition: all 0.3s ease;

        &:focus {
          border-color: var(--theme-color);
          box-shadow: 0 0 0 3px rgba(var(--theme-color-rgb), 0.1);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  nav.flex-sb-c {
    gap: 1rem;

    > div:first-child,
    > div:last-child {
      flex: 1 1 100%;
    }
  }
}
</style>
