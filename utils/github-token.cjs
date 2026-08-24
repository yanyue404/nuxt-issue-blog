/**
 * 构建期 GitHub Token：环境变量优先，失败再回退 blog.config.cjs。
 * 切勿把 token 打进日志或前端包。
 */
function decodeConfigToken() {
  try {
    const conf = require('../blog.config.cjs')
    if (conf.accessToken) {
      return Buffer.from(conf.accessToken, 'base64').toString('utf8').trim()
    }
  } catch (e) {
    // ignore
  }
  return ''
}

function resolveGithubToken() {
  const envToken = String(process.env.GITHUB_TOKEN || process.env.ACCESS_TOKEN || '').trim()
  return envToken || decodeConfigToken()
}

function githubAuthHeaders(token) {
  const headers = {
    Accept: 'application/vnd.github.v3.html',
    'User-Agent': 'nuxt-issue-blog',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

function tokenCandidates() {
  const envToken = String(process.env.GITHUB_TOKEN || process.env.ACCESS_TOKEN || '').trim()
  const configToken = decodeConfigToken()
  const list = []
  const seen = new Set()
  ;[envToken, configToken, ''].forEach((token) => {
    if (seen.has(token)) return
    seen.add(token)
    list.push(token)
  })
  return list
}

function isRetryableGithubError(err) {
  const status = err.response && err.response.status
  if (!status) return true
  if (status === 404 || status === 401) return false
  const msg = String(
    (err.response.data && (err.response.data.message || err.response.data)) || ''
  )
  if (status === 403 && /rate limit|secondary rate/i.test(msg)) return true
  if (status === 403) return false
  return status >= 500
}

function githubErrorDetail(err) {
  const res = err.response
  if (!res) return { message: err.message }
  const data = res.data || {}
  return {
    status: res.status,
    message: data.message || err.message,
    documentation_url: data.documentation_url
  }
}

module.exports = {
  decodeConfigToken,
  resolveGithubToken,
  githubAuthHeaders,
  tokenCandidates,
  isRetryableGithubError,
  githubErrorDetail
}
