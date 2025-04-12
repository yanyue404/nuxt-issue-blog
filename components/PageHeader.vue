<template>
  <div class="page-header">
    <div class="header-content">
      <div class="title-wrapper">
        <!-- <nuxt-link to="/" class="back-home">
          <i class="el-icon-arrow-left"></i>
          <span>返回</span>
        </nuxt-link> -->
        <div class="title-section">
          <h1 class="main-title">{{ title }}</h1>
          <div class="sub-title" v-if="subtitle">{{ subtitle }}</div>
        </div>
      </div>
      <div class="meta-actions-wrapper">
        <div class="meta-section" v-if="meta">
          <el-tooltip
            v-for="(item, index) in meta"
            :key="index"
            :content="item.tooltip"
            :disabled="!item.tooltip"
            effect="dark"
            placement="top"
          >
            <div class="meta-item">
              <i :class="item.icon" v-if="item.icon"></i>
              <span>{{ item.text }}</span>
            </div>
          </el-tooltip>
        </div>
        <div class="actions-section" v-if="$slots.actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
    <div class="header-decoration"></div>
  </div>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    title: {
      type: String
    },
    subtitle: {
      type: String,
      default: ''
    },
    meta: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>
.page-header {
  position: relative;
  padding: 24px 0;
  margin-bottom: 24px;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      var(--theme-color) 0%,
      rgba(30, 128, 255, 0.5) 100%
    );
  }
}

.header-content {
  padding: 0 24px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.back-home {
  display: flex;
  align-items: center;
  padding: 6px 0px;
  color: var(--textSecondary);
  font-size: 14px;
  text-decoration: none;
  background: var(--background-color);
  border-radius: 16px;
  transition: all 0.3s ease;
  flex-shrink: 0;
  min-width: 10px;
  height: 32px;

  i {
    margin-right: 4px;
    font-size: 14px;
    transition: transform 0.3s ease;
  }

  span {
    opacity: 0;
    transform: translateX(-6px);
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  &:hover {
    color: var(--theme-color);
    background: var(--hover-bg);
    padding-right: 16px;

    i {
      transform: translateX(-2px);
    }

    span {
      opacity: 1;
      transform: translateX(0);
    }
  }
}
.meta-actions-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-section {
  flex: 1;
  min-width: 0; // 防止文本溢出

  .main-title {
    margin: 0;
    font-weight: 600;
    color: var(--theme-color);
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sub-title {
    font-size: 14px;
    color: var(--textSecondary);
    line-height: 1.6;
    margin-top: 4px;
  }
}

.meta-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;

  .meta-item {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--textSecondary);
    font-size: 13px;
    height: 20px;

    i {
      margin-right: 6px;
      font-size: 14px;
    }
    span {
      line-height: 20px;
    }
  }
}

.actions-section {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.header-decoration {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 160px;
  height: 160px;
  background: linear-gradient(
    135deg,
    transparent 0%,
    rgba(30, 128, 255, 0.03) 100%
  );
  border-radius: 80px 0 0 0;
  pointer-events: none;
}

// 响应式设计
@media (max-width: 768px) {
  .page-header {
    padding: 16px 0;
  }

  .header-content {
    padding: 0 16px;
  }

  .back-home {
    padding: 6px;
    margin-right: 12px;

    span {
      display: none;
    }

    &:hover {
      padding: 6px;

      span {
        display: none;
      }
    }
  }

  .title-section {
    .main-title {
      font-size: 20px;
    }
  }

  .meta-section {
    gap: 12px;
    margin-top: 8px;
  }

  .header-decoration {
    width: 120px;
    height: 120px;
  }
}
</style>
