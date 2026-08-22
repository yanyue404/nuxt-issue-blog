/**
 * 为所有 <pre> 代码块注入复制按钮
 */
function addCopyButtons() {
  document.querySelectorAll('pre').forEach((pre) => {
    if (pre.querySelector('.code-copy-btn')) return
    const btn = document.createElement('button')
    btn.className = 'code-copy-btn'
    btn.textContent = 'Copy'
    btn.addEventListener('click', () => {
      const code = pre.querySelector('code')
      let text
      if (code) {
        text = code.textContent
      } else {
        const clone = pre.cloneNode(true)
        clone.querySelectorAll('.code-copy-btn').forEach((el) => el.remove())
        text = clone.textContent
      }
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied!'
        btn.classList.add('copied')
        setTimeout(() => {
          btn.textContent = 'Copy'
          btn.classList.remove('copied')
        }, 2000)
      })
    })
    pre.style.position = 'relative'
    pre.appendChild(btn)
  })
}

const style = document.createElement('style')
style.textContent = `
.code-copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 4px;
  background: rgba(0,0,0,0.3);
  color: #ccc;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
  z-index: 10;
}
pre:hover .code-copy-btn {
  opacity: 1;
}
.code-copy-btn:hover {
  background: rgba(0,0,0,0.6);
  color: #fff;
}
.code-copy-btn.copied {
  background: #3eaf7c;
  color: #fff;
  border-color: #3eaf7c;
}
`
document.head.appendChild(style)

// 初始执行 + 监听 DOM 变化（SPA 路由切换时新内容加载）
const observer = new MutationObserver(() => {
  addCopyButtons()
})
observer.observe(document.body, { childList: true, subtree: true })
addCopyButtons()
