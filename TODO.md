# TODO — owner confirmation needed

_Last updated after phase 9 (2026-10-25)._

Everything here is either a **placeholder** on the live pages or a **claim removed** because it isn't in the confirmed-facts list. Confirm or supply the real content, and it can go back in.

Line references to removed claims point at the original files in commit `d8729eb` (view with `git show d8729eb:<file>`).

## Keys to add

| File | What's needed |
|---|---|
| `src/contact-form.js` | `WEB3FORMS_ACCESS_KEY`: free key from https://web3forms.com created with info@unbound3d.com. Until it is set, the form shows an error pointing people to email and WhatsApp. |

## Content to add (nothing is shown on the site until you supply it)

The site no longer shows any visible placeholders. Anything missing is simply left out; send the content and it goes back in.

| Where | What to send | What shows now |
|---|---|---|
| Homepage, What we make | Material and process for each of the 5 part photos | Photos without captions |
| Homepage, Case study | 1–2 more case studies (e.g. drone-team carbon-fibre frame, defence part): problem, what we did, result, material, lead time, photo | Only the robotics chassis case |
| Homepage, Case study | Robotics chassis: part photo and material | Text-only card |
| Homepage + About, Team | LinkedIn URLs for the team (optional) | No LinkedIn links |
| Lynx 350 `#fleet` | Lynx 320 specifications | Short description only |
| Homepage hero | Line drawing (SVG) of a real Unbound3D part | Generic bracket illustration |
| Manufacturing | CNC materials and tolerances | Generic CNC description |
| Lynx 350 | Whether PA-GF and PPA-CF belong in the materials list | PA-CF, PPS-CF, ASA |

Notes left in the source as HTML comments:

| File:line | Note |
|---|---|
| [index.html:101](index.html#L101) | replace placeholder bracket with a line drawing of a real Unbound3D part |
| [hanzof.html:119](hanzof.html#L119) | confirm CNC materials and tolerances to list here |
| [lynx350.html:198](lynx350.html#L198) | confirm whether PA-GF and PPA-CF should be listed (removed pending confirmation) |
| [lynx350.html:261](lynx350.html#L261) | confirm Lynx 320 specs (previously listed: 320×320×300 mm, 60 °C chamber, 150 °C bed, CoreXY) |

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
