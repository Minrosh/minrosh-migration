# Phase 00 — Audit findings (stop here)

**Date:** 22 Nov 2026 (Australia/Brisbane)  
**Scope:** Public routes, mobile UI, duplicates, legal/compliance, SEO, links, features, admin/CRM risks  
**Actions taken:** Documentation only. No site behaviour changes, no deletes, no redirects, no deploy.

## Verdict

`main` and live production are **not the same product surface**. Live (`fix/phase-6b-critical-repairs` lineage) is a no-MARN **general information & education support** site. Git `main` still markets **registered migration guidance**, still serves `/book-consultation`, and still ships `brand.marn: "Available on request"`. Any redesign started from `main` without first aligning to production compliance will reintroduce regulated-assistance claims.

Kit files named in the kickoff were **not present** in this environment (see `KIT_INPUTS_STATUS.md`). Findings below are from repo + live + compliance-branch evidence.

---

## 1. Critical: main ↔ production drift

| Topic | Git `main` (this checkout) | Live production |
| --- | --- | --- |
| Positioning | “Registered migration guidance” (`data/site.json` hero) | “General Migration Information & Education Support” |
| MARN | `brand.marn = "Available on request"` | No public MARN; disclosure that MinRosh is not an RMA |
| Booking URL | `/book-consultation` page | `/book-information-session` (200); `/book-consultation` → **308** |
| Assessment | Smart Navigator / eligibility framing | “Official Information Finder” |
| Compliance docs | Absent on `main` | Present on `fix/phase-6b` (`docs/no-marn-compliance-*.md`) |

**Risk:** Redesign or content work on `main` that “preserves CTAs” per `docs/HOMEPAGE-CONTENT-SAFE-REDESIGN-CHECKLIST.md` will preserve **non-compliant** consultation/eligibility language relative to production policy.

---

## 2. Verified route inventory (summary)

Full CSV: [`verified-route-inventory.csv`](./verified-route-inventory.md) / [`verified-route-inventory.csv`](./verified-route-inventory.csv)

| Set | Count |
| --- | ---: |
| Live sitemap URLs | 85 |
| `main` sitemap source (static + destinations + news) | 84 |
| Phase 00 inventory rows (incl. utilities / templates) | 91 |
| Public static `page.js` templates on `main` | 45 |
| Admin UI routes | 18 |
| API `route.js` handlers | 81 |

### Live-only vs `main` sitemap source

- `/book-information-session`
- `/visa-services`
- `/global-pathways`

### On `main` sitemap source but not live sitemap

- `/book-consultation` (live is redirect-only)
- `/immigration-news/migration-sri-lanka-australia-2026` (unpublished on compliance branch; still in `data/news.json` on `main`)

### Permanent redirects already in `next.config.mjs` (`main`)

- `www` → apex  
- `/migration-from-sri-lanka` → `/migration-sri-lanka-to-australia`  
- `/partner-visa` → `/partner-visa-australia`  
- `/visitor-visa` → `/visitor-visas`

### Live-observed redirect (not in `main` next.config)

- `/book-consultation` → `/book-information-session` (308)

---

## 3. Legal / compliance wording

### High severity (if `main` were deployed as-is)

- Placeholder MARN “Available on request” + schema/`agent-registration-strip` paths that can imply OMARA registration  
- Hero/services copy: registered guidance, pathway questionnaire, book consultation  
- AI chat / quiz / navigator framed as personalised pathway / eligibility tools on `main`  
- Email copy in `lib/contact.js`: “registered migration agents”

### Production baseline (must not regress)

From `docs/no-marn-compliance-audit.md` on `fix/phase-6b`:

- Premise: **no registered migration agent / no MARN**  
- Enquiry types restricted; AI chat off by default; navigator replaced by Information Finder  
- CMS publish guards block reintroduction of banned phrases  
- External legal clearance was **not** claimed — counsel review still noted historically

### Open human-review item (from visual audit ISS-021)

- Footer / referral disclosures and `/referral-program` introducer language need ongoing human sign-off  
- Do not “shorten the footer” by deleting compliance notices

---

## 4. SEO problems

| Issue | Evidence | Severity |
| --- | --- | --- |
| Title brand doubling (historical) | Many titles were `… \| MinRosh Migration \| MinRosh Migration`; fixed on phase-6b via `buildMetadata` | Was P1; verify before any `lib/seo.js` redesign |
| Long titles retained | ~36 titles still >60 chars by design (subclass/destination intent) | Accept or shorten deliberately |
| Thin destination meta | UK/Canada section descriptions historically <75–110 chars; fixed on phase-6b | Watch if section JSON rewritten |
| Duplicate topic clusters | `/popular-routes` ≈ `/global-pathways` ≈ `/visa-services`; partner service + 3 partner guides; destination `about/contact/faq` vs global pages | Medium cannibalisation |
| Sitemap parity | Live includes booking/info + visa-services + global-pathways; `main` still lists `/book-consultation` | High if deploying `main` |
| News slug drift | `migration-sri-lanka-australia-2026` on `main` data, not live sitemap | Medium |
| Loading shells | Destination/news `loading.js` historically injected second `<main>`/`<h1>` (ISS-011; fixed on phase-6b) | High if regressing |

---

## 5. Duplicate / overlapping content

1. **Conversion aliases:** `/book-consultation` vs `/book-information-session`  
2. **Route hubs:** `/popular-routes`, `/global-pathways`, `/visa-services`  
3. **Partner cluster:** `/partner-visa-australia` + `/partner-visa-australia-guide` + `/partner-visa-820-801-guide` + `/partner-visa-309-100-guide` + destination `/partner`  
4. **Student cluster:** service page + requirements guide + news article + destination student section  
5. **Destination section mirrors:** per-country `about` / `contact` / `faq` vs site-wide pages  
6. **Tools vs assessment:** Information Finder vs tools hub vs PR explorer (disclaimer repetition historically)

Do **not** delete any of these in Phase 00. Later phases must decide keep / merge / noindex with redirects only when explicitly approved.

---

## 6. Mobile UI issues

### Still relevant from `docs/MOBILE-STAGE1-NOTES.md`

- Visa mega menu desktop-only (≥921px); mobile depends on drawer IA  
- AI concierge / floating widgets can overlap sticky CTAs on short viewports  
- Wide tables/embeds may still overflow inside cards  

### From visual-audit issue register (phase-6b; many marked fixed there)

| ID | Topic | Status on phase-6b register | Risk if redesigning from `main` |
| --- | --- | --- | --- |
| ISS-023 | Fixed header covering H1 on `/contact` + pages importing `home.css` | Marked fixed on 6B | **High** — easy to regress in `app/home.css` / `globals.css` |
| ISS-002 | Oversized mobile header / 1024 nav overflow | Fixed | High |
| ISS-005 | Repeated homepage CTAs | Fixed | Medium |
| ISS-001 | Empty carousel placeholders | Fixed | Medium |
| ISS-017 | Dense phone footer | Fixed | Medium |
| ISS-016 | Cloudflare insights CSP console error | Open (dashboard) | Low layout / console |

Hero baseline lock (`.cursorrules` / homepage checklist): do not change `home-hero-premium.jsx`, `app/home.css` (`.portal-shell--premium-home`), or hero image without explicit audit.

---

## 7. Broken / risky links

| Finding | Detail |
| --- | --- |
| CTA drift | Dozens of `main` links still target `/book-consultation` (header, footer CTAs, AI, navigator, destinations, nurture emails, Stripe success paths) while live canonical is `/book-information-session` |
| Stale tests | `npm run test:nav` historically expects “Smart Navigator” / “Visa Decision Engine” names — mismatches Information Finder |
| Payments | `lib/payments/stripe.js` success/cancel defaults still `/book-consultation?...` on `main` |
| Nurture | `lib/nurture-sequences-ai.js` trackingLink → `/book-consultation` |
| 404 shell | Bare 404 without public shell was ISS-007 (fixed on phase-6b) |

No Phase 00 redirects were created.

---

## 8. Existing features to preserve

See [`FEATURE_INVENTORY.md`](./FEATURE_INVENTORY.md). Headline public features:

- Homepage premium hero + below-fold journey  
- Official Information Finder (`/assessment`) — compliance mode on live  
- Contact / booking / education enquiry forms → CRM leads  
- Destination hubs + 8 sections × 4 countries  
- Tools: student cost planner, PR pathway explorer  
- Immigration news + admin news CMS  
- WhatsApp / phone CTAs  
- Optional AI concierge (feature-flagged off on compliance)  
- Newsletter unsubscribe  
- Token upload portal (migration-matter portal gated on compliance)

Admin/CRM: leads, pipeline, customers, inbox, quotes, invoices, tasks, automations, intelligence, success stories, audit, users.

---

## 9. Admin / CRM risks

See [`ADMIN_CRM_RISK_REGISTER.md`](./ADMIN_CRM_RISK_REGISTER.md).

**Do not touch without dual-zone QA:** `middleware.js`, `app/layout.js`, `app/globals.css`, `app/admin/**`, `app/api/admin/**`, `lib/contact.js`, `lib/zone-manifest.mjs`, compliance publish guards (on phase-6b), Stripe/webhook/portal APIs.

---

## 10. Redesign checklist reconciliation status

| Checklist source | Status |
| --- | --- |
| Kickoff `PAGE_CHECKLIST_FROM_KIT.csv` | **Not available** |
| `docs/HOMEPAGE-CONTENT-SAFE-REDESIGN-CHECKLIST.md` | Reviewed — hero lock + “keep `/book-consultation`” conflicts with live compliance URL |
| Live sitemap + phase-6b `route-manifest.csv` | Reconciled into Phase 00 inventory |
| `design-reference/index.html` | **Not available** — visual target not auditable |

---

## Phase 00 stop conditions (met)

- [x] Public routes inventoried and compared to live sitemap  
- [x] Mobile, duplicate, compliance, SEO, link, feature, admin/CRM risks documented  
- [x] No functionality changes / deletes / redirects / deploy  
- [x] Findings reported; **stop after Phase 00**

## Recommended next input (not started)

1. Re-attach or commit the redesign kit files.  
2. Choose the **compliance branch / live tree** as the redesign base, not raw `main`.  
3. Only then run Phase 01+ from `CURSOR_PHASE_PROMPTS.md`.
