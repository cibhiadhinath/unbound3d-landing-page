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

// ---------- Sticky mobile CTA bar ----------
// Shows once the hero has scrolled away; hides over the footer and while the on-screen keyboard is open.
const cta = document.querySelector('[data-mobile-cta]')
const hero = document.querySelector('.hero, .page-hero')
const footer = document.querySelector('[data-footer]')

if (cta && hero && footer && 'IntersectionObserver' in window) {
  const state = { pastHero: false, footerVisible: false, keyboard: false }
  const update = () => cta.classList.toggle('is-visible', state.pastHero && !state.footerVisible && !state.keyboard)

  new IntersectionObserver(([entry]) => {
    state.pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0
    update()
  }).observe(hero)

  new IntersectionObserver(([entry]) => {
    state.footerVisible = entry.isIntersecting
    update()
  }).observe(footer)

  const isField = (el) => el && el.matches && el.matches('input, textarea, select')
  document.addEventListener('focusin', (e) => { if (isField(e.target)) { state.keyboard = true; update() } })
  document.addEventListener('focusout', (e) => { if (isField(e.target)) { state.keyboard = false; update() } })

  // Fallback for keyboards that don't move focus (e.g. some Android IMEs)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      const open = window.visualViewport.height < window.innerHeight * 0.75
      if (open !== state.keyboard && !isField(document.activeElement)) { state.keyboard = open; update() }
    })
  }
}
