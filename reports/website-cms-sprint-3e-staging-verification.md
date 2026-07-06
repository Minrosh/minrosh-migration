# Website CMS — Sprint 3e Staging Verification Report

**Branch:** `feature/website-cms`  
**Commit verified:** `6ac8963` (Sprint 3e code) + staging build from `15a91b8`  
**Date:** 2026-06-28  
**Scope:** `/post-study-visa-australia` only  
**Production deploy:** **No**  
**Production CMS flag:** **OFF**

---

## Staging deployment

| Item | Value |
|------|--------|
| PM2 process | `minrosh-staging` |
| Port | `3001` (production `minrosh-next` remains on `3000`) |
| Branch build | `feature/website-cms` — `npm run build` |
| Staging env | `STAGING_SITE=true`, `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true` |
| Public URL target | `https://staging.minroshmigration.com.au` |

### Public staging hostname status

`staging.minroshmigration.com.au` **does not resolve** (NXDOMAIN) from this server. Cloudflare tunnel ingress and DNS were **not updated** because:

- `/etc/cloudflared/config.yml` requires **sudo** (not available non-interactively)
- Cloudflare API token returned **authentication error** for tunnel/DNS endpoints

**Functional staging verification** was completed on the server-local staging instance at `http://127.0.0.1:3001` with identical env flags. To expose the public hostname, add tunnel ingress + DNS (owner action below).

---

## Environment checks

| Check | Result |
|-------|--------|
| `STAGING_SITE=true` on staging PM2 | Yes |
| `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true` on staging | Yes |
| `X-Robots-Tag: noindex, nofollow` on public HTML | **Pass** (all verified routes) |
| Production `.env` CMS flag | **Unset / OFF** |
| Production PM2 `minrosh-next` restarted? | **No** (uptime unchanged ~112m) |
| Production `/post-study-visa-australia` | **404** (old deploy — expected) |

---

## Page verification: `/post-study-visa-australia`

| # | Test | CMS ON | CMS OFF |
|---|------|--------|---------|
| 1 | HTTP 200 | Pass | Pass |
| 2 | CMS version renders | Pass — `CMS Post-Study Visa — Staging Verify 3e` | N/A |
| 3 | Legacy fallback renders | N/A | Pass — `Post-Study` guide content |
| 4 | Corrupt `website-pages.json` | Pass — legacy fallback, no crash | — |
| 5 | Desktop layout | Pass (screenshot) | Pass (screenshot) |
| 6 | Mobile layout | Pass (screenshot) | — |
| 7 | SEO metadata preserved | Pass — title, description, canonical | Pass |
| 8 | Canonical URL | `https://minroshmigration.com.au/post-study-visa-australia` | Pass |
| 9 | `BreadcrumbList` JSON-LD | Pass | Pass |
| 10 | `FAQPage` JSON-LD | Pass | Pass |
| 11 | Admin publish → page update | Pass — published via Website Manager store; CMS marker visible after restart |

---

## Regression checks (staging, CMS ON)

| Route | HTTP | Notes |
|-------|------|-------|
| `/about` | 200 | CMS marker present |
| `/contact` | 200 | CMS marker + `#contact-enquiry-form` |
| `/student-visa-australia` | 200 | CMS marker present |
| `/skilled-migration` | 200 | CMS marker present |
| `/faq` | 200 | CMS marker present |
| `/` (homepage) | 200 | **Unchanged** — `portal-shell--premium-home`, not CMS-wired |

**Unchanged systems (no code changes in this sprint):** header nav arrays, footer, CRM, leads, invoices, Smart Navigator, contact API contract, analytics, admin auth.

---

## Contact form (staging)

POST `/api/contact` accepts valid payload and returns `enquiryId` (`ENQ-…`). Upstream persistence may report `supabase_not_configured` in staging — **unchanged** from prior sprints; API validation and ID assignment work.

---

## Automated gates

| Command | Result |
|---------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass |
| `npm run test:unit` | **80/80** pass |
| `tests/website-cms-post-study-visa-fallback.test.mjs` | **3/3** pass |

Harness: `bash scripts/run-staging-verification.sh`

---

## Screenshots

`reports/website-cms-sprint-3e-screenshots/`

- `post-study-legacy-desktop-cms-off.png`
- `post-study-cms-desktop-cms-on.png`
- `post-study-cms-mobile-cms-on.png`
- `admin-post-study-edit-publish.png` (prior admin capture)

---

## Owner action — enable public staging URL

1. Add to `/etc/cloudflared/config.yml` **before** the catch-all rule:

```yaml
  - hostname: staging.minroshmigration.com.au
    service: http://localhost:3001
```

2. Create DNS CNAME: `staging` → `90476ba2-7b17-4023-88b5-547eeecb6ae6.cfargotunnel.com` (proxied)
3. `sudo systemctl restart cloudflared`
4. Re-run owner checklist in browser at `https://staging.minroshmigration.com.au`

---

## Verdict

**Sprint 3e staging verification: PASS** on server-local staging (`:3001`). Ready for owner sign-off once public hostname is wired, or owner may review via server tunnel/port forward.

**Production:** not deployed; CMS flag remains OFF.
