# Phase 8B — Technical remediation

Anonymous callers no longer receive enquiry, newsletter, or update counts from `GET /api/stats`. Private upload URLs no longer publish the homepage canonical or homepage social title. Pages that passed the same FAQ into both the page and `ContentPage` now emit one `FAQPage` block.

This is not a production release. Nothing was merged or deployed. Production pid 1875 and staging pid 1874 are still the processes started on 12 October 2026.

## Candidate

| Item | Value |
| --- | --- |
| Baseline commit | `00a8c2d9fd487929300965201679323ecbad8902` |
| These edits | Uncommitted on `fix/phase-6b-critical-repairs` |
| Isolated build | `oqvmMUfgT8h2JYKD91EWB` |
| Build directory | `/home/minrosh/releases/qa-phase-8b-20261025` |
| Preview | `http://127.0.0.1:3128` |

The preview is the final build. It was started with a clean environment and no production secrets.

## Security decision for `/api/stats`

`enquiryCount`, `newsletterCount`, and `updatesCount` are operational telemetry. They are not appropriate for an anonymous response. The public footer no longer renders them, and no other public component calls this route. Published news articles remain available on their own pages, so hiding the count does not remove public content.

| Caller | Result |
| --- | --- |
| Anonymous `GET /api/stats` | HTTP 401 `AUTH_UNAUTHORIZED`. The body has no counts. `getFooterStats()` is not called |
| Admin session on `GET /api/stats` | HTTP 200 with the three counts. Covered by a unit test that stubs `verifyAdminRequest` |
| `GET /api/admin/stats` | Unchanged. It already requires an admin session and remains the dashboard report |

The route stays rate limited at 120 requests per minute per IP. Live responses carry `Cache-Control: private, no-cache, max-age=0, must-revalidate` and `CDN-Cache-Control: no-store`. The route also sets `private, no-store`; middleware supplies the cache headers seen on the wire.

`robots.txt` no longer has `Allow: /api/stats`. `Disallow: /api` now covers it. `Allow: /api/reviews` stays, because that route returns public Google review fields when configured and does not return enquiry or newsletter counts.

Before, the previous candidate returned:

`{"ok":true,"data":{"enquiryCount":3,"newsletterCount":4,"updatesCount":7}}`

After, an anonymous request to the new build returned HTTP 401 and the body did not contain those fields.

Public information exposure of those three counts is resolved on this candidate. The live production process was not changed, so the production deployment still has the old route until a later approved cutover.

## Upload metadata

`app/upload/layout.js` now owns the metadata for `/upload/[token]`. The canonical and Open Graph URL are `https://minroshmigration.com.au/upload`. The title is `Private document link | MinRosh Migration`. Robots are `noindex, nofollow`. The token is not in the title, description, canonical, or Open Graph URL.

An unrecognised token still renders the existing public 404 component through `app/upload/not-found.js`, so the 404 visual shell is unchanged. The upload form and the disabled-portal response are unchanged. `GET /api/upload/[token]` still returns 410 while the public migration portal is off, and that body does not echo the token.

`/upload` remains absent from the sitemap (85 URLs) and remains disallowed in `robots.txt`.

Before, `/upload/example-token` used the homepage canonical `https://minroshmigration.com.au` and the homepage Open Graph title. After, both point at `https://minroshmigration.com.au/upload` and the private title.

The Next.js flight payload still contains the requested path segment `upload/example-token`. That is the route the browser asked for. It is not copied into social metadata or structured data. When a Google Analytics measurement id is configured, `components/google-analytics.jsx` records that path as `/upload` rather than the token. The isolated build has no measurement id, so the script is not emitted there. The upload form page does not mount the marketing shell.

## FAQPage

`ContentPage` already emits `FAQPage` when it receives an `faq` array. These pages also emitted the same object themselves. The extra page-level copy was removed. The visible FAQ content is still passed in.

| Route | FAQPage blocks before | After |
| --- | --- | --- |
| `/skilled-migration` | 2 | 1 |
| `/student-visa-australia` | 2 | 1 |
| `/partner-visa-australia` | 2 | 1 |
| `/employer-sponsored-visas` | 2 | 1 |
| `/visitor-visas` | 2 | 1 |
| `/migration-sri-lanka-to-australia` | 2 | 1 |
| `/education-consultation` | 2 | 1 |
| `/destinations/australia/skilled` | 2 | 1 |

Guide pages that emit one page-level `FAQPage` and do not pass `faq` into `ContentPage` were left as they are. Breadcrumb, Organization, and LocalBusiness blocks were not removed.

## Files changed

- `app/api/stats/route.js`
- `app/robots.js`
- `app/upload/layout.js` (new)
- `app/upload/not-found.js` (new)
- `app/upload/[token]/page.js`
- `app/skilled-migration/page.js`
- `app/student-visa-australia/page.js`
- `app/partner-visa-australia/page.js`
- `app/employer-sponsored-visas/page.js`
- `app/visitor-visas/page.js`
- `app/migration-sri-lanka-to-australia/page.js`
- `app/education-consultation/page.js`
- `app/destinations/[slug]/[section]/page.js`
- `components/google-analytics.jsx`
- `tests/public-stats-route.test.mjs` (new)
- `tests/upload-metadata-and-faq-schema.test.mjs` (new)
- `tests/robots-site-environment.test.mjs`

`reports/indexability-audit-stage-0.md` was regenerated by the indexability command against the candidate. Homepage hero image path, header, and footer disclosure copy were not edited.

## Tests

| Check | Result |
| --- | --- |
| `npm run test:unit` | 22 files, 115 tests passed |
| `npm run test:e2e` against `http://127.0.0.1:3128` | 163 passed, including visual regression at 390, 768, and 1440 |
| `npm run test:nav` | Passed. Admin sidebar checks were skipped because no admin password was supplied |
| `npm run routes:verify` | `/`, `/sitemap.xml`, and `/robots.txt` returned HTTP 200 |
| `npm run audit:indexability` | Exit 0. 85 URLs, no heuristic attention rows. `robots.txt` no longer allows `/api/stats` |
| `npm run build` | Isolated build `oqvmMUfgT8h2JYKD91EWB` |

The contact unit test still prints `contact_supabase_dual_write_failed_pre_email`. That is the expected failure path in that test.

Homepage HTML on the new build still includes `hero-brisbane-river-cbd-hd.jpg` and does not include `site-footer__stats`. Assessment, contact, booking, and news routes returned HTTP 200 with their existing H1s. Sitemap length stayed 85.

## Still open

These Phase 8A items were outside this change:

- External mail, calendar, and payment delivery remain unverified.
- Complaints wording, referral wording, and the rest of the approval register still need a person.
- The Cloudflare beacon still requires the dashboard change. CSP was not widened.
- The 404 document title still uses the homepage title.
- This remediation is not itself a Git commit, so the build ID is not yet a Git revision.
- Production still serves the previous release.

Phase 8B stops here for review.
