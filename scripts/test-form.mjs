// Contact form checks: validation, honeypot, unconfigured key, and success/error against a mocked Web3Forms endpoint.
// Usage: node scripts/test-form.mjs [--base=http://localhost:4173]
import { chromium } from 'playwright'

const base = (process.argv.find((a) => a.startsWith('--base=')) || '--base=http://localhost:4173').slice(7)
const browser = await chromium.launch()
const results = []
const check = (name, ok) => { results.push([name, ok]); console.log(`${ok ? '✓' : '✗'} ${name}`) }

async function open({ key, apiStatus } = {}) {
  const page = await browser.newPage()
  const requests = []
  if (key) {
    // Swap the placeholder key in the served bundle so the submit path runs
    await page.route(/\/assets\/contact-.*\.js$/, async (route) => {
      const res = await route.fetch()
      await route.fulfill({ response: res, body: (await res.text()).replace('YOUR_WEB3FORMS_ACCESS_KEY', key) })
    })
  }
  await page.route('https://api.web3forms.com/submit', async (route) => {
    requests.push(JSON.parse(route.request().postData()))
    await route.fulfill({ status: apiStatus, contentType: 'application/json', body: JSON.stringify({ success: apiStatus === 200 }) })
  })
  await page.goto(`${base}/contact?interest=lynx350`)
  return { page, requests }
}

const fill = async (page) => {
  await page.fill('#cf-name', 'Test Person')
  await page.fill('#cf-email', 'test@example.com')
  await page.fill('#cf-phone', '+91 98765 43210')
  await page.fill('#cf-company', 'Test Co')
  await page.fill('#cf-message', 'Need 20 PA-CF brackets.')
}

{
  const { page } = await open()
  check('interest preselected from ?interest=lynx350', (await page.inputValue('#cf-interest')) === 'lynx350')
  const url = page.url()
  await page.click('.contact-submit')
  check('empty submit shows name/email/message errors', await page.isVisible('#cf-name-error') && await page.isVisible('#cf-email-error') && await page.isVisible('#cf-message-error'))
  check('focus moves to first invalid field', await page.evaluate(() => document.activeElement.id) === 'cf-name')
  await page.fill('#cf-email', 'not-an-email'); await page.click('.contact-submit')
  check('invalid email rejected', await page.isVisible('#cf-email-error'))
  await fill(page); await page.click('.contact-submit')
  check('unconfigured key shows fallback error', (await page.textContent('[data-form-status]')).includes('isn’t connected'))
  check('no page reload', page.url() === url)
  await page.close()
}
{
  const { page, requests } = await open({ key: 'test-key', apiStatus: 200 })
  await fill(page); await page.click('.contact-submit')
  await page.waitForSelector('.form-status--success')
  const p = requests[0] || {}
  check('success state shown', true)
  check('payload has all fields + key, no honeypot', p.access_key === 'test-key' && p.name && p.email && p.phone && p.company && p.message && p.interest === 'Lynx 350' && !('botcheck' in p))
  check('form reset after success', (await page.inputValue('#cf-name')) === '')
  await page.close()
}
{
  const { page } = await open({ key: 'test-key', apiStatus: 500 })
  await fill(page); await page.click('.contact-submit')
  await page.waitForSelector('.form-status--error')
  check('server error shows error state and keeps input', (await page.inputValue('#cf-name')) === 'Test Person')
  await page.close()
}
{
  const { page, requests } = await open({ key: 'test-key', apiStatus: 200 })
  await fill(page); await page.evaluate(() => { document.getElementById('cf-website').value = 'spam' })
  await page.click('.contact-submit')
  await page.waitForSelector('.form-status--success')
  check('honeypot: fake success, nothing sent', requests.length === 0)
  await page.close()
}

await browser.close()
process.exit(results.every(([, ok]) => ok) ? 0 : 1)
