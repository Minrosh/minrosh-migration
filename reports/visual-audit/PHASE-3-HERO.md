# Phase 3 — Hero remediation

Branch: `fix/shared-layout-remediation`. Not committed. Not deployed. Not merged.

Measured on the local dev server, then confirmed with a production build and Playwright against `http://127.0.0.1:3119`.

## Confirmed issues resolved

| Issue | What was wrong | Result |
| --- | --- | --- |
| ISS-003 | Homepage H1 was about 36px at 390px and about 31px at 768px, because `clamp(1.65rem, 4vw, 2.85rem)` dipped in the middle. A short-laptop rule also forced the heading down to 1.5rem. | One scale: **36px at 390, 44px at 768, 56px at 1024 and 1440, 60px at 1920**. Playfair (`--font-display`) is the heading face. |
| ISS-006 | Six trust lines sat in a horizontal scroller with 10px clamped text. | All six lines stay in the page. They wrap in a 2-column grid, then 3 columns from 1100px. Body copy is 14px. `scrollWidth` does not exceed the bar. |
| ISS-005 (hero only) | Three equal hero buttons. | One primary button (Explore General Information), one secondary button (Education Course Enquiry), and the WhatsApp action as a tracked text link. The same `cta_click` / `whatsapp_clicked` events remain. |
| Viewport locks | `100svh`, `100vh`, and a 920px rule fought a later `height: auto` rule. Short screens could clip the heading. | The homepage hero is `height: auto`. It grows with the copy. Checked at 1024×600 and 390×640: heading and primary CTA sit below the header. |
| Header collision | Mobile lane padding used a `vw` clamp that did not follow the measured header. Inner-page tagline also overflowed the capsule when `home.css` loaded after the hide rule. | Lane padding is `var(--site-header-chrome-height) + 1.25rem`. Tagline is `display: none` below 920px. |
| Image crop | Homepage and inner heroes mixed `object-[70%_center]`, `object-bottom`, and `object-center`. | Shared crop is `center 42%` / `center 40%` so the river and skyline stay in frame. The source file is unchanged. |
| Guide strip | Fixed `h-[320px]` / `h-[350px]` with white type on a white fog. | Strips use `min-height` and grow with the title. Type is plum on the light fog. |
| Inner hero type | `.content-hero h1` fell to about 22px at 320px. | Floor is 30px on a phone, 36px from 768px, 40px from 1024px. |
| Hero buried under the jump menu | Service pages rendered the left rail before the hero. | The hero now sits after the breadcrumbs and before the rail. |
| ISS-010 | Booking column was an empty decorative panel. | It shows the Brisbane river photograph with a caption. |

## Files

- `components/home/home-hero-premium.jsx`
- `app/home.css`
- `app/globals.css`
- `components/content-page.js`
- `components/ui/page-hero-strip.jsx`
- `components/contact-calm-visual.jsx`
- `app/skilled-migration/page.js`
- `app/student-visa-australia/page.js`
- `app/australia-visa-processing-times-guide/page.js`
- `app/australia-visa-document-checklist-guide/page.js`
- `app/australia-visa-fees-and-costs-guide/page.js`

`components/site-shell.js` was inspected and left unchanged. Header offset from Phase 2 already clears inner-page heroes.

## Screenshots

Before: `reports/visual-audit/screenshots/phase3/before/{390,768,1024,1440}/`
After: `reports/visual-audit/screenshots/phase3/after/{390x844,768x1024,1024x900,1440x900,1920x1080,1024x600,390x640}/`

## Tests

- `npx vitest run`: **19 files, 102 tests, passed.**
- `ACKNOWLEDGE_SHARED_RISK=1 ACKNOWLEDGE_UNKNOWN_RISK=1 npm run build`: **compiled, 171 pages generated.** The sync gate needs those flags because this branch also contains the untracked audit reports. The hero JPEG was not rewritten.
- `e2e/mobile-layout-local.spec.mjs` against the built server: **77 tests.** The first parallel run had 8 navigation races (context destroyed while the server was busy). The same 8 passed when run one at a time. No remaining layout assertion failed.

Primary hero CTA `href` is `/assessment`. Clicking it on the dev server landed on `/assessment`.

## Remaining

- ISS-001 blank homepage carousels, ISS-004 doubled titles, and the repeated CTAs below the hero (finder, journey, final band) are outside this hero pass.
- ISS-009 still repeats the Information Finder introduction inside the tool.
- ISS-011 still emits a second H1 from `app/destinations/loading.js` in the streamed HTML.
- The homepage hero is tall on a phone because the heading, disclaimer, two actions, and six trust lines are all in the document. That is content height, not a viewport lock.
- The Next.js dev overlay in the local screenshots is not part of the production UI.
