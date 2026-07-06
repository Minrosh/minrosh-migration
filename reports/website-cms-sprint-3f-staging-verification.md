# Website CMS — Sprint 3f Staging Verification Report

**Branch:** `feature/website-cms`  
**Commit verified:** `15a91b8` (`Wire FAQ page to Website Manager CMS`)  
**Date:** 2026-06-28  
**Scope:** `/faq` only  
**Production deploy:** **No**  
**Production CMS flag:** **OFF**

---

## Staging deployment

| Item | Value |
|------|--------|
| PM2 process | `minrosh-staging` |
| Port | `3001` (production `minrosh-next` on `3000` untouched) |
| Staging env | `STAGING_SITE=true`, `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true` |
| Config | `ecosystem.staging.config.js` |

Public hostname `staging.minroshmigration.com.au` is **not yet DNS/tunnel wired** (see Sprint 3e staging report for blocker and owner steps). All checks below ran on `http://127.0.0.1:3001` with staging env flags.

---

## Environment checks

| Check | Result |
|-------|--------|
| `X-Robots-Tag: noindex, nofollow` | **Pass** |
| Production CMS flag | **OFF** (not set in `.env`) |
| Production deploy | **None** (`minrosh-next` uptime unchanged) |

---

## Page verification: `/faq`

| # | Test | CMS ON | CMS OFF |
|---|------|--------|---------|
| 1 | HTTP 200 | Pass | Pass |
| 2 | CMS version renders | Pass — `CMS FAQ — Staging Verify 3f` | N/A |
| 3 | Legacy fallback | N/A | Pass — `Frequently asked questions…`, `content-page` |
| 4 | Corrupt `website-pages.json` | Pass — legacy fallback, HTTP 200 | — |
| 5 | Desktop layout | Pass (screenshot) | Pass (screenshot) |
| 6 | Mobile layout | Pass (screenshot) | — |
| 7 | SEO metadata | Pass — title, description, keywords | Pass |
| 8 | Canonical URL | `https://minroshmigration.com.au/faq` | Pass |
| 9 | `BreadcrumbList` JSON-LD | Pass | Pass |
| 10 | `FAQPage` JSON-LD | Pass | Pass |
| 11 | `SpeakableSpecification` JSON-LD | Pass | Pass |
| 12 | Admin publish → page update | Pass — CMS markers after publish to `website-pages.json` |

---

## Regression checks (staging, CMS ON)

| Route | HTTP | Legacy markers unaffected |
|-------|------|---------------------------|
| `/about` | 200 | Pass |
| `/contact` | 200 | Pass + form shell |
| `/student-visa-australia` | 200 | Pass |
| `/skilled-migration` | 200 | Pass |
| `/post-study-visa-australia` | 200 | Pass |
| `/` homepage | 200 | **Not CMS-wired** |

**Unchanged:** header, footer, CRM, leads, invoices, Smart Navigator, contact API, analytics, admin auth.

---

## Contact form (staging)

Valid POST returns enquiry ID; upstream save behaviour unchanged (`supabase_not_configured` possible in dev/staging).

---

## Automated gates

| Command | Result |
|---------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass |
| `npm run test:unit` | **80/80** pass |
| `tests/website-cms-faq-fallback.test.mjs` | **3/3** pass |

Harness: `bash scripts/run-staging-verification.sh`

---

## Screenshots

`reports/website-cms-sprint-3f-screenshots/`

- `faq-legacy-desktop-cms-off.png`
- `faq-cms-desktop-cms-on.png`
- `faq-cms-mobile-cms-on.png`

---

## Verdict

**Sprint 3f staging verification: PASS** on server-local staging (`:3001`).

**Production:** not deployed; `NEXT_PUBLIC_WEBSITE_CMS_ENABLED` remains OFF.

---

## Next step

Owner sign-off on `/faq` staging review, then proceed per CMS plan (homepage remains last; header/footer not yet connected).
