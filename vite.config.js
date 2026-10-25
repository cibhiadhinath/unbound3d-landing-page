import { resolve, basename } from 'path'
import { readFileSync, existsSync } from 'fs'
import { defineConfig } from 'vite'

const pages = ['index', 'hanzof', 'lynx350', 'about', 'contact', 'careers', 'procure']

// Which nav item is current for each page (matches data-nav in partials/header.html)
const navSection = { hanzof: 'manufacturing', procure: 'manufacturing', lynx350: 'lynx', about: 'about', careers: 'about', contact: 'contact' }

// Shared header/footer: pages contain <!-- @include header --> and <!-- @include footer -->,
// replaced at dev and build time so every page ships complete static HTML.
function partials() {
  const read = (name) => readFileSync(resolve(__dirname, 'partials', `${name}.html`), 'utf8')
  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const page = basename(ctx.filename, '.html')
        return html.replace(/<!-- @include (\w+) -->/g, (_, name) => {
          let out = read(name)
          const current = navSection[page]
          if (current) out = out.replace(`data-nav="${current}"`, `data-nav="${current}" aria-current="page"`)
          return out
        })
      },
    },
  }
}

// Mirror Firebase cleanUrls locally: /hanzof → hanzof.html
function cleanUrls() {
  const rewrite = (req, _res, next) => {
    const [path, query] = req.url.split('?')
    const name = path.replace(/^\//, '')
    if (name && !name.includes('.') && existsSync(resolve(__dirname, `${name}.html`))) {
      req.url = `/${name}.html${query ? `?${query}` : ''}`
    }
    next()
  }
  return {
    name: 'clean-urls',
    configureServer(server) { server.middlewares.use(rewrite) },
    configurePreviewServer(server) { server.middlewares.use(rewrite) },
  }
}

export default defineConfig({
  plugins: [partials(), cleanUrls()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, resolve(__dirname, `${p}.html`)])),
    },
  },
})
