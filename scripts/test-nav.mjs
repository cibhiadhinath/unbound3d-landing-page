// Mobile menu + sticky CTA checks.
import { chromium } from 'playwright'
const base = (process.argv.find((a) => a.startsWith('--base=')) || '--base=http://localhost:4173').slice(7)
const browser = await chromium.launch()
const page = await (await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true })).newPage()
const ok = []
const check = (n, v) => { ok.push(v); console.log(`${v ? '✓' : '✗'} ${n}`) }
await page.goto(`${base}/hanzof`)
const t = '[data-nav-toggle]'
check('toggle is a button with aria-expanded=false', await page.$eval(t, (b) => b.tagName === 'BUTTON' && b.getAttribute('aria-expanded') === 'false'))
await page.click(t)
check('opens: aria-expanded=true, menu visible', (await page.getAttribute(t, 'aria-expanded')) === 'true' && await page.isVisible('#site-nav a[href="/about"]'))
check('body scroll locked', await page.evaluate(() => getComputedStyle(document.body).overflow === 'hidden'))
await page.keyboard.press('Escape')
await page.waitForTimeout(300)
check('Esc closes and returns focus to toggle', (await page.getAttribute(t, 'aria-expanded')) === 'false' && await page.evaluate(() => document.activeElement.matches('[data-nav-toggle]')))
check('scroll unlocked', await page.evaluate(() => getComputedStyle(document.body).overflow !== 'hidden'))
await page.click(t); await page.waitForTimeout(300)
await Promise.all([page.waitForURL('**/about'), page.click('#site-nav a[href="/about"]')])
check('link tap navigates', page.url().endsWith('/about'))
await page.goto(`${base}/hanzof`)
const bar = '[data-mobile-cta]'
check('CTA bar hidden at top', !(await page.$eval(bar, (b) => b.classList.contains('is-visible'))))
await page.evaluate(() => window.scrollTo(0, 1200)); await page.waitForTimeout(400)
check('CTA bar visible after hero', await page.$eval(bar, (b) => b.classList.contains('is-visible')))
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(400)
check('CTA bar hidden over footer', !(await page.$eval(bar, (b) => b.classList.contains('is-visible'))))
await page.goto(`${base}/contact`)
await page.evaluate(() => window.scrollTo(0, 900)); await page.waitForTimeout(400)
await page.focus('#cf-message'); await page.waitForTimeout(100)
check('CTA bar hidden while typing (keyboard open)', !(await page.$eval(bar, (b) => b.classList.contains('is-visible'))))
await browser.close()
process.exit(ok.every(Boolean) ? 0 : 1)
