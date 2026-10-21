// CLOSE-1 prototype mount: appends the chosen direction (?c=c1|c2|c3, default c1) inside the real page's
// <main class="fintasy-page"> once Vue has rendered it. ?clean hides the switcher; ?at=faq|cta scrolls there.
const params = new URLSearchParams(location.search)
const ids = ['c1', 'c2', 'c3']
const pick = ids.includes(params.get('c')) ? params.get('c') : 'c1'

function whenMain() {
  return new Promise((resolve) => {
    const found = document.querySelector('main.fintasy-page')
    if (found)
      return resolve(found)
    const mo = new MutationObserver(() => {
      const m = document.querySelector('main.fintasy-page')
      if (m) {
        mo.disconnect()
        resolve(m)
      }
    })
    mo.observe(document.documentElement, { childList: true, subtree: true })
  })
}

function wireAccordion(root) {
  root.querySelectorAll('.c1-item button[aria-controls]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true'
      btn.setAttribute('aria-expanded', String(!open))
      document.getElementById(btn.getAttribute('aria-controls')).hidden = open
    })
  })
}

const [main, html] = await Promise.all([whenMain(), fetch('../directions.html').then(r => r.text())])
const doc = new DOMParser().parseFromString(html, 'text/html')
main.append(doc.getElementById(pick).content.cloneNode(true))
wireAccordion(main)

if (!params.has('clean')) {
  const nav = document.createElement('nav')
  nav.className = 'cl-chrome'
  nav.setAttribute('aria-label', 'Direction switcher (prototype)')
  for (const id of ids) {
    const a = document.createElement('a')
    const q = new URLSearchParams(location.search)
    q.set('c', id)
    q.set('at', 'faq')
    a.href = `?${q}`
    a.textContent = id.toUpperCase()
    if (id === pick)
      a.setAttribute('aria-current', 'true')
    nav.append(a)
  }
  document.body.append(nav)
}

const at = params.get('at')
if (at)
  requestAnimationFrame(() => document.getElementById(at)?.scrollIntoView({ block: 'start' }))
