<template>
  <div v-show="postList.length !== 0">
    <!-- 博客列表 -->
    <BlogItem :pending="pending" :postList="postList" />
    <!-- 分页 -->
    <div v-show="total_count > 25" class="paginate-container">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page.sync="pageNum"
        :page-size="25"
        :total="total_count"
        @current-change="handleCurrentChange"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import BlogItem from '@/components/BlogItem.vue'

export default {
  name: 'BlogList',
  components: {
    BlogItem
  },
  props: {
    pending: {
      type: Boolean,
      default: false
    },
    postList: {
      type: Array,
      default: () => []
    },
    pageNum: {
      type: Number,
      default: 1
    },
    total_count: {
      type: Number,
      default: 0
    }
  },
  methods: {
    handleCurrentChange(val) {
      this.$emit('update:pageNum', val)
      this.$emit('page-change', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.paginate-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  margin-bottom: 16px;
  text-align: center;

  ::v-deep .el-pagination {
    &.is-background {
      .el-pager li:not(.disabled) {
        &.active {
          background-color: var(--theme-color) !important;
          color: #fff;

          &:hover {
            opacity: 0.8;
          }
        }

        &:not(.active):hover {
          color: var(--theme-color);
        }
      }

      .btn-prev,
      .btn-next {
        &:hover {
          color: var(--theme-color);
        }
      }
    }

    button:disabled {
      background-color: #f4f4f5;
    }
  }
}
</style>
