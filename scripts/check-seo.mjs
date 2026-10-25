// Static SEO checks on dist/*.html: unique title/description, canonical, OG/Twitter, one H1, alt text, valid JSON-LD.
import { readFileSync, readdirSync, existsSync } from 'fs'

const files = readdirSync('dist').filter((f) => f.endsWith('.html'))
const seen = { title: new Map(), desc: new Map() }
let problems = 0
const fail = (f, msg) => { problems++; console.log(`✗ ${f}: ${msg}`) }

for (const f of files) {
  const html = readFileSync(`dist/${f}`, 'utf8')
  const get = (re) => (html.match(re) || [])[1]
  const title = get(/<title>([^<]*)<\/title>/)
  const desc = get(/<meta name="description" content="([^"]*)"/)
  for (const [k, v] of [['title', title], ['desc', desc]]) {
    if (!v) fail(f, `missing ${k}`)
    else if (seen[k].has(v)) fail(f, `duplicate ${k} with ${seen[k].get(v)}`)
    else seen[k].set(v, f)
  }
  if (!/<link rel="canonical" href="https:\/\/unbound3d\.com[^"]*">/.test(html)) fail(f, 'missing canonical')
  for (const p of ['og:title', 'og:description', 'og:url', 'og:image', 'twitter:card', 'twitter:image']) {
    if (!html.includes(`"${p}"`)) fail(f, `missing ${p}`)
  }
  const og = get(/property="og:image" content="https:\/\/unbound3d\.com([^"]+)"/)
  if (og && !existsSync(`dist${og}`)) fail(f, `og:image file missing: ${og}`)
  const h1 = (html.match(/<h1[\s>]/g) || []).length
  if (h1 !== 1) fail(f, `${h1} <h1> elements`)
  const imgs = html.match(/<img\b[^>]*>/g) || []
  imgs.filter((t) => !/\salt="/.test(t)).forEach((t) => fail(f, `img without alt: ${t.slice(0, 80)}`))
  imgs.filter((t) => !/\swidth="\d+"/.test(t) || !/\sheight="\d+"/.test(t)).forEach((t) => fail(f, `img without width/height: ${t.slice(0, 80)}`))
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const j = JSON.parse(m[1]); console.log(`  ${f}: JSON-LD ${j['@type'] || j['@graph'].map((g) => g['@type']).join(' + ')}`) } catch (e) { fail(f, `invalid JSON-LD: ${e.message}`) }
  }
}
for (const f of ['robots.txt', 'sitemap.xml']) if (!existsSync(`dist/${f}`)) fail(f, 'missing')
console.log(problems ? `${problems} problem(s)` : `✓ SEO checks passed for ${files.length} pages`)
process.exit(problems ? 1 : 0)
