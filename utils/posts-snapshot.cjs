const fs = require('fs')
const path = require('path')

function excerptFromIssue(issue) {
  return String(issue.body || issue.body_html || '')
    .replace(/<[^>]+>/g, '')
    .replace(/[#*_`>\-\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500)
}

function mapIssue(issue) {
  return {
    number: issue.number,
    title: issue.title,
    created_at: issue.created_at,
    body_html: excerptFromIssue(issue),
    labels: (issue.labels || []).map(({ color, name, id }) => {
      return { color, name, id }
    })
  }
}

function writePostsJson(posts) {
  const payload = JSON.stringify({
    generatedAt: new Date().toISOString(),
    posts: posts
  })
  const dir = path.join(__dirname, '..', 'dist', 'data')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'posts.json'), payload)
  console.log('[generate] wrote dist/data/posts.json', posts.length)
}

module.exports = {
  mapIssue,
  writePostsJson
}
