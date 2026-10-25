// Lighthouse (mobile, default throttling) for a list of paths; writes JSON summary + HTML reports.
// Usage: CHROME_PATH=… node scripts/lighthouse.mjs --base=http://localhost:5060 --label=after [--paths=/,/hanzof]
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import { mkdirSync, writeFileSync } from 'fs'

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const base = args.base || 'http://localhost:5060'
const label = args.label || 'after'
const paths = (args.paths || '/,/hanzof,/lynx350,/about,/contact,/careers,/procure').split(',')
const out = `reports/lighthouse/${label}`
mkdirSync(out, { recursive: true })

const summary = {}
for (const path of paths) {
  let chrome
  for (let attempt = 0; !chrome; attempt++) {
    try { chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] }) } catch (e) { if (attempt >= 2) throw e }
  }
  const { lhr, report } = await lighthouse(`${base}${path}`, { port: chrome.port, output: 'html', logLevel: 'error' })
  await chrome.kill()
  const s = (k) => Math.round(lhr.categories[k].score * 100)
  summary[path] = {
    performance: s('performance'), accessibility: s('accessibility'), bestPractices: s('best-practices'), seo: s('seo'),
    lcp: lhr.audits['largest-contentful-paint'].displayValue, cls: lhr.audits['cumulative-layout-shift'].displayValue,
    tbt: lhr.audits['total-blocking-time'].displayValue,
  }
  const name = path === '/' ? 'index' : path.replace(/^\//, '').replace(/\W+/g, '-')
  writeFileSync(`${out}/${name}.html`, report)
  console.log(path.padEnd(16), JSON.stringify(summary[path]))
}
writeFileSync(`${out}/summary.json`, JSON.stringify(summary, null, 2))
