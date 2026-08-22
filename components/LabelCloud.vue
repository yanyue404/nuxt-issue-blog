<template>
  <div v-if="labels.length" class="label-cloud">
    <div class="label-cloud-inner">
      <span
        v-for="label in labels"
        :key="label.name"
        class="label-tag"
        :class="{ active: activeLabel === label.name }"
        :style="tagStyle(label)"
        @click="handleClick(label.name)"
      >
        {{ label.name }}
        <span class="label-count">{{ label.count }}</span>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LabelCloud',
  props: {
    posts: {
      type: Array,
      default: () => []
    },
    activeLabel: {
      type: String,
      default: ''
    }
  },
  computed: {
    labels() {
      const map = {}
      this.posts.forEach((post) => {
        ;(post.labels || []).forEach((label) => {
          if (!map[label.name]) {
            map[label.name] = { name: label.name, color: label.color, count: 0 }
          }
          map[label.name].count++
        })
      })
      return Object.values(map).sort((a, b) => b.count - a.count)
    }
  },
  methods: {
    tagStyle(label) {
      const isActive = this.activeLabel === label.name
      const color = `#${label.color}`
      if (isActive) {
        return { backgroundColor: color, color: '#fff', borderColor: color }
      }
      return { borderColor: color, color }
    },
    handleClick(name) {
      if (this.activeLabel === name) {
        this.$emit('select', '')
      } else {
        this.$emit('select', name)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.label-cloud {
  padding: 0;
}

.label-cloud-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.label-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 500;
  border: 1.5px solid;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  user-select: none;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.active {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  }
}

.label-count {
  font-size: 11px;
  opacity: 0.7;
  font-weight: 400;
}

@media (max-width: 768px) {
  .label-cloud-inner {
    gap: 6px;
  }

  .label-tag {
    padding: 3px 10px;
    font-size: 12px;
  }
}
</style>
