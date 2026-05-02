# Stage 1 — Mobile repair notes (readability)

Manual verification targets (public marketing shell). Use device toolbar or responsive mode.

## Viewports

| Width | Typical device | Spot-check |
|------|----------------|------------|
| 320px | Small Android | Header utilities wrap; brand ellipsis; no horizontal scroll |
| 360px | Common Android | Same + drawer opens full-height scroll |
| 390px | iPhone 12–14 | Safe areas; sticky CTA clears content |
| 414px | iPhone Plus | Hub cluster cards stack; accordions tappable |
| 430px | iPhone Pro Max | Brand readable with ellipsis cap |
| 768px | Tablet portrait | Nav breakpoint near 921 — still drawer below 921 |

## Priority URLs

`/`, `/student-visa-australia`, `/education-consultation`, `/destinations/australia`, `/destinations/australia/student`, `/destinations/canada`, `/destinations/united-kingdom`, `/destinations/new-zealand`, `/tools`, `/tools/student-country-cost-planner`, `/tools/pr-pathway-explorer`, `/assessment`, `/contact`

## Automated screenshots

This repo does not commit per-viewport screenshots in CI. Capture locally after `npm run dev` or staging deploy:

1. Open DevTools → responsive mode.
2. Set width to each column above; height ≥ 720px.
3. For each priority URL: full-page capture optional; at minimum viewport + hero + footer.

## Post-deploy automated checks (Playwright)

After production is updated (`bash scripts/update-server.sh`), run against the public origin:

```bash
PLAYWRIGHT_LIVE_URL=https://minroshmigration.com.au npm run test:e2e:live-mobile
```

This asserts HTTP 200, no horizontal overflow (≤2px tolerance), `<main>` width within viewport, and that the first visible main section is not fully hidden under the sticky header (hero-under-header overlap allowed). **Skipped in default CI** unless `PLAYWRIGHT_LIVE_URL` is set.

## Fixes shipped in code (summary)

- **Horizontal overflow:** `portal-shell`, `content-page`, and article grid columns use `min-width: 0` + `overflow-x: clip` where appropriate.
- **Sticky header utilities:** Icon row wraps; destination picker flexes with `min-width: 0`; summary `max-width: 100%`; under **380px** width duplicate header social strip hidden (footer still has social).
- **Narrow brand:** `brand__name` ellipsis under **430px** to avoid collision with menu control.
- **Content density:** Tighter padding on official-resources, accordion summaries/bodies, tools hub cards at ≤768px; hero copy `overflow-wrap` for long words.
- **Home sections:** `ultra-snap-section` uses measured `--site-header-chrome-height` + `100dvh`; clip horizontal bleed.
- **Home eyebrow chip:** Wraps and centers on small screens (no layout redesign).
- **Hub cluster navigator:** Responsive padding, larger tap targets (`min-h-[48px]`, `touch-manipulation`), wrapping labels.

## Remaining concerns (watch on real devices)

- **Visa mega menu:** Intended desktop-only (≥921px); mobile relies on drawer links — confirm IA still clear.
- **Third-party / concierge:** AI concierge and floating widgets can overlap sticky CTAs on very short viewports — toggle panel and confirm taps still reach primary actions.
- **Tables / wide embeds:** Long unbroken strings in CMS-like sections may still need horizontal scroll inside a card; report specific URLs if seen.
