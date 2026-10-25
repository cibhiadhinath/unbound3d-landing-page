import './style.css'

// ---------- Mobile navigation ----------
const toggle = document.querySelector('[data-nav-toggle]')
const nav = document.getElementById('site-nav')

if (toggle && nav) {
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open))
    nav.classList.toggle('is-open', open)
    document.body.classList.toggle('nav-open', open)
  }

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'))

  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false)
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false)
      toggle.focus()
    }
  })

  // Close if the viewport grows past the mobile breakpoint while open
  window.matchMedia('(min-width: 768px)').addEventListener('change', (mq) => {
    if (mq.matches) setOpen(false)
  })
}
