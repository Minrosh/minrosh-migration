# Phase 4 batch 1 — core migration services and student visa pages

Local only. Not deployed. Branch remains `fix/shared-layout-remediation`.

Checked on `http://127.0.0.1:3118` at 390×844 and 1440×900 after network idle.

## Routes opened

| Route | HTTP | Document title after the fix | Canonical |
| --- | --- | --- | --- |
| `/skilled-migration` | 200 | Skilled Migration Australia 189/190/491 \| MinRosh Migration | `https://minroshmigration.com.au/skilled-migration` |
| `/student-visa-australia` | 200 | Student Visa Australia – Subclass 500 \| MinRosh Migration | `https://minroshmigration.com.au/student-visa-australia` |
| `/student-visa-australia-requirements` | 200 | Student Visa Requirements (2026) \| MinRosh Migration | `https://minroshmigration.com.au/student-visa-australia-requirements` |
| `/student-migration-over-25-australia` | 200 | Student Migration for Applicants Over 25 \| MinRosh Migration | `https://minroshmigration.com.au/student-migration-over-25-australia` |
| `/partner-visa-australia` | 200 | Partner Visa Australia 820/801 & 309/100 \| MinRosh Migration | `https://minroshmigration.com.au/partner-visa-australia` |
| `/employer-sponsored-visas` | 200 | Employer-Sponsored Visas Australia \| MinRosh Migration | `https://minroshmigration.com.au/employer-sponsored-visas` |
| `/visitor-visas` | 200 | Visitor Visas Australia \| MinRosh Migration | `https://minroshmigration.com.au/visitor-visas` |
| `/visa-services` | 200 | Information and Education Support \| MinRosh Migration | `https://minroshmigration.com.au/visa-services` |

Each page had one `h1`. None overflowed horizontally. No visa sentences were rewritten.

## Defects fixed in this batch

### Blank band above the breadcrumb — ISS-022, verified fixed

Before, on `/employer-sponsored-visas` at 390×844, the header was `position: static` and 140px tall, and `main` still had `padding-top: 88px`. The article started at 228px. The same offset existed at 1440×900 because these pages do not load `app/home.css`, so the premium header stayed `sticky` while `.portal-main--immersive` reserved another header-height.

After:

- At 390×844 the header is static, main padding is 10px, and the breadcrumb sits 10px under the header. The heading is 30px and is not covered.
- At 1440×900 the header is fixed at 103px, main padding matches that 103px, and the breadcrumb starts at the header’s bottom edge. The heading is 40px. `covered` was false on all eight routes.
- `/contact` was spot-checked at 1440×900 so the shared header change did not hide that heading. Header bottom 104px, heading top 205px.

### Doubled brand in the title — ISS-004 suffix, verified fixed

`/visa-services` rendered `Information and Education Support | MinRosh Migration | MinRosh Migration` before the change. `buildMetadata()` now stores the title without a trailing brand suffix. The root template still adds `| MinRosh Migration` once. Open Graph and Twitter titles keep a single suffix.

Rechecked titles: all eight routes above, `/disclaimer` (`General Information Disclaimer | MinRosh Migration`), and the homepage default (`MinRosh Migration | General Migration Information & Education Support`).

Titles that are long because the page name itself is long were not shortened. That remainder stays open for the news and destination batches.

### `/visa-services` missing from the sitemap — ISS-013, still open

`/visa-services` is now in `STATIC_SITEMAP_ROUTES`. The local sitemap response was HTTP 200 and contained `/visa-services`. It did not contain `/global-pathways`, so ISS-013 is not closed.

## Files

- `app/globals.css` — fixed premium header from 769px up; phone header stays in normal flow with 10px main padding.
- `lib/seo.js` — `titleWithoutBrandSuffix()` used by `buildMetadata()`.
- `lib/public-indexable-routes.js` — `/visa-services` added, priority 0.75.
- `tests/seo-title-and-sitemap.test.mjs` — suffix stripping and sitemap membership.
- `reports/visual-audit/issues.csv` — `status` and `notes` columns. ISS-022 added.

## Screenshots

Before: `reports/visual-audit/screenshots/phase4/batch1/before/390x844/` and `.../1440x900/`.

After: `reports/visual-audit/screenshots/phase4/batch1/after/390x844/` and `.../1440x900/`.

The after desktop shot of `/employer-sponsored-visas` shows the heading, the Brisbane hero photograph, and the official-source link in the first viewport. The after phone shot of `/visa-services` shows the heading and the hero photograph under the breadcrumb.

## Checks

- Unit tests: `npx vitest run` — 20 files, 105 tests passed. The contact dual-write test still prints `contact_supabase_dual_write_failed_pre_email` on stderr; that assertion expects the failure.
- Mobile Contact tab on `/employer-sponsored-visas` opened `/contact`.
- First Tab on the homepage focused “Skip to content”.
- The Next.js dev overlay (“1 Issue”) is visible in the local before and after phone screenshots. The console on `/employer-sponsored-visas` reported a hydration mismatch and blocked Google analytics requests. That overlay is not part of the production page and was not changed. Playwright’s full mobile layout suite was not re-run in this batch.

## Outstanding before batch 2

- ISS-001 homepage carousels.
- ISS-005 repeated CTAs below the homepage hero.
- ISS-007 and ISS-020 404 shell and illustration.
- ISS-008 footer operating counts.
- ISS-009 Information Finder repeated introduction.
- ISS-011 loading-shell H1 on destination and news routes.
- ISS-012 short destination descriptions.
- ISS-013 `/global-pathways` still outside the sitemap.
- ISS-014 education consultation form weight.
- ISS-015 pathway explorer disclaimer and link styling.
- ISS-016 Cloudflare beacon CSP. Not changed.
- ISS-017 footer density.
- ISS-018 “POPULAR ROUTES” label casing.
- ISS-019 news card metadata.
- ISS-021 compliance wording. Not changed.
- Title length above 60 characters on news and some destination pages.
- Dev-only hydration warning. Not reproduced against a production build.

Batch 2 (education consultation and post-study pathways) has not been started.
