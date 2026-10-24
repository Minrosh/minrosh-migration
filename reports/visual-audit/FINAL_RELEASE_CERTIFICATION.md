# Final release certification — Phase 6E

**Recommendation: NO-GO**

The Phase 6A–6D candidate was retested on an isolated server. Public layout, automated tests, sitemap parity, and mobile performance meet the technical bar. Production release is not approved. Regulatory sign-off is still open, essential form journeys were not completed in an isolated staging sink, and the binary is not tied to a single Git commit.

No deploy, merge, or production process change was made.

## Provenance

| Item | Value |
| --- | --- |
| Branch | `fix/phase-6b-critical-repairs` |
| HEAD commit | `0941a7643a72c4e6fc6cd00379c83aad8e29feda` (`ops: harden compliance release after production cutover`) |
| Working tree | Dirty. `git diff --stat` reports 49 tracked files changed (680 insertions, 732 deletions) against that commit. Phase 6B–6D fixes are in this working tree, not in HEAD. |
| Untracked certification inputs | `reports/visual-audit/`, `tests/seo-title-and-sitemap.test.mjs`, `e2e/public-visual-regression.spec.mjs`, `reports/seo-meta-audit.md` |
| Release directory | `/home/minrosh/releases/qa-phase-6d-20261024` |
| Certification build | `ylEu7v9rhXF8KidAH3F2T`, produced 24 October 2026 with `SITE_ENVIRONMENT=production`, `RELEASE_TARGET=production`, `SKIP_ENV_VALIDATION=1`, and no `.env` |
| Server under test | `http://127.0.0.1:3123`, clean process environment, `NODE_ENV=production` |
| Application source match | Release source matches the workspace except the SEO unit test, which was copied in before this build. |
| Production (not under test) | PM2 app `minrosh-next`, pid 1875, port 3000, cwd `/home/minrosh/releases/1455a66a319e29fe968ca6d74e086cdebaf3c049-20260908/.next/standalone` |
| Staging (not under test) | PM2 app `minrosh-staging`, pid 1874, port 3001. It was not used, because it may share live credentials. |

Deploying Git HEAD alone would ship `0941a76` and would omit the uncommitted remediation. Any future release has to be cut from this working tree, or from a commit that contains it.

`verify-robots-build-artifact` logged that `.next/server/app/robots.txt.body` was missing and skipped. Live `GET /robots.txt` on the candidate is HTTP 200 and allows `/` while disallowing `/admin`, `/api`, and `/upload`. That live response is the evidence. The skipped file check is not evidence.

## Pages verified

Canonical inventory is the candidate sitemap plus the public utility and boundary routes.

| Set | Count | Result |
| --- | --- | --- |
| Sitemap URLs | 85 | HTTP 200. One visible H1, one `#main-content`, no doubled document title. |
| Extra public routes | `/thank-you`, `/maintenance`, `/newsletter/unsubscribe` | HTTP 200, `noindex` as intended. |
| `/book-consultation` | 1 | HTTP 308 to `/book-information-session`. Absent from the sitemap. |
| Unknown URL | `/this-route-should-404-6e` | HTTP 404, `noindex`, one H1 (“Page not found”), header and footer present, Brisbane photograph in the HTML. H1 top 369 px, header bottom 140 px at 390 px. |
| Admin boundary | `/admin`, `/admin/crm`, `/admin/customers`, `/admin/invoices` | HTTP 307 to `/admin/login`. No enquiry identifiers in the redirect body. |
| `/admin/login` | 1 | HTTP 200 login wall. No public header. No H1 on the login form. |

Measurements covered **95 routes** at 390×844, 768×900, and 1440×900. Phone and desktop viewport screenshots: **176** files in `reports/visual-audit/screenshots/phase6e/`. Full measurements: `reports/visual-audit/phase6e-crawl.json`.

Across public 200 pages the crawl recorded:

- Header/content overlap: none (overlap values were negative, meaning a gap).
- Horizontal overflow: none.
- Broken images: none.
- Footer operating counts: none.
- Console errors and failed same-origin requests: none on this host (Cloudflare is not in front of it).
- Duplicate document titles (`MinRosh Migration | MinRosh Migration`): none.
- Source H1 count other than 1 on public 200 pages: none. The original route manifest still lists two H1s for destination HTML; that column is stale. This crawl counted one H1 in the candidate HTML.
- Invalid JSON-LD: none found.
- Indexability audit: 85 URLs, sitemap parity ok, no heuristic failures (`reports/indexability-audit-stage-0.md`, generated 2026-10-24T11:40:54Z against `:3123`).

Homepage at 390 px: H1 36 px, plum `rgb(31, 16, 32)`, hero file still `/images/hero-brisbane-river-cbd-hd.jpg` (rendered 390×1008, natural 390×259, opacity 1). Contact at 390 px: H1 30 px, 71 px below the header. Australia hub at 1440 px: heading and breadcrumb clear of the header, photograph loaded.

46 document titles are longer than 60 characters. The longest measured is `/destinations/australia/education` at 89. This is the open remainder of ISS-004. It is not a new doubling bug.

The 404 document title falls back to the homepage title because `app/not-found.js` does not export its own metadata. The response is `noindex`.

## Test summary

All commands were pointed at the candidate, not at port 3000 or 3001.

| Command | Result |
| --- | --- |
| `npm run build` in `/home/minrosh/releases/qa-phase-6d-20261024` | Exit 0. Build `ylEu7v9rhXF8KidAH3F2T`. |
| `npm run test:unit` | 20 files, **108 passed**. |
| `npm run test:e2e` with `PLAYWRIGHT_LIVE_URL=http://127.0.0.1:3123`, workers 1 | **163 passed** (1.1 min). |
| `npm run test:nav` with `UI_AUDIT_BASE_URL=http://127.0.0.1:3123` and admin credentials unset | **Passed.** Admin wall detected. Authenticated sidebar checks were skipped. |
| `npm run routes:verify` with `SITE_URL=http://127.0.0.1:3123` | Home, sitemap, and robots.txt HTTP 200. |
| `npm run audit:indexability` with `INDEXABILITY_BASE_URL=http://127.0.0.1:3123` | Exit 0. 85 URLs, no parity mismatch. |

## Performance

Lighthouse 12.8.2, mobile, simulated throttling, Headless Chrome 146. Certification run benchmark index 2409.5.

| Metric | Original audit (`:3120`, 24 Oct 2026 05:41 UTC) | This build (`:3123`) |
| --- | --- | --- |
| Performance | 59 | **96** |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 92 | 92 |
| LCP | 4.67 s | **2.68 s** |
| FCP | 1.67 s | 1.67 s |
| Total blocking time | 1,212 ms | **52 ms** |
| CLS | 0 | 0.037 |

Trace: `reports/visual-audit/lighthouse/phase6e-home-mobile.json`. LCP is still just outside the 2.5 s good line. It is not a regression against the original audit or against the Phase 6D run (performance 95, LCP 2.72 s, TBT 38 ms).

## Visual issue status

Compared with `reports/visual-audit/issues.csv` and remeasured on this build.

| ID | Priority | Independent result |
| --- | --- | --- |
| ISS-001 to ISS-003, ISS-005 to ISS-015, ISS-017 to ISS-020, ISS-022, ISS-023 | P1–P3 | The conditions named in the register were not reproduced on this crawl: one H1, no header overlap, news present, no footer counts, 404 inside the shell. |
| ISS-004 | P1 partial | Doubled brand suffix was not reproduced. **46 titles remain over 60 characters.** Still open. |
| ISS-016 | P2 open | Cloudflare beacon is still absent from the app and from `script-src`. Not retested behind Cloudflare. |
| ISS-021 | P3 open | Compliance copy was not rewritten and has **no recorded human approval**. |
| ISS-024, ISS-025 | P1 | Performance and contact LCP hold on this newer build id. Contact was remeasured in the crawl (heading clear of the header). A new contact Lighthouse run was not required to judge the homepage regression gate. |

No P0 row exists in the register. No new P0 or release-blocking layout defect was found in the 95-route crawl.

## Release gates

| # | Gate | Result |
| --- | --- | --- |
| 1 | Zero unresolved P0 defects | Met. None recorded, none found. |
| 2 | Zero unresolved release-blocking P1 defects | **Not met.** ISS-004 is still a partial P1 (title length). |
| 3 | No unexplained failing critical tests | Met for the commands above. Authenticated admin navigation was not run. |
| 4 | No verified mobile header/content overlap | Met on 95 routes at 390, 768, and 1440. |
| 5 | No unintended duplicate landmarks or headings | Met on public 200 pages. Admin login has no H1. |
| 6 | Complete visual evidence | Met: measurements at three widths, screenshots at 390 and 1440, separate 404 check. |
| 7 | Successful safe staging tests for essential journeys | **Not met.** See below. |
| 8 | No material performance or SEO regression | Met against the original mobile audit. SEO category remains 92. |
| 9 | Required regulatory and content approvals completed | **Not met.** ISS-021 and the external legal review are open. |
| 10 | Documented provenance and a tested rollback | **Not met.** Provenance is a dirty tree. Rollback was inspected, not executed. |

## Essential journeys — BLOCKED

Contact, booking, and assessment pages render on the isolated server. Assessment is the Official Information Finder, not a CRM write. Acknowledgement checkboxes on the contact and booking forms were unchecked in the prior isolated inspection, and a contact POST without acknowledgement returned 400 without writing the synthetic address.

A completed enquiry, consultation booking, or payment was not submitted. The candidate process has no SMTP, Supabase, Google, or Stripe credentials. There is no authorised staging sink. Port 3001 was not used. Until those isolated destinations exist, these journeys cannot be called successful.

## Compliance approvals still required

These were not changed in this certification:

- Footer and hero wording that MinRosh is not a registered migration agent and does not give immigration assistance.
- “Find a Registered Migration Agent” pointing at the public register. No MARN was published.
- `/referral-program` describes tracked introducer links and does not publish a fee, commission, or partner name. A reviewer still needs to decide the disclosure.
- `docs/no-marn-compliance-audit.md` records that external legal review is outstanding. That status is unchanged.
- The personalised navigator stays off. Public AI chat was not enabled on this server.

## Remaining risks

- Shipping `0941a76` without the working tree would drop the remediation.
- ISS-004 title length can truncate in search results.
- ISS-016 will log a CSP error on production until the Cloudflare injection is turned off. The candidate policy should stay strict.
- 404 uses the homepage document title while remaining `noindex`.
- Admin login has no H1. The auth wall itself behaved correctly.
- LCP at 2.68 s is acceptable for this gate and is still slightly above the 2.5 s good threshold.
- Authenticated CMS screens were not opened. Unauthenticated admin routes redirect to login.

## Production deployment prerequisites

Do not deploy until all of the following are true:

1. The working tree is committed (or otherwise snapshotted) and the deployed artifact is that snapshot, not bare `0941a76`.
2. A named reviewer accepts the compliance copy and the referral-program disclosure, or records a written waiver. ISS-021 stays open until then.
3. Contact and booking are submitted with synthetic data against an isolated CRM, mailbox, calendar, and payment project that cannot reach production.
4. ISS-004 is either accepted in writing as a non-blocking residual or the long titles are shortened without changing their meaning.
5. The Cloudflare analytics injection is disabled before this build is placed behind Cloudflare. Do not widen `script-src` to hide it.
6. `minrosh-next` on port 3000 stays on the `1455a66` release until the cutover is explicitly approved.

## Rollback

Inspected only. Nothing was restarted.

| PM2 name | State | Port | Artifact |
| --- | --- | --- | --- |
| `minrosh-next` | online | 3000 | `1455a66a319e29fe968ca6d74e086cdebaf3c049-20260908` |
| `minrosh-staging` | online | 3001 | `/home/minrosh/minrosh-staging-no-marn` |
| `minrosh-release-candidate` | stopped | 3002 | same directory as current production |
| `minrosh-rollback-candidate` | stopped | 3003 | `5e7123e7391a60db79e5cb4e1ae0c0e31051fde1-rollback-20260908` |

`server.js` is present in both the live production standalone directory and the September rollback standalone directory.

If a future cutover replaces `minrosh-next`, the rollback target for that cutover is the directory it runs from today (`1455a66…-20260908`). Leave that directory in place. To return production to it, point `minrosh-next` back at that standalone `server.js` and restart only that PM2 app. Do not use `minrosh-staging` as the rollback. The September `minrosh-rollback-candidate` is an older artifact and was not booted in this certification.

This drill was not executed. Starting or restarting those apps would change the process supervisor and was out of scope.

## Decision

**NO-GO.**

Gates 2, 7, 9, and 10 are unsatisfied. Layout, unit tests, end-to-end tests, navigation, route checks, indexability, and mobile performance do not by themselves authorise a release.

Approval is requested only after the prerequisites above are closed. This certification does not authorise a deploy or a merge.
