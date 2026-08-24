<template>
  <div class="route-placeholder"></div>
</template>

<script>
export default {
  fetch({ query, redirect }) {
    if (query.id) {
      return redirect(301, `/post/${query.id}`)
    }
    return redirect(302, '/')
  }
}
</script>
