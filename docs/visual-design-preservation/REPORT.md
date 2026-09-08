# Visual design preservation — No-MARN compliance branch

**Compared:** public production `https://minroshmigration.com.au` vs private staging `http://127.0.0.1:3001` (commit on `compliance/no-marn-update`).  
**Viewports:** 375 / 768 / 1440.  
**Production deploy:** not merged; `minrosh-next` process not restarted.

## Method note

- Public production HTML/CSS remains the visual baseline (CDN).
- Direct loopback `:3000` is **not** a reliable baseline: a compliance-branch `npm run build` in the shared repo overwrote `.next/standalone` static assets while the long-running production Node process still serves the prior build. CSS hashes were partially restored from CDN for forensics; **do not restart production** from this worktree without a deliberate cutover.
- Some Playwright/browser captures of deep production routes hit Cloudflare/client recovery UI (“This page could not be loaded”); successful home/skilled/404/header/footer captures and DOM metrics were used instead.

## Screenshot locations

| Set | Path |
| --- | --- |
| Production (public / successful) | `docs/visual-design-preservation/production-public/` |
| Staging | `docs/visual-design-preservation/staging/` |
| Home compare pairs | `docs/visual-design-preservation/*/compare-home__{375,768,1440}.png` |
| Earlier pass | `docs/staging-no-marn-review/final-pass/` |

Pages captured: home, header, footer, services (`/visa-services`), skilled visa info, education, contact, tools, booking, 404.

## Classification of visual differences

| Surface | Difference | Classification |
| --- | --- | --- |
| Header tagline | “Your Pathway…” → “Independent migration information and education support.” | **Required by compliance** |
| Header nav item | “Free Assessment” → “Information Finder” | **Required by compliance** |
| Header CTA | “Book consultation” → “Enquire” | **Required by compliance** |
| Header chrome height | Identical (104px @1440; 167px @768/375) | **Preserved** |
| Logo / pill nav / plum Enquire button | Same structure and styling | **Preserved** |
| Homepage hero photo / premium shell | Same `home-hero-premium` composition and Brisbane imagery treatment | **Preserved** (copy/CTAs only) |
| Homepage H1 + body + CTAs | Compliance wording; extra education CTA + short disclaimer | **Required by compliance**; length → **unavoidable content-length** impact on mobile first viewport |
| Hero feature strip titles | Reworded (e.g. Expert support → Public information) | **Required by compliance**; icons/layout preserved |
| Mobile tab bar labels | QUIZ/BOOK → INFO/STUDY/CONTACT | **Required by compliance** |
| Footer body + important notice | Longer compliance notice; “clients” → “enquirers”; Business link Free Assessment → Information Finder | **Required by compliance** / **content-length** |
| Footer layout, newsletter card, stats pills, Opera House watermark | Same components | **Preserved** |
| Services / education / tools / booking | Titles, intros, CTAs, tool inventory (personalised tools removed) | **Required by compliance** |
| Tools card grid | Fewer cards (disabled personalised tools) | **Required by compliance** — not a redesign |
| 404 | Same premium card + skyline SVG; copy + third education CTA | **Required by compliance** |
| Floating “Ask MinRosh” chat | Absent on staging when public AI chat disabled | **Required by compliance** |
| WhatsApp float | Present | **Preserved** |
| Gradients, plum/rose palette, Inter/brand type, rounded cards | Present on staging | **Preserved** |

## Responsive checks (staging)

Automated checks at 375 / 768 / 1440 for `/`, `/visa-services`, `/skilled-migration`, `/education-consultation`, `/contact`, `/tools`, `/book-information-session`, 404:

- horizontal overflow: **0**
- missing visible images: **0**
- nav wrap / h1 clip flags: **none**

## Regressions corrected

| Item | Fix |
| --- | --- |
| Mobile hero denser after compliance copy | Slightly tightened badge/body/CTA spacing on small screens only (`components/home/home-hero-premium.jsx`) so the CTA stack fits more cleanly without redesign |
| Residual “Pathway highlights” aria-label on hero trust strip | Renamed to “Information highlights and trust signals” |

No palette, logo, gradient, or layout-system redesign was introduced.

## Production confirmation

- `minrosh-next` left online on prior PID/uptime (not restarted for this visual pass).
- No merge / no production deploy.
- Staging only: rebuild/restart `minrosh-staging` after any follow-up commit on this pass.
