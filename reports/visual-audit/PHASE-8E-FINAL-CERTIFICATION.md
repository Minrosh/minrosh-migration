# Phase 8E — Final independent release certification

**Recommendation: NO-GO**

The Phase 8A–8D working tree builds, the public automated checks pass, the measured layouts hold, homepage and contact lab performance did not regress against the Phase 6D mobile results, and a disposable rollback rehearsal succeeded. That is not a production release approval.

The candidate is not one Git revision. Professional approval is still 0 of 22. Critical enabled delivery through SMTP, Google Calendar, Google Sheets, and Google Drive remains unverified. Complaints copy that Phase 8D marked as requiring correction is still the published text.

No merge and no deployment were performed. Production `minrosh-next` (pid 1875, started Mon 12 October 2026 19:42:31) and staging `minrosh-staging` (pid 1874, started 19:42:30) were still those processes at the end of this phase. Production cwd remains `/home/minrosh/releases/1455a66a319e29fe968ca6d74e086cdebaf3c049-20260908/.next/standalone`. Disposable listeners on `:3128` and `:3129` were stopped. Live customer data was not modified.

## 1. Source integrity

| Item | Value |
| --- | --- |
| Branch | `fix/phase-6b-critical-repairs` (no upstream) |
| Last commit | `00a8c2d9fd487929300965201679323ecbad8902` — `checkpoint: preserve the phase 7B title reconciliation` |
| Parent | `d8ad8d2f9fdce1d1c9e3bc8114b260fa1028b285` |
| Working-tree application diff | `1df74f8fa2691026096e6a9ae9e0dff3db17aa9fec625560fe1f0c39e83553bc` (tracked `app`, `lib`, `components`, `data`, `tests`, `public`, `scripts` only) |
| Isolated build ID | `F_3Sg5WSwf6OYkx7r_1n5` |
| Build directory | `/home/minrosh/releases/qa-phase-8e-20261025/src` |
| Next.js | 15.5.18 |
| Candidate listen address used for tests | `http://127.0.0.1:3128` (stopped after certification) |

`00a8c2d` is a reproducible revision. It contains the Phase 7B title reconciliation and the earlier public remediation. It does not contain the Phase 8B or Phase 8C application edits. Those edits are only in the working tree, so build `F_3Sg5WSwf6OYkx7r_1n5` cannot be reproduced from a Git object.

Identified uncommitted application files:

- `app/api/stats/route.js`, `app/robots.js` — anonymous stats withheld; `/api/stats` removed from the robots allow list (Phase 8B)
- `app/upload/layout.js`, `app/upload/not-found.js`, `app/upload/[token]/page.js`, `components/google-analytics.jsx` — upload metadata and analytics path (Phase 8B)
- Eight content pages whose duplicate page-level FAQ JSON-LD was removed (Phase 8B)
- `app/api/contact/route.js`, `app/api/newsletter/route.js`, `app/api/payments/checkout/route.js` — customer-facing messages no longer name SMTP or Stripe configuration (Phase 8C)
- `tests/public-stats-route.test.mjs`, `tests/upload-metadata-and-faq-schema.test.mjs`, `tests/contact-route-post.test.mjs`, `tests/robots-site-environment.test.mjs`

Phase 8D added reports only. It did not change public copy.

`npm run check:sync` in the workspace exits 1. It reports shared-zone and unknown-zone changes, including untracked screenshots and `DO_NOT_BUILD_HERE.md`. The isolated build has no `.git`, so its `prebuild` sync check saw an empty change list and printed Git’s “not a git repository” help text before continuing. That isolated check does not prove the workspace is clean.

Intended test configuration, and the configuration actually used: `SITE_ENVIRONMENT=production`, `RELEASE_TARGET=production` at build time, then a runtime process started with `env -i`, `NODE_ENV=production`, `SKIP_ENV_VALIDATION=1`, and no SMTP, Stripe, Google, or Supabase variables. `verify-robots-build-artifact` skipped because `.next/server/app/robots.txt.body` is absent under Next.js 15. The served `/robots.txt` was still HTTP 200 and matched the production allow/disallow list, including no `Allow: /api/stats`.

**Provenance result: rejected as a release candidate.** A release needs one committed revision that contains the approved code and tests. This certification does not create that commit.

Evidence files that are not application source:

- `reports/visual-audit/PHASE-8A-RELEASE-BASELINE.md` and `PHASE-8A-REMAINING-ISSUES.csv`
- `reports/visual-audit/PHASE-8B-TECHNICAL-REMEDIATION.md`
- `reports/visual-audit/PHASE-8C-INTEGRATION-CERTIFICATION.md`
- `reports/visual-audit/PHASE-8D-COMPLIANCE-CORRECTIONS.md` and `PHASE-8D-FINAL-APPROVAL-REGISTER.csv`
- `reports/visual-audit/PHASE-8E-FINAL-CERTIFICATION.md` (this document)
- `reports/indexability-audit-stage-0.md` (regenerated against `http://127.0.0.1:3128` during this phase; command exit 0)
- `reports/visual-audit/screenshots/` including `screenshots/phase8e/`
- `reports/seo-meta-audit.md` (older untracked audit)

## 2. Automated tests

| Check | Result |
| --- | --- |
| `npm run build` | Pass. Build ID `F_3Sg5WSwf6OYkx7r_1n5`. Isolated directory. Not built in the workspace |
| `npm run test:unit` | Pass. 22 files, 115 tests. Contact dual-write stderr `contact_supabase_dual_write_failed_pre_email` is the expected failure path in that unit test |
| `npm run test:e2e` | Pass. 163 tests against `http://127.0.0.1:3128`, including public visual regression at 390, 768, and 1440 |
| `npm run test:nav` | Pass for the public nav. Authenticated admin sidebar checks were skipped because no admin password was supplied |
| `npm run routes:verify` | Pass. `/`, `/sitemap.xml`, and `/robots.txt` returned HTTP 200 on the candidate |
| `npm run audit:indexability` | Pass. 85 URLs, no heuristic attention rows. Wrote `reports/indexability-audit-stage-0.md` |
| `npm run check:sync` | Fail on the workspace (exit 1), as recorded in section 1 |
| `npm audit --omit=dev` | Fail. 1 critical, 5 high, 2 moderate. Not patched in this phase |

`npm audit --omit=dev` against the installed tree reports:

| Package | Highest severity in this report | Advisory titles |
| --- | --- | --- |
| `next` 15.5.18 | critical | Denial of Service in App Router using Server Actions (GHSA-m99w-x7hq-7vfj); Server-Side Request Forgery in Server Actions on custom servers (GHSA-89xv-2m56-2m9x); cache confusion of response bodies (GHSA-68g3-v927-f742) |
| `nanoid` | high | Non-secure and custom generators can loop; integer overflow (GHSA-28wg-ghj8-5hjv, GHSA-2v37-7h3g-55p8, GHSA-xwg4-73v4-xw9w) |
| `nodemailer` | high | Address-parser denial of service and related mail-handling advisories |
| `postcss` | high | `sourceMappingURL` file disclosure advisories |
| `sharp` | high | Inherited image-library advisories |
| `source-map-js` | high | Event-loop denial of service through indexed source-map offsets |
| `fflate`, `qs` | moderate | Malformed-archive loop; array-limit and `isBuffer` advisories |

These are dependency advisories, not a new application exploit written in this phase. They are unresolved on the candidate. A release owner needs a separate upgrade decision. This phase did not change CSP, admin auth, or production packages.

Candidate spot checks on `:3128`: sitemap 85 URLs; hero JPEG HTTP 200, `image/jpeg`, 309309 bytes; homepage HTML contains `/images/hero-brisbane-river-cbd-hd.jpg` and does not contain `site-footer__stats`; anonymous `GET /api/stats` is 401 without counts; `POST /api/quiz-results` is 410 `FEATURE_DISABLED`; `POST /api/payments/checkout` is 503 “Card payment is not available. No payment has been taken.”

## 3. Visual route coverage

`e2e/public-visual-regression.spec.mjs` loaded every sitemap path plus `/global-pathways`, `/thank-you`, `/maintenance`, and `/newsletter/unsubscribe` at 390, 768, and 1440. It failed the run on HTTP status ≥ 400, horizontal overflow, a doubled “MinRosh Migration | MinRosh Migration” title, a visible H1 count other than 1, a missing header (except `/maintenance`), or a missing canonical (except `/maintenance` and `/thank-you`). All three widths passed.

A second pass loaded the 85 sitemap paths, `/thank-you`, `/maintenance`, `/newsletter/unsubscribe`, and an unknown URL at the same three widths and measured header/H1 overlap, broken images, `<main>` count, footer stat cards, and a still-busy loading marker.

| Surface | Result |
| --- | --- |
| Homepage and hero | H1 “Explore Australian Migration Information with Greater Clarity” starts at about 279 px at 390 px. Header bottom is 125 px. Brisbane JPEG is in the document. Samples: `screenshots/phase8e/home-1440.png`, `home-390.png` |
| Mobile navigation | At 390 px the bottom tab bar is present. A click on the accessible name “Contact” opened `/contact` both immediately and after load. The earlier missed capture looked for a heading “Latest immigration news” (the news H1 is “Latest insights & migration updates”) and clicked before hydration. That failure was not reproduced on this build |
| News | `/updates` at 390 px screenshotted. `/immigration-news` has one H1 and one `<main>` after the load event |
| Contact and booking | `/contact` and `/book-information-session` returned 200. `contact-390.png` and `booking-390.png` saved. End-to-end smoke confirmed the privacy checkbox |
| Information Finder | H1 “Official Information Finder”. `finder-390.png` |
| 404 | Unknown URL returns 404. H1 “Page not found”, below the header. Document title is still the homepage title. `notfound-390.png` |
| Visa and destination content | `/skilled-migration` at 768 px and `/destinations/australia` at 1440 px screenshotted. The full sitemap set had no overflow and no H1 overlap on the second pass after load |
| Footer | Operational count cards are absent on the candidate |
| Floating widgets | On `/contact` at 390 px immediately after the tab navigation, the sticky quiz control was not in the document yet and did not overlap a form button. Phase 6D delays that bundle until idle. This pass did not reproduce an overlap |
| Loading states | Six routes reported `aria-busy` or a route overlay at `DOMContentLoaded` during the full crawl. The same URLs were quiet after the load event and a short wait. Treated as a measurement race, not a stuck loading state |
| Duplicate landmark | `/thank-you` has two `<main>` elements at 390, 768, and 1440. `SiteShell` supplies `#main-content`, and `app/thank-you/page.js` adds a second `<main>`. One H1. The page is outside the sitemap. This was not introduced by Phase 8B or 8C |

No broken image was recorded on the walked routes. No horizontal overflow was recorded. No H1 sat under the fixed header on the walked routes.

## 4. Performance

Lighthouse 12.8.2, Chrome 146.0.7680.164, headless, mobile form factor, screen emulation 412×823 at 1.75 device scale, simulated throttling (Lighthouse mobile default). Target `http://127.0.0.1:3128`. One run each for `/` and `/contact`. Not a field sample.

| Metric | Homepage Phase 6D (`:3123`) | Homepage this run | Contact Phase 6D | Contact this run |
| --- | --- | --- | --- | --- |
| Performance | 95 | 97 | 92 | 93 |
| Accessibility | 100 | 100 | 100 | 100 |
| Best practices | 100 | 100 | 100 | 100 |
| SEO | 92 | 92 | 91 | 91 |
| LCP | 2.72 s | 2.4 s | 3.15 s | 3.0 s |
| FCP | 1.68 s | 1.7 s | 1.51 s | 1.5 s |
| Total blocking time | 38 ms | 40 ms | 70 ms | 60 ms |
| CLS | 0.037 | 0.037 | 0.067 | 0.067 |

No material regression. Homepage LCP is the hero H1. Contact LCP is the introductory paragraph. Content was not removed to chase the score. SEO remains 92 and 91. Phase 6D already recorded that Lighthouse can score the meta-description audit at 0 while the description tag is present. Contact LCP is still above the 2.5 s lab line, as it was at 3.15 s.

## 5. Integration and compliance gates

Phase 8C evidence stands. It is not upgraded by this phase.

| Workflow | Phase 8C class | This phase |
| --- | --- | --- |
| Contact and booking validation, local save, public wording | PARTIAL | Reconfirmed only that the candidate build contains those routes. No new mailbox or calendar test |
| SMTP notification | BLOCKED | Still blocked. Production SMTP is configured. No sandbox was used |
| Google Calendar creation | BLOCKED | Still blocked. A local save is not a confirmed appointment |
| Google Sheets CRM and Drive folders | BLOCKED | Still blocked |
| Newsletter local save | PARTIAL | Welcome mail still blocked with SMTP |
| Stripe | NOT APPLICABLE | Secrets absent. Checkout copy reconfirmed on this build |
| Official Information Finder | PASS | Page still renders the finder H1 |
| Quiz, AI chat, pathway funnel, public upload portal | NOT APPLICABLE | Quiz route still 410. Flags were not turned on |

Phase 8D register, reconfirmed, not treated as approved because tests passed:

| Status | Count |
| --- | --- |
| Approved | 0 |
| Awaiting professional review | 17 |
| Requiring correction | 3 (REG-009 complaints starter page, REG-010 complaints escalation, REG-020 operational counts) |
| Non-blocking observations | 2 (REG-021 testimonials, REG-022 Cloudflare beacon) |

`/complaints` still contains “This starter page” and the sentence that tells the business to align “your formal business complaint-handling procedure”. Proposed wording is in the Phase 8D report and was not published.

`/referral-program` still uses “agents”, “accurate guidance”, “next-step pathways”, “conversion outcome”, and “target visa streams”. No fee sentence was added or removed.

REG-020 is fixed in this candidate’s anonymous API and footer, and it is still not Approved. Production was not switched, so the live process can still differ until a cutover.

REG-022: Cloudflare’s documented control for a proxied site is **Web Analytics → Manage site → Disable** (“The JS Snippet will not be injected and has been disabled”), from https://developers.cloudflare.com/web-analytics/get-started/. The dashboard was not changed. `static.cloudflareinsights.com` is still absent from `lib/csp/build-csp-header.js`.

## 6. Rollback rehearsal

Disposable copies only. Port `3129`. Pid 1875 and pid 1874 were not restarted. No `.env` was copied. The stable tree is a copy of `/home/minrosh/releases/1455a66a319e29fe968ca6d74e086cdebaf3c049-20260908/.next/standalone`.

| Step | Build | Markers | Health |
| --- | --- | --- | --- |
| Stable baseline | `oSVNfoy1aP5XPl6oQwnv1` | Footer stats present. Sitemap 83 URLs | `/`, `/contact`, `/updates`, `/sitemap.xml`, `/robots.txt`, hero JPEG HTTP 200 (309309 bytes) |
| Upgrade | `F_3Sg5WSwf6OYkx7r_1n5` | Footer stats absent. Hero path present in HTML. Sitemap 85 URLs | `/` and `/contact` HTTP 200. Hero JPEG HTTP 200 |
| Rollback | `oSVNfoy1aP5XPl6oQwnv1` restored on the same port | Footer stats present. Sitemap 83 URLs | `/`, sitemap, robots, hero JPEG HTTP 200 |

Both disposable processes were then stopped. `:3000` remained pid 1875 and `:3001` remained pid 1874.

**Rehearsal result: succeeded** for startup, route health, the hero asset, and the representative pages. Configuration compatibility was the isolated production site mode without secrets. The live production process was not switched.

Data limitation: each standalone has its own `data/` directory. This rehearsal did not migrate enquiry, CRM, or newsletter files, and it did not write the production data directory. Rolling the process back to the September standalone restores that tree’s files. It does not undo JSON written into a newer release directory, and it does not by itself move records if a future cutover points `ENQUIRIES_FILE` at a shared path. There is no database migration in this candidate to reverse.

A future cutover, not performed:

1. Release only from a committed revision. Rebuild in an isolated directory and record `BUILD_ID`.
2. Start that standalone on a private port with the environment supplied by the existing process manager. Confirm `/`, `/sitemap.xml`, `/robots.txt`, and `/images/hero-brisbane-river-cbd-hd.jpg`.
3. Point `minrosh-next` at the new standalone only after explicit production approval.
4. Rollback by returning `minrosh-next` to `/home/minrosh/releases/1455a66a319e29fe968ca6d74e086cdebaf3c049-20260908/.next/standalone` (build `oSVNfoy1aP5XPl6oQwnv1` on the copy examined here). Do not use the staging process on `:3001` as the rollback target.

## 7. Open issues

| ID | State |
| --- | --- |
| Source provenance | Release blocker. 8B and 8C code is uncommitted on top of `00a8c2d` |
| Phase 8D approvals | Release blocker. 0 Approved. REG-009 and REG-010 still published as draft complaints copy |
| Phase 8C delivery | Release blocker for enabled SMTP, Calendar, Sheets, and Drive |
| REG-020 | Candidate withholds anonymous counts. Not Approved. Not deployed |
| ISS-016 / REG-022 | Open. Cloudflare injection. CSP unchanged |
| ISS-021 | Open human review of the public disclosures |
| `/thank-you` nested `<main>` | Residual accessibility defect. Not a new 8B–8D edit |
| 404 document title | Still the homepage title. Layout is the public 404 shell |
| `npm audit --omit=dev` | 1 critical and 5 high advisories unresolved |
| Workspace `check:sync` | Exit 1 until the tree is committed and unclassified files are handled |
| Admin authenticated nav | Not run. No admin password was supplied |
| `scripts/test-smtp.mjs` | Help text still contains a grouped password-shaped example. Not quoted here. Rotate it if it was ever a live app password |

## 8. Release gate

| Gate | Status |
| --- | --- |
| Exact reproducible Git revision | Unmet |
| Critical automated public tests | Met on the isolated candidate |
| Full visual route coverage | Met, with the `/thank-you` duplicate `<main>` recorded |
| Performance without a material regression | Met against the Phase 6D mobile lab |
| Critical enabled customer workflows safely tested end to end | Unmet. Local logic is partial. External delivery is blocked |
| Regulatory approvals recorded | Unmet. 0 of 22 |
| Rollback rehearsed without touching production | Met |
| Dependency audit clean | Unmet |
| Production unchanged | Met |

## Required before a GO recommendation

1. Commit the identified Phase 8B and 8C application and test files when a release owner asks for that commit. Leave screenshots and secrets out. Rebuild from the resulting revision and record the new build ID.
2. Record human approval on `PHASE-8D-FINAL-APPROVAL-REGISTER.csv`. Publish REG-009 and REG-010 only from the approved text. Do not treat REG-020 as approved until a director confirms the counts are not a required disclosure.
3. Verify enquiry email, calendar creation, Sheets, and Drive in an authorised sandbox, or record a formal decision that those channels are outside this release. Do not copy production secrets into the test.
4. Complete the Cloudflare **Manage site → Disable** change, or record an accepted exception. Leave the Content Security Policy unchanged.
5. Decide separately whether the Next.js and related audit advisories must be upgraded before cutover.
6. Replace the extra `<main>` on `/thank-you` or accept it in writing.
7. Ask again for production release approval. This document does not grant it.

Stop. Explicit release approval is required before any production change.
