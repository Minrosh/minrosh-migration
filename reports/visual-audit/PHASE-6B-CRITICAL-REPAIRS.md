# Phase 6B — Critical repairs

Date: 24 October 2026  
Branch: `fix/phase-6b-critical-repairs` (uncommitted; not merged, not deployed)  
Release candidate: `/home/minrosh/releases/qa-phase-6b-20261024`  
Build ID: `gaz64opLAKHb9F-Lz7Xg4`  
Server used for every check below: `http://127.0.0.1:3121`  
Production (`:3000`, pid 1875) and staging (`:3001`, pid 1874) were left running.

Before measurements are from the Phase 6A candidate on `:3120` (`/home/minrosh/releases/qa-final-20261024`). After measurements are from this build.

## Verdict

The five Phase 6B acceptance checks passed on this isolated build. This phase stops here. It is not a production release decision. Issues outside these five priorities stay open in `reports/visual-audit/issues.csv`.

## Priority 1 — Header overlap

### Root cause

Premium pages that import `app/home.css` (`/contact`, `/australian-visas-official-sources`, and the other pages that share that stylesheet) kept `.site-header.site-header--backdrop` at `position: fixed`. A later phone rule in `app/globals.css` (`max-width: 768px`) set that same selector back to `position: static` and set premium `main` padding to `10px`. The `home.css` fixed rule won, and the `10px` padding also won. The heading then started inside the fixed header.

Before, on `:3120` at 390px:

| Route | Header | Header bottom | H1 top | Overlap |
| --- | --- | --- | --- | --- |
| `/contact` | fixed | 125px | 81px | 44px |
| `/australian-visas-official-sources` | fixed | 125px | 103px | 22px |

The same cover existed at 768px. It was absent at 1440px. Screenshot: `reports/visual-audit/screenshots/final-qa/390x900/contact.png`.

### Strategy

- Premium shells (`portal-shell--premium-header` and `portal-shell--premium-home`) keep a fixed header at every width.
- Non-home premium `main` padding stays `var(--site-header-chrome-height)`, which `SitePublicStickyHeader` writes from the measured header.
- Destination hubs are not premium shells. Their phone header stays in normal flow, with the existing 10px main padding.
- `html` scroll padding remains the measured chrome height plus 10px. The phone override that forced `scroll-padding-top: 12px` is gone.
- `overflow-x: clip` on `html` and `body` (where supported) keeps horizontal clipping without turning both elements into scroll containers. That pair was stopping fragment navigation.
- `ScrollRestorer` scrolls to a fragment when the URL has one. Otherwise it still resets to the top on a route change.
- Header clicks do not force scroll-to-top when the link itself contains a hash.

No route-specific padding was added.

### After

Measured on `:3121` at 320, 360, 390, 430, 768, 1024, 1440, and 1920. Phone widths were also measured at 640px height, and 768px at 600px height. Every sampled route had one visible H1, one `#main-content`, and a negative overlap (the heading starts below the header).

| Viewport | `/contact` | `/australian-visas-official-sources` |
| --- | --- | --- |
| 390×900 | fixed, header 125, H1 196, gap 71px | fixed, header 125, H1 197, gap 72px |
| 768×900 | fixed, header 125, H1 213, gap 88px | fixed, header 125, H1 212, gap 87px |
| 1440×900 | fixed, header 104, H1 205, gap 101px | fixed, header 104, H1 209, gap 105px |

`/skilled-migration` at 390px shows the breadcrumb immediately under the fixed header. The homepage hero still starts behind the header; its H1 is clear of the chrome. `/destinations/australia` stays `position: static` through 768px and `sticky` from 1024px.

`/contact#contact-enquiry-form` at 390×640 lands the form at `top: 135px`. The header bottom is 125px. Scroll padding is `135px`.

Screenshots: `reports/visual-audit/screenshots/phase6b/`.

## Priority 2 — Duplicate headings and landmarks

`app/destinations/loading.js`, `app/immigration-news/loading.js`, and `app/upload/loading.js` rendered `<main id="main-content">` and an `<h1>` while the real page was still streaming. The loading UI is now a `div` with `role="status"`, `aria-live="polite"`, and `aria-busy="true"`. The visible message is a paragraph with class `loading-screen__title`, styled with the previous heading rule. Admin loading was left unchanged.

After the rebuild, destination and news pages measured one visible H1 and one `#main-content`. The visual regression suite, which counts visible H1s, passed at 390, 768, and 1440.

## Priority 3 — Document titles

The root template is `%s | MinRosh Migration`. `buildMetadata` already removed a trailing brand suffix. It now also keeps a title that already starts with `MinRosh Migration |` as an absolute title, so the template cannot append the brand to the homepage sentence.

| Route | Before | After | Robots |
| --- | --- | --- | --- |
| `/newsletter/unsubscribe` | `Unsubscribe \| MinRosh Migration \| MinRosh Migration`, no site header | `Unsubscribe \| MinRosh Migration`, public shell, one H1 | `noindex, nofollow` |
| `/upload/[token]` | `Upload documents \| MinRosh Migration \| MinRosh Migration` | `Upload documents \| MinRosh Migration` | `noindex` and `noindex, nofollow` (both present) |
| `/` | single brand-first title | `MinRosh Migration \| General Migration Information & Education Support` | `index, follow` |

The unsubscribe page is inside `SiteShell` so it has the same header and one `#main-content`. Its copy is unchanged. No token canonical was added to upload URLs.

Titles longer than 60 characters are still open under ISS-004.

## Priority 4 — Assessment

`COMPLIANCE_FEATURE_FLAGS.PERSONALISED_NAVIGATOR` still returns false. `/assessment` shows the heading “Official Information Finder”. The flag was not turned on.

`scripts/ui-nav-audit.mjs` now waits for that heading. `UI_AUDIT_BASE_URL=http://127.0.0.1:3121` with admin credentials unset: `UI nav audit passed` (NAV_EXIT 0). Admin login was not attempted.

## Priority 5 — The 24 end-to-end failures

The Phase 6A log had 24 failures (7 landmark/title defects, 17 “execution context was destroyed” or a detached contact control).

The first rerun on this candidate, before the service-worker change, was worse: 49 failed, 114 passed. Traces for those failures show the page reaching the route, then the execution context dying while `page.evaluate` was measuring overflow. The network log for `/education-consultation` requests `/sw.js`. `public/sw.js` called `skipWaiting()` on install, and `components/pwa-register.jsx` reloaded the page on every `controllerchange`, including the first time a controller appeared. That reload also aborted later `page.goto` calls (`net::ERR_ABORTED` on `/popular-routes`). The same routes passed at other widths in the Phase 6A run, which matches a service worker taking control mid-suite rather than a stable layout bug.

The service worker now waits on first install. An already-controlled page can still skip waiting when an update is installed. The register component reloads only when a controller already existed before the change.

Controlled rerun after that fix, workers 1, `PLAYWRIGHT_LIVE_URL=http://127.0.0.1:3121`:

**163 passed, 0 failed (1.1m).**

Assertions were not removed or loosened. No tests were skipped.

## Tests and build

| Check | Result |
| --- | --- |
| Isolated `npm run build` | exit 0, build ID `gaz64opLAKHb9F-Lz7Xg4` |
| `npx vitest run` | 20 files, 108 tests passed |
| `npx playwright test --workers=1` against `:3121` | 163 passed |
| `npm run test:nav` against `:3121`, no admin password | passed |

The first font fetch during the isolated build failed once (`next/font` could not parse an empty Google Fonts response). The immediate retry compiled successfully. The in-place workspace build was not used.

## Issue register

Updated in `reports/visual-audit/issues.csv`:

| ID | Status after this phase |
| --- | --- |
| ISS-004 | partial — duplicate brand suffix fixed; titles over 60 characters remain |
| ISS-011 | verified fixed |
| ISS-022 | verified fixed |
| ISS-023 | verified fixed |

Still open, and not part of these five repairs: ISS-001, ISS-005, ISS-007, ISS-008, ISS-009, ISS-012, ISS-013, ISS-014, ISS-015, ISS-016, ISS-017, ISS-018, ISS-019, ISS-020. ISS-021 remains under human approval. ISS-002, ISS-003, ISS-006, and ISS-010 were not reopened; the skilled, contact, official-sources, and homepage screenshots do not show those earlier defects returning.

## Stop

No deploy. No merge. No commit. Production and staging processes were not restarted.
