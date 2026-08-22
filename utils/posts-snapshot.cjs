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

function issueCachePath() {
  return path.join(__dirname, '..', '.generate', 'issues.json')
}

function writeIssueCache(issues) {
  const map = {}
  ;(issues || []).forEach((issue) => {
    if (!issue || !issue.number) return
    map[String(issue.number)] = {
      id: issue.id,
      number: issue.number,
      title: issue.title,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      body_html: issue.body_html || issue.body || '',
      user: issue.user,
      labels: issue.labels || [],
      html_url: issue.html_url
    }
  })
  const dir = path.dirname(issueCachePath())
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(issueCachePath(), JSON.stringify(map))
  console.log('[generate] wrote .generate/issues.json', Object.keys(map).length)
}

function readIssueCache(id) {
  try {
    const file = issueCachePath()
    if (!fs.existsSync(file)) return null
    const map = JSON.parse(fs.readFileSync(file, 'utf8'))
    return map[String(id)] || null
  } catch (e) {
    return null
  }
}

function readPostsJsonFromDisk() {
  try {
    const file = path.join(__dirname, '..', 'dist', 'data', 'posts.json')
    if (!fs.existsSync(file)) return []
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    return data.posts || []
  } catch (e) {
    return []
  }
}

module.exports = {
  mapIssue,
  writePostsJson,
  writeIssueCache,
  readIssueCache,
  readPostsJsonFromDisk
}
