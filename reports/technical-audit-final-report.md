# MinRosh Migration — Technical Audit Final Report

**Date:** 24 June 2026  
**Scope:** Full repository audit + safe public website improvements (plan execution)  
**Status:** Complete — do not deploy until stakeholder review of deletions and manual smoke on production-like host

---

## 1. Executive summary

The MinRosh Migration platform underwent a phased technical audit and safe public-site improvement pass. **719 files** were classified in a machine-readable audit. The public homepage buyer journey was refined (copy-only hero changes), mobile padding was improved, destination hubs gained country-specific planning blocks, and the student cost planner was expanded into a multi-input planning tool. Admin functionality, SEO routes, sitemap, and middleware auth were preserved. **56 unit tests** and **5 core E2E smoke tests** pass; production build succeeds. **Nodemailer** was upgraded to 9.x with **0 production dependency vulnerabilities**. **25 orphaned legacy homepage components** and demo `data/enquiries-local.json` were removed after verification.

---

## 2. Files audited

| Artifact | Location |
|----------|----------|
| Full CSV (719 rows) | [reports/file-audit-full.csv](./file-audit-full.csv) |
| Summary | [reports/file-audit-summary.md](./file-audit-summary.md) |
| Generator script | [scripts/generate-file-audit-report.mjs](../scripts/generate-file-audit-report.mjs) |

**Action counts (from audit):** KEEP (majority), REVIEW (~25 legacy/orphan candidates), MERGE (4 nodemailer transport dupes — consolidated), SAFE TO DELETE (1 demo data file — removed).

---

## 3. Files to keep

All active routes remain:

- **67** public `page.js` routes  
- **81** API route handlers  
- **19** admin routes  
- Active homepage stack: `home-hero-premium`, `home-below-fold`, `home-quiz-entry-section`, etc.  
- SEO: `lib/seo.js`, `app/sitemap.js`, `app/robots.js`, `lib/public-indexable-routes.js`  
- Admin shims: `components/admin/*` → `features/admin-panel/components/*` (intentional)

---

## 4. Files to review (remaining)

| Path | Reason |
|------|--------|
| `app/api/news/route.js` | No in-repo client callers (server/SSR uses `data/news.json`) |
| `app/api/translate/route.js` | External/optional |
| `app/api/portal/*` | Customer portal backends — confirm if used |
| `app/api/payments/checkout` | Called from contact route internally |
| `docs/premium-homepage-design-preview.html` | Design artifact — optional archive |

---

## 5. Files safe to delete (completed)

**Deleted after tests:**

- `data/enquiries-local.json` (demo PII, zero references)
- 25 orphaned legacy homepage components (tab/hash layout cluster), including:
  - `components/home-page-content.jsx`
  - `components/home/home-tab-server.jsx`
  - `components/home/quiz-wizard-panel.jsx`
  - …and 22 related orphans (see git diff)

**Not deleted:** API routes under REVIEW; admin re-export shims.

---

## 6. Files moved or merged

| Change | Detail |
|--------|--------|
| **MERGE** | `getMailTransport()` from `lib/contact.js` now used by `lib/nurture-sequences.js`, `lib/newsletter.js`, `lib/intelligence/notifications.js`, `app/api/admin/broadcast/route.js` |
| **NEW** | `components/destinations/destination-planning-blocks.jsx` |
| **NEW** | `components/home-trust-section.jsx` |
| **NEW** | `data/destination-planning-blocks.json` |
| **ZONE** | `lib/zone-manifest.mjs` updated for new paths |

No `src/` migration (deferred per plan).

---

## 7. Public website improvements completed

### Homepage (copy-only hero; structure/LCP preserved)

- Hero headline + primary CTA **“Start Free Pathway Check”** + secondary **WhatsApp** button  
- Below-fold order: Journey → Countries → Services → Student planner preview → Trust → News (demoted) → Final CTA  
- New `HomeTrustSection` with evidence-first messaging  
- Service cards aligned to spec (5 types)  
- Tone: removed “AI v3”; planning-estimate language throughout  

### Mobile

- Increased `portal-main` bottom padding on form pages (`page-contact-shell`, assessment, forms)  
- Added `e2e/mobile-layout-local.spec.mjs` (88 viewport×route checks)  

### Destinations

- Per-country planning blocks (AU, CA, UK, NZ) via `DestinationPlanningBlocks` + JSON content  
- Dual CTAs: pathway check + book consultation  

### Student planner (`/tools/student-country-cost-planner`)

- Multi-input form: country, region, study level, provider, duration, job type  
- Outputs: first-year cost, living breakdown, income vs gap, PR note, risks, next step  
- Mandatory disclaimer in `data/tool-disclaimers.json`  
- CTA to education consultation + analytics events  

### MARN

- Removed hardcoded `MARN 1801042` from `content-page.js`; displays only when `NEXT_PUBLIC_MARN` is set  

---

## 8. Admin improvements completed

- Verified middleware protects `/admin/*` and `/api/admin/*`  
- **New tests:**
  - `tests/invoice-pdf.test.mjs` — PDF buffer generation  
  - `tests/admin-news-route.test.mjs` — 401 without session  
- Email transport consolidation reduces drift across admin/broadcast/nurture paths  

---

## 9. SEO / analytics changes

**Preserved:** sitemap, robots, metadata, redirects, route verify (133 routes), structured data patterns.

**Analytics events added/standardized:**

| Event | Where |
|-------|--------|
| `assessment_started` / `assessment_completed` | `smart-navigator.js` |
| `contact_form_submitted` | `contact-lead-form.js` |
| `whatsapp_clicked` | Hero, contact panel |
| `student_planner_started` / `student_planner_completed` | Student planner client |
| `consultation_booking_clicked` | Planner results CTA |
| `country_page_cta_clicked` | Destination planning blocks |

---

## 10. Security / dependency changes

| Item | Result |
|------|--------|
| `nodemailer` | Upgraded to **^9.0.1** |
| `npm run audit:production` | **0 vulnerabilities** |
| SMTP transport | Consolidated to `getMailTransport()` in 4 modules |
| Secrets in repo | None found in source |
| MARN | Centralized via env / site.json only |

---

## 11. Tests run and results

| Command | Result |
|---------|--------|
| `npm run lint` | PASS |
| `npm run test:unit` | PASS (56/56) |
| `ACKNOWLEDGE_*=1 npm run build` | PASS |
| `npm run routes:verify` | PASS |
| `npm run audit:production` | PASS (0 vulns) |
| `CI=true` smoke E2E (5 specs) | PASS |
| `e2e/mobile-layout-local.spec.mjs` | Added (run separately; some flaky nav on parallel workers — use `--workers=1`) |
| `npm run test:nav` | Not run (requires live server + optional admin cookie) |
| `npm run verify:ci` | Partial — use `ACKNOWLEDGE_SHARED_RISK=1` for build when shared zones changed |

---

## 12. Remaining risks

1. **Zone gate:** `check:sync` flags shared/public changes until acknowledged — expected after cross-cutting work.  
2. **Mobile E2E:** Full 88-case mobile spec can be flaky under parallel workers; run with `--workers=1` in CI if promoted.  
3. **JSON store scaling:** Invoice numbering still process-local (documented architectural limit).  
4. **Deleted quiz wizard:** Legacy `/#quiz` hash panel removed with orphan cluster; live quiz entry still points to `/assessment`.  
5. **Nodemailer 9.x:** Production audit clean; run `npm run test:smtp` and `npm run test:contact` on server before deploy.

---

## 13. Recommended next tasks

1. Commit changes and run post-deploy checklist (`docs/POST-DEPLOY-VERIFY.md`).  
2. Manual mobile click-through on contact, assessment, student planner, 4 destination hubs.  
3. Promote `mobile-layout-local` to CI with `workers: 1` after stabilisation.  
4. Add `service_page_cta_clicked` via `TrackedLink` on service hub pages.  
5. Phase 2 Supabase read path when ready.  
6. Archive or remove `docs/premium-homepage-design-preview.html` if no longer needed.

---

*End of report.*
