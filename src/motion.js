// Motion: reveals, process connector, header state, Lynx showpiece. (Hero: hero-slicer.js)
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

    const stage = show.querySelector('.lynx-show-stage')
    const img = stage.querySelector('img')
    const svg = stage.querySelector('.callout-leaders')
    const NS = 'http://www.w3.org/2000/svg'

    // One leader per callout: from the callout's left edge to its anchor point on the printer image
    const leaders = callouts.map(() => {
      const g = document.createElementNS(NS, 'g')
      const line = document.createElementNS(NS, 'line')
      line.setAttribute('pathLength', '1')
      const dot = document.createElementNS(NS, 'circle')
      dot.setAttribute('r', '4')
      g.append(line, dot)
      svg.append(g)
      return { g, line, dot }
    })

    const layoutLeaders = () => {
      if (!show.classList.contains('is-pinned')) return
      const s = stage.getBoundingClientRect()
      const im = img.getBoundingClientRect()
      callouts.forEach((c, i) => {
        const [fx, fy] = c.dataset.anchor.split(',').map(Number)
        const ax = im.left - s.left + fx * im.width
        const ay = im.top - s.top + fy * im.height
        const r = c.getBoundingClientRect()
        const { line, dot } = leaders[i]
        line.setAttribute('x1', r.left - s.left)
        line.setAttribute('y1', r.top - s.top + r.height / 2)
        line.setAttribute('x2', ax)
        line.setAttribute('y2', ay)
        dot.setAttribute('cx', ax)
        dot.setAttribute('cy', ay)
      })
    }

    const step = () => {
      ticking = false
      const rect = show.getBoundingClientRect()
      const distance = show.offsetHeight - window.innerHeight
      const progress = Math.min(1, Math.max(0, -rect.top / distance))
      callouts.forEach((c, i) => {
        const on = progress > (i + 0.5) / (callouts.length + 0.5)
        c.classList.toggle('is-on', on)
        leaders[i].g.classList.toggle('is-on', on)
      })
    }

    new ResizeObserver(layoutLeaders).observe(stage)
    if (!img.complete) img.addEventListener('load', layoutLeaders, { once: true })

    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(step) }
    }

    const setup = () => {
      const pin = desktop.matches
      show.classList.toggle('is-pinned', pin)
      if (pin) {
        callouts.forEach((c) => c.classList.add('is-in'))
        window.addEventListener('scroll', onScroll, { passive: true })
        layoutLeaders()
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
