# TODO — owner confirmation needed

Everything here is either a **placeholder** on the live pages or a **claim removed** because it isn't in the confirmed-facts list. Confirm or supply the real content, and it can go back in.

Line references to removed claims point at the original files in commit `d8729eb` (view with `git show d8729eb:<file>`).

## Keys to add

| File | What's needed |
|---|---|
| `src/contact-form.js` | `WEB3FORMS_ACCESS_KEY`: free key from https://web3forms.com created with info@unbound3d.com. Until it is set, the form shows an error pointing people to email and WhatsApp. |

## Placeholders on the site

Every placeholder appears on the page as a yellow dashed `[placeholder: …]` and has a matching `<!-- TODO -->` comment. Run `grep -rn "TODO\|placeholder:" *.html` to list them.

| File | What's needed |
|---|---|
| `about.html` | One-line background: Cibhi Adhinath, Mahima Swetha, Vijay Raj |
| `about.html` | LinkedIn URLs for all four team members |
| `about.html` | Higher-resolution headshots (current crops from `public/work/part-2.png` are ~210 px) |
| `lynx350.html` (`#fleet`) | Lynx 320 specifications |
| `hanzof.html` | CNC materials and tolerances to list (HTML comment only) |
| `lynx350.html` | Whether PA-GF and PPA-CF belong in the materials list (HTML comment only) |
| `index.html` (hero) | Line drawing of a real Unbound3D part; current SVG is a placeholder bracket |
| `index.html` (What we make) | Material and process label for each of the 5 part photos (`public/work/work-1…5`) |
| `index.html` (Case studies) | Robotics chassis: part photo and material |
| `index.html` (Case studies) | Drone-team carbon-fibre frame: problem, what we did, result, photo, material, lead time |
| `index.html` (Case studies) | Defence part: problem, what we did, result, photo, material, lead time |
| `index.html` (Team preview) | Same bios and LinkedIn URLs as `about.html` |

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
