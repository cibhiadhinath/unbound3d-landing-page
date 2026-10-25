// Full-page screenshots (and optional homepage videos) of every page.
// Usage: node scripts/screenshots.mjs [--reduced] [--video] [--base=http://localhost:4173] [--out=screenshots]
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]))
const base = args.base || 'http://localhost:4173'
const reduced = Boolean(args.reduced)
const out = args.out || (reduced ? 'screenshots/reduced-motion' : 'screenshots')
const pages = (args.pages || 'index,hanzof,lynx350,about,contact,careers,procure').split(',')
const viewports = [
  { name: '375', width: 375, height: 812, isMobile: true, hasTouch: true },
  { name: '768', width: 768, height: 1024, hasTouch: true },
  { name: '1440', width: 1440, height: 900 },
]

mkdirSync(out, { recursive: true })
const browser = await chromium.launch()

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: 1,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  })
  for (const name of pages) {
    const page = await context.newPage()
    await page.goto(`${base}/${name === 'index' ? '' : name}`, { waitUntil: 'networkidle' })
    // Scroll through so lazy images and reveal-on-scroll content load, then return to top
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) }
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(reduced ? 100 : 2200)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    if (overflow > 0) console.warn(`⚠ horizontal overflow ${overflow}px: ${name} @ ${vp.name}`)
    await page.screenshot({ path: `${out}/${name}-${vp.name}.png`, fullPage: true })
    await page.close()
  }
  await context.close()
}

if (args.video) {
  for (const width of [375, 1440]) {
    const height = width === 375 ? 812 : 900
    const context = await browser.newContext({
      viewport: { width, height }, isMobile: width === 375, hasTouch: width === 375,
      recordVideo: { dir: `${out}/video-${width}`, size: { width, height } },
    })
    const page = await context.newPage()
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2500)
    const total = await page.evaluate(() => document.body.scrollHeight)
    for (let y = 0; y < total; y += 120) { await page.mouse.wheel(0, 120); await page.waitForTimeout(80) }
    await page.waitForTimeout(800)
    await context.close()
  }
}

await browser.close()
console.log(`Saved to ${out}/`)
