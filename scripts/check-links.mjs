// Crawl internal pages, check every internal link/asset returns 200, and old URLs 301 to the right place.
// Usage: node scripts/check-links.mjs [--base=http://localhost:5080]   (Firebase hosting emulator, so redirects apply)
const base = (process.argv.find((a) => a.startsWith('--base=')) || '--base=http://localhost:5080').slice(7)
const queue = ['/', '/procure'] // procure is reached via procure.unbound3d.com, not the nav
const pages = new Set()
const checked = new Map()
let problems = 0

const check = async (url) => {
  if (checked.has(url)) return checked.get(url)
  const res = await fetch(base + url, { redirect: 'manual' })
  checked.set(url, res.status)
  return res.status
}

while (queue.length) {
  const path = queue.shift()
  if (pages.has(path)) continue
  pages.add(path)
  const res = await fetch(base + path)
  const html = await res.text()
  const refs = [...html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g), ...html.matchAll(/srcset="([^"]+)"/g)]
    .flatMap((m) => m[0].startsWith('srcset') ? m[1].split(',').map((s) => s.trim().split(' ')[0]) : [m[1]])
    .filter((u) => u.startsWith('/') && !u.startsWith('//'))
  for (const ref of new Set(refs)) {
    const url = ref.split('?')[0]
    const status = await check(url)
    if (status !== 200) { problems++; console.log(`✗ ${status} ${url} (linked from ${path})`) }
    if (!url.includes('.') && !pages.has(url)) queue.push(url)
  }
}
console.log(`Crawled ${pages.size} pages, checked ${checked.size} internal URLs`)

const redirects = {
  '/platform': '/hanzof', '/platform.html': '/hanzof', '/lynx-320': '/lynx350#fleet', '/lynx-320.html': '/lynx350#fleet',
  '/team': '/about', '/team.html': '/about', '/story': '/about', '/story.html': '/about', '/makura': '/', '/makura.html': '/',
}
for (const [from, to] of Object.entries(redirects)) {
  const res = await fetch(base + from, { redirect: 'manual' })
  const loc = res.headers.get('location')
  const ok = res.status === 301 && loc === to
  if (!ok) problems++
  console.log(`${ok ? '✓' : '✗'} ${from} → ${res.status} ${loc}`)
}
// External links that the site depends on
const ext = await fetch('https://hanzof.com', { redirect: 'follow' }).then((r) => r.status).catch((e) => e.message)
console.log(`${ext === 200 ? '✓' : '?'} https://hanzof.com → ${ext}`)
console.log(problems ? `${problems} problem(s)` : '✓ No broken internal links or redirects')
process.exit(problems ? 1 : 0)
