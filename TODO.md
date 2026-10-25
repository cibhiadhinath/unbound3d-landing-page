# TODO — owner confirmation needed

_Last updated after phase 9 (2026-10-25)._

Everything here is either a **placeholder** on the live pages or a **claim removed** because it isn't in the confirmed-facts list. Confirm or supply the real content, and it can go back in.

Line references to removed claims point at the original files in commit `d8729eb` (view with `git show d8729eb:<file>`).

## Keys to add

| File | What's needed |
|---|---|
| `src/contact-form.js` | `WEB3FORMS_ACCESS_KEY`: free key from https://web3forms.com created with info@unbound3d.com. Until it is set, the form shows an error pointing people to email and WhatsApp. |

## Placeholders on the site

Each visible placeholder appears on the page as a yellow dashed `[…]` label; most also have a matching `<!-- TODO -->` comment. Content still needed:

| Page | What's needed |
|---|---|
| Homepage hero | Line drawing (SVG) of a real Unbound3D part; the current bracket is a placeholder |
| Homepage, What we make | Material and process for each of the 5 part photos (`images/work-1…5`) |
| Homepage, Case studies | Robotics chassis: part photo and material |
| Homepage, Case studies | Drone-team carbon-fibre frame: problem, what we did, result, photo, material, lead time |
| Homepage, Case studies | Defence part: problem, what we did, result, photo, material, lead time |
| Homepage + About, Team | One-line background for Cibhi Adhinath, Mahima Swetha and Vijay Raj; LinkedIn URLs for all four |
| Homepage + About, Team | Higher-resolution headshots (current photos are ~210 px crops of `images/team-composite.png`) |
| Lynx 350 `#fleet` | Lynx 320 specifications |
| Manufacturing | CNC materials and tolerances to list (comment only) |
| Lynx 350 | Whether PA-GF and PPA-CF belong in the materials list (comment only) |

Every occurrence, generated from the source (`grep -n "TODO\|placeholder:\|\[material\]" *.html`):

| File:line | Type | Text |
|---|---|---|
| [index.html:101](index.html#L101) | Comment | replace placeholder bracket with a line drawing of a real Unbound3D part |
| [index.html:157](index.html#L157) | Comment | confirm material and process for each part photo |
| [index.html:164](index.html#L164) | Visible | material |
| [index.html:164](index.html#L164) | Visible | process |
| [index.html:172](index.html#L172) | Visible | material |
| [index.html:172](index.html#L172) | Visible | process |
| [index.html:180](index.html#L180) | Visible | material |
| [index.html:180](index.html#L180) | Visible | process |
| [index.html:188](index.html#L188) | Visible | material |
| [index.html:188](index.html#L188) | Visible | process |
| [index.html:196](index.html#L196) | Visible | material |
| [index.html:196](index.html#L196) | Visible | process |
| [index.html:245](index.html#L245) | Visible | placeholder: chassis part photo |
| [index.html:246](index.html#L246) | Comment | robotics chassis part photo |
| [index.html:250](index.html#L250) | Visible | material |
| [index.html:253](index.html#L253) | Comment | confirm chassis material |
| [index.html:267](index.html#L267) | Visible | placeholder: drone frame photo |
| [index.html:268](index.html#L268) | Comment | drone-team carbon-fibre frame case study (problem, what we did, result, photo, material, lead time) |
| [index.html:272](index.html#L272) | Visible | material |
| [index.html:273](index.html#L273) | Visible | lead time |
| [index.html:277](index.html#L277) | Visible | placeholder: problem |
| [index.html:279](index.html#L279) | Visible | placeholder: what we did |
| [index.html:281](index.html#L281) | Visible | placeholder: result |
| [index.html:286](index.html#L286) | Visible | placeholder: defence part photo |
| [index.html:287](index.html#L287) | Comment | defence part case study (problem, what we did, result, photo, material, lead time) |
| [index.html:291](index.html#L291) | Visible | material |
| [index.html:292](index.html#L292) | Visible | lead time |
| [index.html:296](index.html#L296) | Visible | placeholder: problem |
| [index.html:298](index.html#L298) | Visible | placeholder: what we did |
| [index.html:300](index.html#L300) | Visible | placeholder: result |
| [index.html:350](index.html#L350) | Visible | placeholder: LinkedIn URL |
| [index.html:351](index.html#L351) | Comment | Jeeva Ramasamy LinkedIn URL |
| [index.html:360](index.html#L360) | Visible | placeholder: one-line background |
| [index.html:361](index.html#L361) | Comment | Cibhi Adhinath one-line background and LinkedIn URL |
| [index.html:362](index.html#L362) | Visible | placeholder: LinkedIn URL |
| [index.html:371](index.html#L371) | Visible | placeholder: one-line background |
| [index.html:372](index.html#L372) | Comment | Mahima Swetha one-line background and LinkedIn URL |
| [index.html:373](index.html#L373) | Visible | placeholder: LinkedIn URL |
| [index.html:382](index.html#L382) | Visible | placeholder: one-line background |
| [index.html:383](index.html#L383) | Comment | Vijay Raj one-line background and LinkedIn URL |
| [index.html:384](index.html#L384) | Visible | placeholder: LinkedIn URL |
| [hanzof.html:119](hanzof.html#L119) | Comment | confirm CNC materials and tolerances to list here |
| [lynx350.html:198](lynx350.html#L198) | Comment | confirm whether PA-GF and PPA-CF should be listed (removed pending confirmation) |
| [lynx350.html:261](lynx350.html#L261) | Visible | placeholder: Lynx 320 specifications |
| [lynx350.html:262](lynx350.html#L262) | Comment | confirm Lynx 320 specs (previously listed: 320×320×300 mm, 60 °C chamber, 150 °C bed, CoreXY) |
| [about.html:69](about.html#L69) | Visible | placeholder: LinkedIn URL |
| [about.html:70](about.html#L70) | Comment | Jeeva Ramasamy LinkedIn URL |
| [about.html:79](about.html#L79) | Visible | placeholder: one-line background |
| [about.html:80](about.html#L80) | Comment | Cibhi Adhinath one-line background |
| [about.html:81](about.html#L81) | Visible | placeholder: LinkedIn URL |
| [about.html:82](about.html#L82) | Comment | Cibhi Adhinath LinkedIn URL |
| [about.html:91](about.html#L91) | Visible | placeholder: one-line background |
| [about.html:92](about.html#L92) | Comment | Mahima Swetha one-line background |
| [about.html:93](about.html#L93) | Visible | placeholder: LinkedIn URL |
| [about.html:94](about.html#L94) | Comment | Mahima Swetha LinkedIn URL |
| [about.html:103](about.html#L103) | Visible | placeholder: one-line background |
| [about.html:104](about.html#L104) | Comment | Vijay Raj one-line background |
| [about.html:105](about.html#L105) | Visible | placeholder: LinkedIn URL |
| [about.html:106](about.html#L106) | Comment | Vijay Raj LinkedIn URL |

## Removed claims awaiting confirmation

### Homepage (`index.html`)
| Line | Removed | Note |
|---|---|---|
| 8, 10 | "Metal Additive Manufacturing" in title and meta description | Replaced with the confirmed positioning |

### Platform (`platform.html`)
| Line | Removed | Note |
|---|---|---|
| 48 | "The aerospace-grade platform for precision manufacturing" | |
| 69 | CNC material list: Aluminium 6061/7075, Stainless 304, Brass, POM, Polycarbonate | Confirm which CNC materials you offer |
| 74 | SLA and SLS printing; Nylon PA6, Tough Resin, PA-GF | Only FDM in PA-CF / PPS-CF / ASA kept |
| 78–79 | Sheet metal fabrication (Al 5052, stainless, CRS, galvanised) | |
| 88–89 | Custom moulds and tooling | |
| 92–93 | Welding and assemblies, "certified welding" | |
| 112 | "Your IP is encrypted and protected" | |
| 118 | "AI-driven pricing estimates with DfM analysis" | Replaced with the 6-business-hour engineer-reviewed quote |
| 124 | "real-time telemetry and quality monitoring" | |
| 131 | "digital inspection reports and material certificates" | |
| 144 | Real-time tracking from the factory floor | |
| 151 | "Every part comes with a digital passport" | |
| 156–157 | AI quality monitoring / computer-vision anomaly detection | |
| 162–163 | Secure digital inventory, encrypted storage, job streaming | |
| 178 | "Join thousands of engineers and designers who trust Hanzof" | |

### Hanzof (`hanzof.html`)
| Line | Removed | Note |
|---|---|---|
| 68 | "Digital Chain of Custody" (tracking, QC transparency) | |
| 73–74 | "Vetted Network": partners audited and connected to the platform | |
| 120 | SLA printing | |
| 122–123 | Sheet metal fabrication; welding and fabrication | |
| 130–133 | Materials: PLA, ABS, PETG, Nylon, PC; aluminium, steel, stainless; resins | Replaced with PA-CF, PPS-CF, ASA |

### Lynx 320 (`lynx-320.html`)
| Line | Removed | Note |
|---|---|---|
| 162–163 | "Cloud Native": receives encrypted print jobs from the Unbound3D cloud | |
| 167–168 | "Streams over 50 sensor data points per second" | |
| 172 | Remote verification via integrated cameras | |
| 220 | Connectivity: "Cloud + Local" | |
| 266–276 | "The Future Pipeline": Unbound Workhorse (500 mm, 100 °C chamber, 200 °C bed) and Next-Gen IDEX | |

### Lynx 350 (`lynx350.html`)
| Line | Removed | Note |
|---|---|---|
| 443, 477, 563 | 350 °C hotend | Replaced with the confirmed 450 °C nozzle |
| 447, 477, 565 | 70 °C chamber ("active forced convection") | Replaced with the confirmed 80 °C active chamber |
| 485, 583 | "Calibration in under 60 seconds" | Probe kept; timing removed |
| 590 | "5″ touchscreen & HD camera" | |
| 512 | PEEK/ULTEM "under controlled conditions" | Now: "Exploring PEEK/ULTEM capability — HT variant in development." |

### Contact (`contact.html`)
| Line | Removed | Note |
|---|---|---|
| 119 | "Makura.world Partnership" interest option | |

### Removed in phase 2 (page merges)
| Source | Removed | Note |
|---|---|---|
| `hanzof.html` (old) | "If something fails, Hanzof fixes it." | Unverifiable promise |
| `hanzof.html` (old) | "We manage feasibility, vetted partners, and QA/QC"; "Managed supplier network" (homepage) | No confirmed supplier-network claim |
| `lynx-320.html` | Specs: 320×320×300 mm, chamber up to 60 °C, bed up to 150 °C, CoreXY; "warp-free PA-CF/PA-GF"; "days, not weeks" | Fleet section now shows a placeholder |
| `lynx-320.html` | "Lynx-Dry" dryer section and `public/lynx-dry.png` | Only "Twin Dry" is confirmed; is Lynx-Dry a separate product? |
| `lynx350.html` | Materials PA-GF and PPA-CF; use case "Aerospace components" | Kept PA-CF, PPS-CF, ASA |
| `procure.html` | "vetted manufacturing network", "Network-Driven Intelligence", "rigorous inspection protocols", "single point of liability", "review within 24–48 hours" | Procure now uses the contact form ("reply within 1 business day") |
| `story.html` | Whole page (Makura reference, "precision, automation, and accountability") | 301 → `/about` |
| `makura.html` | Whole page ("India's First Creator-Manufacturing Platform", royalties, eco claims) | 301 → `/` |
| `team.html` | "Engineers, designers, and strategists building the future of manufacturing" | Replaced by `about.html` |

### Other notes
| Item | Note |
|---|---|
| `Dockerfile` | Not touched. It copies a root `logo.png` that never existed, so it was already broken. Firebase Hosting is the live host; delete the Dockerfile or fix it if you use Cloud Run. |
| `fetch_*.cjs`, `take_screenshot.cjs`, `update_links.py` | Older one-off scripts in the repo root, left untouched; safe to delete. |
| Image sizes | Source photos are at most 1024 px wide, so the 1600 px variant isn't generated (no upscaling). Supply larger originals in `images/` and rerun `python3 scripts/build-images.py`. |
