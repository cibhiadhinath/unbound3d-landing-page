# Unbound3D site overhaul — report

**Scope:** phases 1–9 from the brief, one commit per phase on `main` (not pushed or deployed).

| Phase | Commit |
|---|---|
| 1 Remove inaccurate claims | `871dbea` |
| 2 Story and information architecture | `ba1ebd9` |
| 3 Homepage rebuild | `cbc06db` |
| 4 Contact page | `f682ac6` |
| 5 Mobile-first polish | `093e91e` |
| 6 Motion design | `bce4e5b` |
| 7 Performance | `5b8d8be` |
| 8 SEO and sharing | `e3214bc` |
| 9 Verification, report | this commit |

Everything awaiting your input is in [`TODO.md`](TODO.md): the Web3Forms key, every placeholder with its file and line, and every removed claim.

## Lighthouse (mobile)

Lighthouse 12.8, default mobile emulation (Moto G Power, slow 4G, 4× CPU). Both builds were served by the **Firebase Hosting emulator** with the same compression, so the comparison is like for like. Scores are Performance / Accessibility / Best Practices / SEO. Full HTML reports are in `reports/lighthouse/before/` and `reports/lighthouse/after/`. Only `summary.json` is committed; the HTML reports and `screenshots/` (about 33 MB) stay on disk and are gitignored.

| Page | Before | LCP | CLS | After | LCP | CLS |
|---|---|---|---|---|---|---|
| Home | 92 / 97 / 96 / 100 | 2.1 s | 0.14 | 100 / 100 / 100 / 100 | 1.9 s | 0 |
| Manufacturing (was Hanzof) | 99 / 98 / 96 / 90 | 1.7 s | 0 | 100 / 100 / 100 / 100 | 1.6 s | 0 |
| Platform → merged into Manufacturing | 99 / 97 / 96 / 90 | 1.7 s | 0 | 301 redirect | — | — |
| Lynx 350 | 94 / 92 / 96 / 91 | 3.0 s | 0 | 100 / 100 / 100 / 100 | 1.7 s | 0 |
| Lynx 320 → folded into Lynx 350 #fleet | 84 / 98 / 96 / 91 | 4.5 s | 0 | 301 redirect | — | — |
| About (was Team) | 99 / 91 / 96 / 90 | 1.8 s | 0 | 100 / 100 / 100 / 100 | 1.7 s | 0 |
| Contact | 99 / 92 / 96 / 90 | 1.7 s | 0 | 100 / 100 / 100 / 100 | 1.6 s | 0 |
| Careers | 99 / 97 / 96 / 90 | 1.7 s | 0 | 100 / 100 / 100 / 100 | 1.6 s | 0 |
| Procure | 95 / 92 / 96 / 90 | 2.8 s | 0.01 | 100 / 100 / 100 / 100 | 1.6 s | 0 |

Targets were Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO 100, CLS <0.05. Every page now scores **100/100/100/100 with CLS 0**. Before: the homepage CLS was 0.14, SEO was 90–91 on most pages, and Lynx 320 Performance was 84. Live-network scores will vary slightly; rerun against production after deploying.

## Changes per page

**Every page**
- One shared header, footer and head (`partials/`, injected at build by a small Vite plugin in `vite.config.js`).
- Nav is **Manufacturing · Lynx 350 · About · Contact**, with an accessible hamburger below 768px.
- Footer carries the legal name, address, GSTIN, phone, WhatsApp, email, LinkedIn and "ISO 9001:2015 certified". Careers is linked from the footer only.
- Tagline is "Manufacturing made right." everywhere. Naming is consistently Lynx 350, Lynx 320 and Twin Dry. Emoji are replaced by an inline SVG icon sprite.
- Sticky mobile [WhatsApp] [Get quote] bar, a unique title, description and canonical, Open Graph/Twitter tags with a page-specific 1200×630 image, and exactly one H1.

**`index.html` (Home)**: rebuilt in the brief's order:
- Print-animation hero with the quote and WhatsApp CTAs.
- Trust strip.
- Part-photo grid labelled with material and process (placeholders).
- 3-step process with an animated connector.
- 3 case studies: robotics chassis kept, 2 TODO cards.
- Pinned Lynx 350 showpiece.
- Team preview with real cropped headshots.
- Final CTA.
- The Three.js globe and "Back to Globe" are removed, and the H1 is no longer a link.
- JSON-LD Organization + LocalBusiness.

**`hanzof.html` (Manufacturing)**:
- Platform and Hanzof content merged: processes (3D printing in PA-CF/PPS-CF/ASA, CNC, composites), Hanzof ordering with the 6-business-hour quote, use cases and credentials.
- Unverifiable claims removed (AI monitoring, digital passport, telemetry, SLS/SLA, sheet metal, welding, "thousands", supplier network).
- JSON-LD Service.

**`lynx350.html`**:
- Every spec is set to the confirmed values (450 °C nozzle, 80 °C active chamber, 150 °C bed per your answer, 650 mm/s, 40,000 mm/s², 350³ mm, CoreXY, triple Z, eddy-current probe, Twin Dry up to 110 °C).
- PEEK/ULTEM line reads "Exploring PEEK/ULTEM capability — HT variant in development."
- Spec tables collapse into stacked rows below 600px.
- New `#fleet` "Our production fleet" section with the Lynx 320 (specs are a placeholder).
- JSON-LD Product.

**`about.html`** (new, replaces `team.html`): positioning, credentials and the 4-person team (photo, role, background, LinkedIn slot).

**`contact.html`**:
- Prominent Hanzof CAD-upload card.
- Real form (name, email, phone, company, interest, message) posting to Web3Forms with fetch: client-side validation, honeypot, inline success/error, no reload.
- `?interest=` preselects the interest.
- Large WhatsApp button and "We reply within 1 business day."
- The Makura option is removed.

**`careers.html`**: simplified onto the shared layout.

**`procure.html`** (kept for `procure.unbound3d.com`):
- Rebuilt on the shared layout.
- Unverifiable network claims removed.
- Its mailto form is replaced by links to the contact form (`?interest=procurement`) and WhatsApp.

**Removed, with 301s in `firebase.json`:** `platform` → `/hanzof`, `lynx-320` → `/lynx350#fleet`, `team` and `story` → `/about`, `makura` → `/`. The two old index backups were also deleted.

## Motion

Built with CSS plus IntersectionObserver only. **GSAP wasn't needed**: the Lynx pin uses `position: sticky` plus a rAF-throttled scroll handler. The motion code is roughly 1 KB gzipped, against a 40 KB budget.

- **Hero:** stepped `clip-path` reveal over 1.6 s in 24 layers, a glowing nozzle line, then a 2% settle and the CTAs fade up with an 80 ms stagger. It plays once per session (sessionStorage in try/catch). The H1 renders immediately and is not the LCP blocker.
- **Reveals:** headings and cards only, 600 ms, at 15% in view, once. Grids stagger by 60 ms with a 400 ms cap.
- **Components:** the trust strip fades in once, the process connector draws and its numbers light in sequence, part labels slide up on desktop hover and are always visible on touch, buttons nudge their arrow 3px and press to 0.98, the header goes solid with blur after the hero, mobile menu links stagger by 40 ms, form errors shake once by 4px, and pages cross-fade with a 200 ms view transition.
- **Lynx showpiece:** at 1024px and up it pins for about 150vh, with 3 callouts and leader lines appearing one at a time. Mobile and reduced motion get a stacked list instead.
- **Gating:** start states only apply under `.js-motion`, which is set in `<head>` when JS runs and reduced motion is off. A 3 s failsafe removes the class if `motion.js` never loads. With `prefers-reduced-motion: reduce`, everything is in its final state instantly.

## Verification

| Check | Result | How to rerun |
|---|---|---|
| Screenshots, 7 pages × 375/768/1440 | Reviewed; no overflow, overlap or clipping | `node scripts/screenshots.mjs --base=http://localhost:5080` |
| Homepage videos at 375 and 1440 | `screenshots/homepage-375.webm`, `screenshots/homepage-1440.webm` | add `--video` |
| Reduced-motion screenshots | `screenshots/reduced-motion/`; all content visible in final state, no pinning | add `--reduced` |
| Mobile audit at 360/375px | No horizontal scroll, all tap targets ≥44×44, body text ≥16px | `node scripts/audit-mobile.mjs` |
| Mobile menu + sticky bar | 10/10: aria-expanded, Esc closes and returns focus, link tap closes, scroll lock; bar hidden at top, over the footer and while typing | `node scripts/test-nav.mjs` |
| Contact form (mocked Web3Forms) | 11/11: validation, focus, honeypot, unconfigured-key fallback, success/error states, payload, no reload | `node scripts/test-form.mjs` |
| Internal links and redirects | 7 pages, 74 internal URLs all 200; 10 old URLs 301 to the right targets | `node scripts/check-links.mjs` |
| SEO | Unique titles/descriptions, canonicals, OG/Twitter, one H1, alt + dimensions on every image, valid JSON-LD, sitemap and robots | `node scripts/check-seo.mjs` |
| Frame rate at 4× CPU throttling | ~60 fps, p95 frame 16.7 ms, 0 long frames at 1440 and 375 (headless Chromium; confirm in DevTools on a real device) | `node scripts/check-fps.mjs` |
| Grep audit | 0 visible occurrences of: Metal Additive, thousands, Power to/To Create, Back to Globe, Makura, Lynx-350, 70°C, 350°C Hotend, the removed taglines, or emoji. Remaining `lynx-350`/`lynx-320`/`makura` matches are image file names and redirect sources only. The phone number is unchanged (+91 75581 50570), as you decided. | see commit message |

Serve the build like production with `npx vite build && firebase emulators:start --only hosting --project demo-u3d` (port 5080; Chrome blocks 5060).

## Contact form: what you need to add

1. Create a free access key at https://web3forms.com using **info@unbound3d.com**.
2. Paste it into `WEB3FORMS_ACCESS_KEY` in `src/contact-form.js`.
3. Rebuild and deploy.

Until then, the form validates input and then shows a message pointing people to email and WhatsApp, so no message is silently lost.

## Deviations from the brief, and why

- **Build step kept.** The site already used Vite, and Firebase serves `dist/`. Pages are still plain HTML, CSS and vanilla JS. Vite also gives real 301 redirects, the shared header/footer and CSS inlining.
- **Mobile-first CSS landed in phase 2, not phase 5.** Every page was being rebuilt in phase 2, so I wrote the token-based, mobile-first stylesheet once instead of styling twice. Phase 5 added the sticky bar, audits and fixes.
- **The Lynx showpiece lives on the homepage** as the "Lynx teaser" section, because both briefs describe the same 3-spec block.
- **No 1600px images**, because the source photos are at most 1024px. Sizes generated: 480, 960 and source width.
- **Fonts are self-hosted** (Inter + Space Grotesk, one variable woff2 each, latin subset) instead of Google Fonts. This removed the render-blocking third-party CSS and the font-swap layout shift.
- **procure.html is kept** for the procurement subdomain, per your answer.
- **Not deployed.** Run `npx vite build && firebase deploy --only hosting --project unbound3d-593a7` when ready.

## Tooling added

- `scripts/screenshots.mjs`, `audit-mobile.mjs`, `test-nav.mjs`, `test-form.mjs`, `check-links.mjs`, `check-seo.mjs`, `check-fps.mjs`, `lighthouse.mjs` (Playwright and Lighthouse dev dependencies).
- `scripts/build-images.py` (responsive AVIF/WebP from `images/`) and `scripts/og-images.py` (Open Graph images; Pillow required).

## Update: Apple-style redesign (2026-10-25)

The whole site was reworked into a classic, Apple-inspired style:
- **Light and airy:** white and #f5f5f7 sections, with black reserved for product moments (Lynx 350 hero, showpiece, Twin Dry).
- **Type:** Inter for all text, tight tracking, centred headlines and short copy. Space Grotesk is kept for the wordmark only.
- **Buttons and links:** blue pill buttons and "Learn more ›" text links.
- **Homepage, in order:**
  - Hero with the print animation on a soft stage, then a credentials line.
  - **"Everything you need to make hardware" tiles:** Manufacturing, Hanzof 6-hour quotes and **Procurement** (previously not linked anywhere).
  - Part gallery with the industries line, then the 3-step process.
  - Black Lynx 350 showpiece, then the case study and team.
  - Final CTA.
- **Lynx 350:** centred black product hero with key specs, an Apple-style tech specs table, and a dark Twin Dry section.
- **Procurement** is now in the footer and on the Manufacturing page.

Lighthouse mobile after the redesign (Firebase emulator, Playwright Chromium):

| Page | Perf / A11y / BP / SEO | LCP | CLS |
|---|---|---|---|
| / | 100 / 100 / 100 / 100 | 1.8 s | 0 |

Note: run `scripts/lighthouse.mjs` with `CHROME_PATH` pointing at Playwright's Chromium. The Chrome-for-Testing build returned NO_FCP intermittently.
