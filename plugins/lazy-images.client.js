/**
 * 图片懒加载 — 使用 IntersectionObserver 延迟加载文章中的图片
 */
function setupLazyImages() {
  const images = document.querySelectorAll(
    '.article-area img:not([data-lazy-done])'
  )
  if (!images.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const img = entry.target
        const src = img.dataset.src
        if (src) {
          img.src = src
          img.removeAttribute('data-src')
        }
        img.setAttribute('data-lazy-done', '1')
        img.classList.add('lazy-loaded')
        observer.unobserve(img)
      })
    },
    { rootMargin: '200px 0px' }
  )

  images.forEach((img) => {
    if (img.dataset.lazyDone) return
    const realSrc = img.getAttribute('src')
    if (!realSrc || img.complete) {
      img.setAttribute('data-lazy-done', '1')
      return
    }
    img.dataset.src = realSrc
    img.src =
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E'
    img.style.minHeight = '100px'
    img.style.background = '#f0f0f0'
    img.style.transition = 'opacity 0.3s'
    img.style.opacity = '0.4'
    observer.observe(img)
  })
}

const style = document.createElement('style')
style.textContent = `
.lazy-loaded {
  opacity: 1 !important;
  min-height: auto !important;
  background: none !important;
  transition: opacity 0.4s ease;
}
`
document.head.appendChild(style)

const observer = new MutationObserver(() => {
  setupLazyImages()
})
observer.observe(document.body, { childList: true, subtree: true })
setupLazyImages()
