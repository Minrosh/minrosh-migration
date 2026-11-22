# Phase 00 — Public Route Inventory (verified, read-only)

Audit date: 2026-11-22. Sources: `app/**/page.js` (excl. admin), `lib/public-indexable-routes.js`, `app/sitemap.js`, `data/destinations.json` + `DESTINATION_SECTION_IDS`, `data/news.json`, `next.config.mjs` redirects, `middleware.js`, live `https://minroshmigration.com.au/sitemap.xml` (85 locs).

## Verdict

- Homepage `/` is present in page.js, STATIC_SITEMAP_ROUTES, generated sitemap, and live sitemap.
- Repo expected generated sitemap: **84** URLs; live sitemap: **85** URLs.
- Main drift: live books as `/book-information-session` (308 from `/book-consultation`); repo only has `/book-consultation`. Live indexes `/visa-services` + `/global-pathways` which exist in repo but are **omitted** from STATIC_SITEMAP_ROUTES. Repo news adds `/immigration-news/migration-sri-lanka-australia-2026` (live page 200, not in live sitemap).

## Counts

- Public `page.js` files (excl. admin): 49 (45 concrete + 4 dynamic templates)
- STATIC_SITEMAP_ROUTES: 40
- Destination hubs: 4 | sections: 32 (4×8)
- News article slugs in `data/news.json`: 8
- Generated sitemap (static+hubs+sections+news): 84
- Live sitemap locs: 85
- Repo-servable public paths (expanded): 90 (includes intentional noindex utilities)

## Sitemap generation logic (`app/sitemap.js`)

1. `buildPublicSitemapRoutes(destinations)` = STATIC_SITEMAP_ROUTES + `/destinations/{slug}` + `/destinations/{slug}/{section}` for each `DESTINATION_SECTION_IDS`.
2. Plus `getNewsData()` (disk `data/news.json`) → `/immigration-news/{slug}`.
3. `revalidate = 300`. Does **not** auto-include every `page.js` (e.g. `/visa-services`, `/global-pathways`, utilities).

## Redirects (`next.config.mjs`)

| Source | Destination | Notes |
|---|---|---|
| `www.minroshmigration.com.au/:path*` | apex same path | permanent; also middleware 308 |
| `/migration-from-sri-lanka` | `/migration-sri-lanka-to-australia` | permanent (live 308 confirmed) |
| `/partner-visa` | `/partner-visa-australia` | permanent (live 308 confirmed) |
| `/visitor-visa` | `/visitor-visas` | permanent (live 308 confirmed) |

**Not in repo config but observed live:** `/book-consultation` → **308** `/book-information-session` (platform/CDN or older deploy redirect; no `book-information-session` string in repo).

## Middleware special routes

- Apex redirect: `www.` → apex 308
- Maintenance mode (prod env): serves 503 HTML for most public paths; bypasses `/maintenance`, `/maintenance.html`, `/favicon.ico`, `/admin*`, selected `/api/admin|cron|inngest|webhooks`
- Admin session gate for `/admin` and `/api/admin` (login/health/verify-admin-email exempt)
- CSP + request-id on matched HTML routes; matcher excludes static assets
- Public utilities intentionally noindex via page metadata: `/maintenance`, `/newsletter/unsubscribe`, `/thank-you`, `/upload/[token]`
- `robots.js` disallow: `/admin`, `/api`, `/upload` (allow `/`, `/api/reviews`, `/api/stats`)

## Live-only URLs (in live sitemap, not in repo-generated sitemap)

- `/book-information-session` — **no page.js in repo**; live canonical book URL
- `/global-pathways` — page exists (`app/global-pathways/page.js`) but missing from STATIC_SITEMAP_ROUTES
- `/visa-services` — page exists (`app/visa-services/page.js`) but missing from STATIC_SITEMAP_ROUTES

## Repo-generated-only URLs (in generated sitemap, not in live)

- `/book-consultation` — repo/static path; live 308s this to `/book-information-session`
- `/immigration-news/migration-sri-lanka-australia-2026` — in `data/news.json`; live article returns 200 but omitted from live sitemap

## Live-only vs repo filesystem (no matching route)

- `/book-information-session`

## Repo pages intentionally outside sitemap (utilities / noindex)

- `/maintenance` → `app/maintenance/page.js` (utility)
- `/newsletter/unsubscribe` → `app/newsletter/unsubscribe/page.js` (utility)
- `/thank-you` → `app/thank-you/page.js` (conversion)
- `/upload/[token]` → `app/upload/[token]/page.js` (utility; robots disallow `/upload`)

## Full inventory

| Path | Type | STATIC | Generated | Live | page.js |
|---|---|:-:|:-:|:-:|---|
| `/` | hub | Y | Y | Y | `app/page.js` |
| `/about` | hub | Y | Y | Y | `app/about/page.js` |
| `/assessment` | conversion | Y | Y | Y | `app/assessment/page.js` |
| `/australia-visa-document-checklist-guide` | guide | Y | Y | Y | `app/australia-visa-document-checklist-guide/page.js` |
| `/australia-visa-fees-and-costs-guide` | guide | Y | Y | Y | `app/australia-visa-fees-and-costs-guide/page.js` |
| `/australia-visa-processing-times-guide` | guide | Y | Y | Y | `app/australia-visa-processing-times-guide/page.js` |
| `/australia-vs-canada-migration-guide` | guide | Y | Y | Y | `app/australia-vs-canada-migration-guide/page.js` |
| `/australian-visas-official-sources` | guide | Y | Y | Y | `app/australian-visas-official-sources/page.js` |
| `/book-consultation` | conversion | Y | Y | — | `app/book-consultation/page.js` |
| `/book-information-session` | conversion | — | — | Y | `—(none in repo; live alias)` |
| `/code-of-conduct` | legal | Y | Y | Y | `app/code-of-conduct/page.js` |
| `/complaints` | legal | Y | Y | Y | `app/complaints/page.js` |
| `/contact` | conversion | Y | Y | Y | `app/contact/page.js` |
| `/destinations/australia` | destination | — | Y | Y | `app/destinations/[slug]/page.js` |
| `/destinations/australia/about` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/australia/contact` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/australia/education` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/australia/faq` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/australia/partner` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/australia/skilled` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/australia/student` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/australia/updates` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/canada` | destination | — | Y | Y | `app/destinations/[slug]/page.js` |
| `/destinations/canada/about` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/canada/contact` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/canada/education` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/canada/faq` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/canada/partner` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/canada/skilled` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/canada/student` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/canada/updates` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/new-zealand` | destination | — | Y | Y | `app/destinations/[slug]/page.js` |
| `/destinations/new-zealand/about` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/new-zealand/contact` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/new-zealand/education` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/new-zealand/faq` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/new-zealand/partner` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/new-zealand/skilled` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/new-zealand/student` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/new-zealand/updates` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/united-kingdom` | destination | — | Y | Y | `app/destinations/[slug]/page.js` |
| `/destinations/united-kingdom/about` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/united-kingdom/contact` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/united-kingdom/education` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/united-kingdom/faq` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/united-kingdom/partner` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/united-kingdom/skilled` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/united-kingdom/student` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/destinations/united-kingdom/updates` | destination | — | Y | Y | `app/destinations/[slug]/[section]/page.js` |
| `/disclaimer` | legal | Y | Y | Y | `app/disclaimer/page.js` |
| `/education-consultation` | conversion | Y | Y | Y | `app/education-consultation/page.js` |
| `/employer-sponsored-visas` | service | Y | Y | Y | `app/employer-sponsored-visas/page.js` |
| `/faq` | hub | Y | Y | Y | `app/faq/page.js` |
| `/global-pathways` | service | — | — | Y | `app/global-pathways/page.js` |
| `/immigration-lawyer-australia-vs-registered-migration-agent-guide` | guide | Y | Y | Y | `app/immigration-lawyer-australia-vs-registered-migration-agent-guide/page.js` |
| `/immigration-news` | news | Y | Y | Y | `app/immigration-news/page.js` |
| `/immigration-news/canada-border-system-2026` | news | — | Y | Y | `app/immigration-news/[slug]/page.js` |
| `/immigration-news/canada-integrity-fraud-prevention-2026` | news | — | Y | Y | `app/immigration-news/[slug]/page.js` |
| `/immigration-news/migration-sri-lanka-australia-2026` | news | — | Y | — | `app/immigration-news/[slug]/page.js` |
| `/immigration-news/nz-visa-fraud-partnerships-2025` | news | — | Y | Y | `app/immigration-news/[slug]/page.js` |
| `/immigration-news/partner-visa-australia-2026-guide` | news | — | Y | Y | `app/immigration-news/[slug]/page.js` |
| `/immigration-news/skilled-migration-australia-points-2026` | news | — | Y | Y | `app/immigration-news/[slug]/page.js` |
| `/immigration-news/student-visa-australia-requirements-2026` | news | — | Y | Y | `app/immigration-news/[slug]/page.js` |
| `/immigration-news/uk-eta-travel-permission-2025` | news | — | Y | Y | `app/immigration-news/[slug]/page.js` |
| `/maintenance` | utility | — | — | — | `app/maintenance/page.js` |
| `/meet-the-team` | hub | Y | Y | Y | `app/meet-the-team/page.js` |
| `/migration-for-healthcare-workers-australia` | service | Y | Y | Y | `app/migration-for-healthcare-workers-australia/page.js` |
| `/migration-sri-lanka-to-australia` | service | Y | Y | Y | `app/migration-sri-lanka-to-australia/page.js` |
| `/newsletter/unsubscribe` | utility | — | — | — | `app/newsletter/unsubscribe/page.js` |
| `/partner-visa-309-100-guide` | guide | Y | Y | Y | `app/partner-visa-309-100-guide/page.js` |
| `/partner-visa-820-801-guide` | guide | Y | Y | Y | `app/partner-visa-820-801-guide/page.js` |
| `/partner-visa-australia` | service | Y | Y | Y | `app/partner-visa-australia/page.js` |
| `/partner-visa-australia-guide` | guide | Y | Y | Y | `app/partner-visa-australia-guide/page.js` |
| `/popular-routes` | service | Y | Y | Y | `app/popular-routes/page.js` |
| `/privacy-policy` | legal | Y | Y | Y | `app/privacy-policy/page.js` |
| `/referral-program` | conversion | Y | Y | Y | `app/referral-program/page.js` |
| `/skilled-migration` | service | Y | Y | Y | `app/skilled-migration/page.js` |
| `/skilled-migration-australia-points-guide` | guide | Y | Y | Y | `app/skilled-migration-australia-points-guide/page.js` |
| `/student-migration-over-25-australia` | service | Y | Y | Y | `app/student-migration-over-25-australia/page.js` |
| `/student-visa-australia` | service | Y | Y | Y | `app/student-visa-australia/page.js` |
| `/student-visa-australia-requirements` | guide | Y | Y | Y | `app/student-visa-australia-requirements/page.js` |
| `/terms-of-use` | legal | Y | Y | Y | `app/terms-of-use/page.js` |
| `/thank-you` | conversion | — | — | — | `app/thank-you/page.js` |
| `/tools` | tool | Y | Y | Y | `app/tools/page.js` |
| `/tools/pr-pathway-explorer` | tool | Y | Y | Y | `app/tools/pr-pathway-explorer/page.js` |
| `/tools/student-country-cost-planner` | tool | Y | Y | Y | `app/tools/student-country-cost-planner/page.js` |
| `/updates` | hub | Y | Y | Y | `app/updates/page.js` |
| `/upload/[token]` | utility | — | — | — | `app/upload/[token]/page.js` |
| `/visa-refusal-help-australia-and-aat-migration-appeal-guide` | guide | Y | Y | Y | `app/visa-refusal-help-australia-and-aat-migration-appeal-guide/page.js` |
| `/visa-services` | service | — | — | Y | `app/visa-services/page.js` |
| `/visitor-visas` | service | Y | Y | Y | `app/visitor-visas/page.js` |

## Destination matrix

Slugs from `data/destinations.json`: australia, new-zealand, canada, united-kingdom
Sections from `lib/destination-nav.js` DESTINATION_SECTION_IDS: skilled, partner, student, education, updates, faq, about, contact
All 4×8 section content keys present in `data/destination-sections/*.json`.

## News slugs (`data/news.json`)

- `migration-sri-lanka-australia-2026` → live sitemap: N
- `partner-visa-australia-2026-guide` → live sitemap: Y
- `student-visa-australia-requirements-2026` → live sitemap: Y
- `skilled-migration-australia-points-2026` → live sitemap: Y
- `canada-integrity-fraud-prevention-2026` → live sitemap: Y
- `canada-border-system-2026` → live sitemap: Y
- `uk-eta-travel-permission-2025` → live sitemap: Y
- `nz-visa-fraud-partnerships-2025` → live sitemap: Y

## Notes: duplicates / aliases

- **Book CTA alias (live):** `/book-consultation` ⇄ `/book-information-session` (live prefers latter; repo only implements former).
- **Legacy path aliases (repo+live):** `/migration-from-sri-lanka`, `/partner-visa`, `/visitor-visa` → canonical SEO paths.
- **www → apex:** duplicate host normalized in next.config + middleware.
- **Destination hub vs site service pages:** e.g. `/destinations/australia/partner` coexists with `/partner-visa-australia` (intentional parallel surfaces, not redirects).
- **News hub vs articles:** `/immigration-news` + per-slug articles.
- **STATIC omission:** `/visa-services` and `/global-pathways` are first-class `page.js` routes linked in-product but not in STATIC_SITEMAP_ROUTES; live already sitemaps them.
