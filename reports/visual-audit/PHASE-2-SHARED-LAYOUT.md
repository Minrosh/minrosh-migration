# Phase 2 — Shared layout remediation

Branch: `fix/shared-layout-remediation` (from `compliance/no-marn-update` @ `0941a76`).
Not committed. Not deployed. Production on port 3000 was not restarted.

Verified against a local dev server at `http://127.0.0.1:3118` with Playwright (headless Chromium). Measurements below were taken after React hydration, once `--site-header-chrome-height` was written on `:root`. Screenshots are viewport captures, not full-page stitches.

Representative routes: `/`, `/contact`, `/about`, `/skilled-migration`, `/destinations/australia`.
Widths: 320, 390×844, 768×1024, 1024×900, 1180, 1440×900.

## What changed

Shared causes, in `app/globals.css` and `app/home.css` only. Navigation destinations, analytics, CMS, footer copy, and the public AI flag were left as they are.

| Original defect | Shared cause | Change |
| --- | --- | --- |
| ISS-002. Mobile header 225–226px at 320/390/430 because the utility row wrapped. At 360/768 it was ~167px. | Social icons in `.site-header__utilities` wrapped under the logo row above 380px. Premium logo was 68px and the tagline stayed visible through 768px. Destination pages also kept `min-height: var(--header-height)` (88px) on the inner bar. | Utility row is nowrap. Header social icons are hidden at ≤920px (they remain in the footer). Premium mark is 44px at ≤920px and 48px from 921–1180px. Tagline is hidden through 1180px. Inner bar `min-height` is 0 below 920px. |
| ISS-002. Primary nav `scrollWidth` exceeded the capsule around 1024px, and the Home link then painted over the wordmark when overflow was made visible. | `.site-nav__group--main` used `flex: 1 1 0` with nowrap links. `justify-content: flex-end` pushed the overflow to the left, across the brand. | From 921–1180px the group aligns to the start, link size is 0.75rem with 5px inline padding, and the mark is 48px. |
| Inner pages at ≤767px placed the H1 under the fixed premium header. Contact H1 top was 81px while the header bottom was 133px. | A phone rule set `main` `padding-top: 10px` on the assumption the header became `position: static`. Premium CSS keeps that header `position: fixed`. | The 10px reset now applies only when the shell is not a premium header. Premium inner pages use `padding-top: var(--site-header-chrome-height)`. Homepage keeps `padding-top: 0` so the hero image still runs under the floating capsule. |
| Footer became a single column from 1100px down, and the newsletter `min-width: 320px` fought the grid. Tab labels were 0.62rem with ellipsis. | One shared footer grid rule, plus a newsletter min-width later in the file. | 721–1100px uses two columns. ≤720px stays one column. Newsletter `min-width` is 0 in both ranges. Tab labels are 0.75rem, nowrap, without ellipsis. |
| Sticky “Information Finder” chip and the floating dock sat on the tab bar. | `--site-mobile-tab-stack` was 4.25rem (68px). The rendered bar is 75px. | Stack is 4.75rem plus the safe-area inset. Floating tools sit 12px above that. The chip sits 14px above it. |

## Rendered results

### ISS-002 header height and nav overflow — pass

| Viewport | Header height after hydration | Notes |
| --- | --- | --- |
| 320 / 390 / 768, premium pages (`/`, `/contact`) | 125px | Was 225–226px at 320/390 and ~167px at 768. Utility row no longer wraps. |
| 390, `/destinations/australia` | 140px | Header is in normal flow (not the premium fixed capsule). H1 is not covered. |
| 1024, `/` and `/contact` | 94px | Home link starts 25px after the brand (329 vs 304). No horizontal overflow. |
| 1440, `/` and `/contact` | 104px | Six primary links visible. Tagline returns above 1180px. |

Destination `<details>` opened on `/contact` at 320, 390, and 768: 4 links, menu inside the viewport, `scrollWidth` equal to the viewport.

Popular Routes mega menu opened at 1024. The category navigator panel rendered over the hero. Destinations were unchanged.

The hamburger drawer stays hidden at ≤920px because the bottom tab bar is the primary mobile nav. That behaviour was already in the shell and was not removed.

Screenshots: `screenshots/phase2/mobile-390/home.png`, `screenshots/phase2/mobile-390/contact.png`, `screenshots/phase2/mobile-390/destinations__australia.png`, `screenshots/phase2/desktop-1024/home.png`, `screenshots/phase2/desktop-1024/home-mega.png`, `screenshots/phase2/desktop-1440/home.png`.

### Header / hero overlap — pass on the measured routes

At scroll position 0, after hydration:

- `/` at 390: header 125px, H1 top 296px, not covered. The Brisbane image still runs behind the capsule.
- `/contact` at 390: main padding-top 125px, H1 top 196px, not covered.
- `/about`, `/skilled-migration`, and `/destinations/australia` at 320, 390, 768, 1024, and 1440: H1 not covered. No page had `documentElement.scrollWidth` greater than the viewport.

### Footer — pass

| Width | `.site-footer__inner--rich` columns |
| --- | --- |
| 390 and 320 | 1 |
| 768 and 1024 | 2 |
| 1440 | 6 (brand, four link columns, newsletter) |

Screenshot: `screenshots/phase2/tablet-768/contact-footer.png`.

### Mobile tab bar and floating widgets — pass, with one limit

Tab bar `display` is `flex` at 320/390/768 and `none` at 1024/1440. Labels read Home, Info, Study, Contact on one line. Bar height 75px.

Rendered “Information Finder” chip on `/contact` after scroll, once the motion settled: bottom edge 754px, tab top 769px, no overlap.

The WhatsApp / AI dock does not mount in this local environment because `NEXT_PUBLIC_ENABLE_PUBLIC_AI_CHAT` is not `true`. The flag was not turned on. A `.floating-tools` node using the production class was mounted in the shell to test the shared offset: bottom edge 756px, tab top 769px, no overlap, `max-width` capped at 280px. That checks the CSS. It does not check the live chat panel.

## Not in this phase

These stayed open on purpose. They are not shared chrome.

- ISS-001 homepage deferred carousels.
- ISS-003 / ISS-006 homepage type and the trust-chip row. At 1024 the six hero trust items still truncate (`Public informati…`, `explanati…`). That component is the homepage hero, not the shell.
- ISS-004 doubled title suffix.
- ISS-005 repeated homepage CTAs.
- ISS-007 404 outside `SiteShell`.
- ISS-008 public footer counts. Layout spacing was adjusted. The counts themselves were not removed.

A hydration warning and blocked Google Analytics requests appeared in the local console. They were already present with the analytics snippet and were not introduced by these CSS edits. The red “1 Issue” badge in the mobile screenshots is the Next.js dev overlay, not part of the public UI.

## Files

- `app/globals.css`
- `app/home.css`
- This report and `reports/visual-audit/screenshots/phase2/`
