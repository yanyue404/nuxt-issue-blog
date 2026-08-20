<script>
export default {
  fetch({ query, redirect }) {
    if (query.id) {
      console.warn('[post] redirect legacy query id', query.id)
      return redirect(301, `/post/${query.id}`)
    }
  }
}
</script>
