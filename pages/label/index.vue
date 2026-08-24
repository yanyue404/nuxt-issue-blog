<template>
  <div class="route-placeholder"></div>
</template>

<script>
export default {
  fetch({ query, redirect }) {
    if (query.name) {
      const page = query.page ? `?page=${query.page}` : ''
      return redirect(
        301,
        `/label/${encodeURIComponent(query.name)}${page}`
      )
    }
    return redirect(302, '/')
  }
}
</script>
