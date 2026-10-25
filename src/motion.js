// Motion: reveals, hero print, process connector, header state, Lynx showpiece.
// Every effect is skipped when the visitor prefers reduced motion (no .js-motion class),
// leaving content in its final state.

const root = document.documentElement
const motionOn = root.classList.contains('js-motion')
window.__motionReady = true

// ---------- Header: transparent only at the very top of the homepage ----------
// Goes solid as soon as the page scrolls, so the hero never slides under a see-through header.
const header = document.querySelector('[data-header]')
const hero = document.querySelector('[data-hero]')

if (header && hero) {
  let ticking = false
  const sync = () => {
    ticking = false
    header.toggleAttribute('data-transparent', window.scrollY < 4)
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(sync) }
  }, { passive: true })
  sync()
}

if (motionOn && 'IntersectionObserver' in window) {
  // ---------- Site-wide reveals (once, at 15% in view) ----------
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    group.querySelectorAll('[data-reveal]').forEach((el, i) => {
      el.style.setProperty('--delay', `${Math.min(i * 60, 400)}ms`)
    })
  })

  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-in')
      revealer.unobserve(entry.target)
    })
  }, { threshold: 0.15 })

  document.querySelectorAll('[data-reveal]').forEach((el) => revealer.observe(el))

  // ---------- Hero: layer-by-layer print, once per session ----------
  const print = document.querySelector('[data-print]')
  if (hero && print) {
    let played = false
    try { played = sessionStorage.getItem('u3d-print-played') === '1' } catch { /* storage blocked */ }

    const finish = () => {
      print.classList.add('print-done')
      hero.classList.add('is-ready')
      try { sessionStorage.setItem('u3d-print-played', '1') } catch { /* storage blocked */ }
    }

    if (played) {
      print.classList.add('print-done')
      hero.classList.add('is-ready')
    } else {
      print.classList.add('print-play')
      print.querySelector('.print-part').addEventListener('animationend', finish, { once: true })
      setTimeout(finish, 2400) // safety net if animationend never fires
    }
  }

  // ---------- How it works: connector draws, steps light in sequence ----------
  const process = document.querySelector('[data-process]')
  if (process) {
    process.setAttribute('data-animate', '')
    const steps = process.querySelectorAll('.process-step')
    new IntersectionObserver(([entry], obs) => {
      if (!entry.isIntersecting) return
      obs.disconnect()
      process.classList.add('is-drawn')
      steps.forEach((step, i) => setTimeout(() => step.classList.add('is-lit'), 150 + i * 375))
    }, { threshold: 0.4 }).observe(process)
  }

  // ---------- Lynx 350 showpiece: pinned with scroll-stepped callouts (≥1024px) ----------
  const show = document.querySelector('[data-lynx-show]')
  if (show) {
    const callouts = [...show.querySelectorAll('[data-callout]')]
    const desktop = window.matchMedia('(min-width: 1024px)')
    let ticking = false

    const step = () => {
      ticking = false
      const rect = show.getBoundingClientRect()
      const distance = show.offsetHeight - window.innerHeight
      const progress = Math.min(1, Math.max(0, -rect.top / distance))
      callouts.forEach((c, i) => c.classList.toggle('is-on', progress > (i + 0.5) / (callouts.length + 0.5)))
    }
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(step) }
    }

    const setup = () => {
      const pin = desktop.matches
      show.classList.toggle('is-pinned', pin)
      if (pin) {
        callouts.forEach((c) => c.classList.add('is-in'))
        window.addEventListener('scroll', onScroll, { passive: true })
        step()
      } else {
        window.removeEventListener('scroll', onScroll)
        callouts.forEach((c) => c.classList.remove('is-on'))
      }
    }

    setup()
    desktop.addEventListener('change', setup)
  }
}
