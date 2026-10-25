// Frame-rate check under 4× CPU throttling (DevTools-equivalent) during the hero print and a full-page scroll.
// Usage: node scripts/check-fps.mjs [--base=http://localhost:5080]
import { chromium } from 'playwright'
const base = (process.argv.find((a) => a.startsWith('--base=')) || '--base=http://localhost:5080').slice(7)
const browser = await chromium.launch({ args: ['--disable-gpu-vsync=false'] })
const results = []

for (const vp of [{ width: 1440, height: 900 }, { width: 375, height: 812, isMobile: true, hasTouch: true }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch })
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await page.addInitScript(() => {
    window.__frames = []
    const loop = (t) => { window.__frames.push(t); requestAnimationFrame(loop) }
    requestAnimationFrame(loop)
  })
  await page.goto(base + '/', { waitUntil: 'load' })
  await page.waitForTimeout(2500) // hero print sequence
  const total = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < total; y += 100) { await page.mouse.wheel(0, 100); await page.waitForTimeout(16) }
  await page.waitForTimeout(500)
  const stats = await page.evaluate(() => {
    const f = window.__frames, d = f.slice(1).map((t, i) => t - f[i]).filter((x) => x < 1000)
    d.sort((a, b) => a - b)
    const avg = d.reduce((a, b) => a + b, 0) / d.length
    return { frames: d.length, avgFps: +(1000 / avg).toFixed(1), p95ms: +d[Math.floor(d.length * 0.95)].toFixed(1), longFrames: d.filter((x) => x > 50).length }
  })
  results.push({ viewport: vp.width, ...stats })
  console.log(`${vp.width}px @ 4× CPU:`, JSON.stringify(stats))
  await ctx.close()
}
await browser.close()
