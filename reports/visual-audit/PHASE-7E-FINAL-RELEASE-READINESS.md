# Phase 7E — Final release readiness

**Recommendation: NO-GO**

The examined tree builds, the automated public checks pass, the sampled layouts hold, and a disposable rollback rehearsal succeeded. Release approval is not granted. The candidate is not a single Git revision, professional approval is unrecorded, and the external enquiry, calendar, and payment channels remain unverified.

No merge and no deployment were performed. Production `minrosh-next` (pid 1875, started Mon Oct 12 19:42:31 2026) and staging `minrosh-staging` (pid 1874, started Mon Oct 12 19:42:30 2026) were still those processes at the end of this phase. Production cwd remains `/home/minrosh/releases/1455a66a319e29fe968ca6d74e086cdebaf3c049-20260908/.next/standalone`.

## 1. Source integrity

| Item | Value |
| --- | --- |
| Branch | `fix/phase-6b-critical-repairs` (no upstream) |
| Last commit | `d8ad8d2f9fdce1d1c9e3bc8114b260fa1028b285` — `docs: record the phase 7A checkpoint and its validation` |
| Parent | `8f69b9c3235c8343162d4da79a68e5eae27d3901` |
| Working-tree application diff | `0c630bce131fc8fa554d880b705580f0a657fa281007c7716d89a27613f56848` |
| Isolated build ID | `HlUV__DHBxpDuUhaRzd1k` |
| Build directory | `/home/minrosh/releases/qa-phase-7e-20261024` |
| Candidate listen address used for tests | `http://127.0.0.1:3128` (stopped after certification) |

`d8ad8d2` is a reproducible revision. It contains the Phase 7A checkpoint and the Phase 6B–6E remediation. It does not contain the Phase 7B title and sitemap-title edits. Those edits are present only in the working tree, so this build ID cannot be reproduced from a Git object.

The uncommitted application files are identified:

- `lib/seo.js`
- `app/maintenance/page.js`
- `data/seo-pages.json`
- `data/destination-sections/australia.json`
- `data/destination-sections/canada.json`
- `data/destination-sections/new-zealand.json`
- `data/destination-sections/united-kingdom.json`
- `tests/seo-title-and-sitemap.test.mjs`

**Provenance result: rejected as a release candidate.** A release requires one committed revision that contains the approved code, tests, and configuration. This certification does not create that commit.

### Audit material outside the release

These files are evidence. They are not application source for a production cutover:

- `reports/visual-audit/issues.csv` (ISS-004 status updated in Phase 7B)
- `reports/indexability-audit-stage-0.md` (regenerated against `http://127.0.0.1:3128` during this phase; command exit 0)
- `reports/visual-audit/PHASE-7B-SEO-TITLE-AUDIT.md`
- `reports/visual-audit/PHASE-7B-METADATA-INVENTORY.csv`
- `reports/visual-audit/PHASE-7C-STAGING-INTEGRATION.md`
- `reports/visual-audit/PHASE-7D-COMPLIANCE-SIGNOFF.md`
- `reports/visual-audit/PHASE-7D-APPROVAL-REGISTER.csv`
- `reports/visual-audit/PHASE-7E-FINAL-RELEASE-READINESS.md` (this document)
- `reports/visual-audit/screenshots/` including `screenshots/phase7e/`
- `reports/seo-meta-audit.md` (older untracked audit; not part of the candidate)

Review items that stay outside any code release until a person records them:

- Phase 7D register: 22 rows, **0 Approved**, 17 Awaiting professional review, 3 Requiring correction (REG-009, REG-010, REG-020), 2 Non-blocking observations
- ISS-021, human review, open
- ISS-016, Cloudflare beacon, open. The authorised change is in the Cloudflare dashboard for hostname `minroshmigration.com.au`: turn off automatic JavaScript injection or remove the hostname. CSP was not widened. The dashboard was not changed.

## 2. Build and test

The isolated directory was copied from the working tree with `node_modules` linked and without `.git`, `.next`, screenshots, or `.env` files. `npm run build` completed with `BUILD_ID=HlUV__DHBxpDuUhaRzd1k`.

The server was started with a clean environment: `NODE_ENV=production`, `SKIP_ENV_VALIDATION=1`, `SITE_ENVIRONMENT=production`, no mail, database, or payment secrets.

| Check | Result |
| --- | --- |
| `npm run build` | Pass. Build ID `HlUV__DHBxpDuUhaRzd1k` |
| `npm run test:unit` | Pass. 20 files, 110 tests. Contact dual-write stderr `contact_supabase_dual_write_failed_pre_email` is the expected failure path in that unit test |
| `npm run test:e2e` | Pass. 163 tests against `http://127.0.0.1:3128`, including public visual regression at 390, 768, and 1440 |
| `npm run test:nav` | Pass. Authenticated admin sidebar checks were skipped because no admin password was supplied |
| `npm run routes:verify` | Pass. `/`, `/sitemap.xml`, and `/robots.txt` returned HTTP 200 on the candidate |
| `npm run audit:indexability` | Pass. Wrote `reports/indexability-audit-stage-0.md` and exited 0 |

Candidate sitemap contains 85 URLs. Homepage title is `MinRosh Migration | General Migration Information & Education Support`. Contact title is `Contact | Brisbane | MinRosh Migration`. Hero JPEG `/images/hero-brisbane-river-cbd-hd.jpg` returned HTTP 200 (`image/jpeg`, 309309 bytes). The candidate homepage HTML does not include `site-footer__stats`.

## 3. Visual certification

Evidence is in `reports/visual-audit/screenshots/phase7e/`. Playwright also walked the sitemap routes at 390, 768, and 1440 inside `test:e2e` with no recorded overflow, missing H1, or HTTP error.

| Surface | Evidence | Result |
| --- | --- | --- |
| Homepage hero | `home-1440.png`, `home-390.png` | H1 fully below the header (gap about 184px at 1440 and 191px at 390). Brisbane hero JPEG present. Disclosure and two hero actions visible |
| Shared hero templates | `skilled-1440.png`, `skilled-390.png`, `booking-1440.png`, `booking-390.png` | Heading clear of the header. Breadcrumb visible on the service page |
| Header and mobile navigation | `home-1440.png`, `home-390.png`, `tab-contact-390.png` | Desktop primary nav visible. At 390px the bottom tab bar is the primary control; the drawer button stays hidden while that bar is shown. Hydrated Contact tab opens `/contact` |
| Contact and booking | `contact-1440.png`, `contact-390.png`, browser session on `/contact` | Form, acknowledgement, and privacy control present. Browser loaded the contact document and exposed Send enquiry |
| Destination and visa pages | `australia-1440.png`, `australia-390.png`, `skilled-390.png` | Hub and service heroes readable. No horizontal overflow (scroll width matched the viewport) |
| News and carousels | `news-1440.png`, `news-390.png`, `home-news-390.png` | News cards and homepage news links render with article text |
| Information Finder | `finder-1440.png`, `finder-390.png` | H1 `Official Information Finder`. Page states it does not assess eligibility |
| 404 | `notfound-1440.png`, `notfound-390.png` | HTTP 404 inside the public header and footer. H1 `Page not found`. Document title still uses the homepage title |
| Footer | `footer-1440.png` | Disclosure, register link, newsletter consent, and legal links visible. Operational count cards absent on the candidate |
| Responsive layouts | 390 and 1440 captures plus e2e at 768 | No measured header overlap and no horizontal overflow on the sampled routes |

The 404 document title is a residual metadata observation. It is not a layout regression.

## 4. Rollback rehearsal

The rehearsal used disposable copies and port `3129`. It did not restart, replace, or stop pid 1875 or pid 1874.

| Step | Process | Marker | Health |
| --- | --- | --- | --- |
| Stable baseline | Copy of `1455a66a319e29fe968ca6d74e086cdebaf3c049-20260908` standalone, build `oSVNfoy1aP5XPl6oQwnv1`, no `.env` copied | Footer stats present, sitemap 83 URLs | `/`, `/sitemap.xml`, `/robots.txt`, hero JPEG HTTP 200 |
| Upgrade | Same port, Phase 7E standalone, build `HlUV__DHBxpDuUhaRzd1k` | Footer stats absent, sitemap 85 URLs | `/`, sitemap, hero JPEG HTTP 200 (`309309` bytes) |
| Rollback | Same port, stable copy restored | Footer stats present, sitemap 83 URLs | `/`, `/sitemap.xml`, `/robots.txt`, hero JPEG HTTP 200 |

Both disposable processes were then stopped. Listeners on `:3128` and `:3129` were gone. `:3000` remained pid 1875 and `:3001` remained pid 1874.

**Rehearsal result: succeeded** for startup, routing, the hero asset, and the representative health checks. This was a copy rehearsal. The live production process was not switched.

### Deployment and rollback steps for a future approved cutover

These steps are documentation. They were not executed.

1. Release only from a committed revision. Rebuild in an isolated directory and record `BUILD_ID`.
2. Start that standalone on a private port with the production environment supplied by the existing process manager. Confirm `/`, `/sitemap.xml`, `/robots.txt`, and `/images/hero-brisbane-river-cbd-hd.jpg`.
3. Point `minrosh-next` at the new standalone only after explicit production approval.
4. Rollback by returning `minrosh-next` to `/home/minrosh/releases/1455a66a319e29fe968ca6d74e086cdebaf3c049-20260908/.next/standalone` (build `oSVNfoy1aP5XPl6oQwnv1` on the copy examined here) and confirming the stable health checks above. Do not use the staging process on `:3001` as the rollback target.

## 5. Release gate

| Gate | Status |
| --- | --- |
| No unresolved P0 or release-blocking P1 | Met. Open register rows are ISS-016 (P2) and ISS-021 (P3). Listed P1 rows are `verified fixed` |
| Critical automated tests pass | Met on the isolated candidate |
| Essential form workflows safely verified | Unmet for delivery. Phase 7C verified local validation, acknowledgement, honeypot, rate limit, and newsletter dedupe with synthetic `@example.com` data. SMTP, Google Calendar, Sheets, Supabase, and Stripe stayed blocked. A local save is not proof of email, a calendar booking, or a payment |
| Regulatory approvals recorded | Unmet. 0 of 22 register rows are Approved. REG-009, REG-010, and REG-020 still require correction after professional review |
| No major visual regression | Met on the certified sample |
| Source provenance reproducible | Unmet. The candidate depends on identified uncommitted files |
| Rollback rehearsed | Met in a disposable environment |
| Deployment and rollback documented | Met in this document |

## Required before a GO recommendation

1. Commit the identified Phase 7B application files, and only those files, when a release owner asks for that commit. Rebuild from the resulting Git revision and record the new build ID.
2. Record professional approval against `PHASE-7D-APPROVAL-REGISTER.csv`. Apply REG-009, REG-010, and REG-020 only after that approval.
3. Verify enquiry email, consultation calendar creation, and payment in an authorised non-production integration, or record a formal decision that those channels remain disabled for this release.
4. Complete the Cloudflare dashboard change for ISS-016, or record an accepted exception. Leave the Content Security Policy unchanged.
5. Ask again for production release approval. This document does not grant it.
