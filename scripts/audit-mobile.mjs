// Mobile audit: horizontal overflow at 360/375px, tap targets < 44×44, body text < 16px.
// Usage: node scripts/audit-mobile.mjs [--base=http://localhost:4173]
import { chromium } from 'playwright'

const base = (process.argv.find((a) => a.startsWith('--base=')) || '--base=http://localhost:4173').slice(7)
const pages = ['', 'hanzof', 'lynx350', 'about', 'contact', 'careers', 'procure']
const browser = await chromium.launch()
let problems = 0

for (const width of [360, 375]) {
  const ctx = await browser.newContext({ viewport: { width, height: 780 }, isMobile: true, hasTouch: true })
  for (const p of pages) {
    const page = await ctx.newPage()
    await page.goto(`${base}/${p}`, { waitUntil: 'networkidle' })
    const r = await page.evaluate(() => {
      const visible = (el) => { const b = el.getBoundingClientRect(); const cs = getComputedStyle(el); return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' }
      const overflow = document.documentElement.scrollWidth - innerWidth
      const wide = [...document.querySelectorAll('body *')].filter((el) => visible(el) && el.getBoundingClientRect().right > innerWidth + 1 && !el.closest('.icon-sprite, .hp-field, .site-nav:not(.is-open), .mobile-cta')).slice(0, 5).map((el) => el.className || el.tagName)
      // Inline links inside running text are exempt (WCAG 2.5.8 inline exception)
      const isInline = (el) => el.matches('p a, dd a, .prose a, .form-status a')
      const small = [...document.querySelectorAll('a, button, input, select, textarea, [role=button]')]
        .filter((el) => visible(el) && !isInline(el) && !el.closest('.hp-field, .mobile-cta, .site-nav:not(.is-open), .skip-link'))
        .filter((el) => { const b = el.getBoundingClientRect(); return b.width < 44 || b.height < 44 })
        .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.name || '').trim().slice(0, 30)}" ${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)}`)
      const tiny = [...document.querySelectorAll('main p, main li, main dd, footer p, footer li, footer address')]
        .filter((el) => visible(el) && el.textContent.trim().length > 20 && parseFloat(getComputedStyle(el).fontSize) < 16 && !el.closest('.part-label, .case-meta'))
        .map((el) => `${el.tagName.toLowerCase()}.${el.className} ${getComputedStyle(el).fontSize} "${el.textContent.trim().slice(0, 30)}"`)
      return { overflow, wide, small, tiny }
    })
    const issues = [...(r.overflow > 0 ? [`overflow ${r.overflow}px: ${r.wide.join(', ')}`] : []), ...r.small.map((s) => `tap target ${s}`), ...r.tiny.map((t) => `small text ${t}`)]
    if (issues.length) { problems += issues.length; console.log(`\n/${p} @ ${width}px`); issues.forEach((i) => console.log('  ' + i)) }
    await page.close()
  }
  await ctx.close()
}
await browser.close()
console.log(problems ? `\n${problems} issue(s)` : 'No mobile issues found')
process.exit(problems ? 1 : 0)
