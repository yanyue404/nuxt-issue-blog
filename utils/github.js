import { displayCodeText } from '@/utils'

export const ISSUE_PAGE_SIZE = 25

export function mapIssueToPost(item) {
  if (!item) return null
  return {
    number: item.number,
    title: item.title,
    created_at: item.created_at,
    body_html: displayCodeText(item.body_html || item.body).slice(0, 500),
    labels: (item.labels || []).map(({ color, name, id }) => {
      return {
        color,
        name,
        id
      }
    })
  }
}

export function isPullRequest(item) {
  return Boolean(item && item.pull_request)
}

export function getPostIdFromRoute(route) {
  if (!route) return ''
  return (route.params && route.params.id) || (route.query && route.query.id) || ''
}

export function decorateIssueHtml(bodyHtml, ungroupedText) {
  const navList = []
  let i = -1
  let h2Index = -1
  const html = (bodyHtml || '').replace(
    /<h([2-3]) (.*?)>(.*?)<\/h[2-3]>/g,
    (_, hType, _style, text) => {
      i++
      const id = `main-heading-H${hType}-${i}`

      if (hType === '2') {
        h2Index++
        navList.push({
          text,
          id,
          type: 'H2',
          children: []
        })
      } else if (hType === '3') {
        if (h2Index < 0 || !navList[h2Index]) {
          h2Index = navList.length
          navList.push({
            text: ungroupedText || '',
            id: `default-h2-${h2Index}`,
            type: 'H2',
            children: []
          })
        }
        navList[h2Index].children.push({
          text,
          id,
          type: 'H3'
        })
      }
      return `<h${hType} id="${id}">${text}</h${hType}>`
    }
  )
  return { html, navList }
}
