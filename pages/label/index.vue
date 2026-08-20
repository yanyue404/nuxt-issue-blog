<script>
export default {
  fetch({ query, redirect }) {
    if (query.name) {
      const page = query.page ? `?page=${query.page}` : ''
      console.warn('[label] redirect legacy query name', query.name)
      return redirect(
        301,
        `/label/${encodeURIComponent(query.name)}${page}`
      )
    }
  }
}
</script>
