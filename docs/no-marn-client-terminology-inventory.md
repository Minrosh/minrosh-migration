# No-MARN: “Client” terminology inventory

**Branch:** `compliance/no-marn-update`  
**Generated:** 2026-09-07 (code inspection; no production data deleted)  
**Scope:** Remaining occurrences of the word **client** (case-insensitive) after portal/public softens on this branch.

## Classification legend

| Class | Meaning |
| --- | --- |
| `safe-internal` | Admin CRM, comments, audit logs, developer docs, variable names for SDK/DB handles — not public marketing claim of an adviser–client relationship |
| `public-needs-review` | Visible to website users or appears in user-facing legal/relationship framing — counsel should confirm wording |
| `education-ok` | Accurate in an education / third-party professional standards context (e.g. OMARA standards for *registered* agents) |
| `framework-library` | React `"use client"`, npm package names, Cloudflare API path, Inngest `client`, Supabase SDK variable, filename `*-client.jsx` |

## Softened in this pass (no longer public “client” UX)

| Path | Change |
| --- | --- |
| `app/tools/page.js` | “Client tools” → “Planning tools” |
| `lib/content-personalization.js` | “Client tools hub” → “Planning tools hub” |
| `components/hub-australia-aside.jsx` | “All client tools” → “All planning tools” |
| `app/australian-visas-official-sources/page.js` | “Client tools” → “Planning tools” |
| `components/home-deferred-carousels.jsx` | “Client feedback” → “What people say” / enquirer wording |
| `app/meet-the-team/page.js` | “Client Experience Team” → “Enquirer Experience Team” |
| `lib/upload-gate.js`, `app/api/upload/.../request-code`, `public-upload-form.jsx` | “this client” → “this enquirer” |
| `features/admin-panel/.../customer-detail-drawer.jsx` | portal link copy → enquirer |
| `features/admin-panel/.../enquiry-detail-drawer.jsx` | “Prospective client” → “Prospective enquirer” |
| `app/api/admin/broadcast/route.js` | “prospective client” → “prospective enquirer” |
| `lib/admin/invoice-pdf.js`, `lib/crm/quotes-service.js` | PDF “Client …” → “Customer …” |
| `features/admin-panel/.../invoices-panel.jsx` | Labels → Customer |
| `lib/google-calendar.js`, `lib/google-drive.js` | Enquirer / Customer fallbacks |

---

## Remaining inventory

### `framework-library` (bulk)

| Path / pattern | Context | Classification |
| --- | --- | --- |
| Hundreds of `*.jsx` / `*.js` files | Leading `"use client";` React Server Components directive | `framework-library` |
| `package-lock.json` / `node_modules/client-only` | npm dependency name | `framework-library` |
| `scripts/purge-cdn.js` | Cloudflare API `.../client/v4/zones/...` | `framework-library` |
| `lib/inngest/client`, `app/api/inngest/route.js` (`client: inngest`) | Inngest SDK wiring | `framework-library` |
| `lib/supabase/*`, `app/api/quiz-results/route.js`, admin supabase route | Local variable `client = createSupabaseAdminClient()` | `framework-library` |
| `lib/client-analytics.js`, imports thereof | Browser analytics module name | `framework-library` |
| `components/global-client-widgets*.jsx`, `GlobalClientWidgets` | React widget bundle filename/export | `framework-library` |
| `components/*-client.jsx`, `NewsletterUnsubscribeClient`, `PrPathwayExplorerClient`, etc. | React client-component naming | `framework-library` |
| `lib/validation/email-client.js` / `isValidEmailClient` | Shared validation helper name | `framework-library` |
| `app/api/files/client/[token]/[name]`, `scripts/route-parity-baseline.json` | Historical URL segment for file download API (not marketing copy) | `framework-library` |
| `lib/client-portal/document-center.js` | Module path for document portal helpers (admin/historical; public portal gated OFF) | `framework-library` |

### `public-needs-review`

| Path | Brief context | Classification |
| --- | --- | --- |
| `app/disclaimer/page.js` | Legal: does **not** create “registered migration agent–client / solicitor–client” relationship | `public-needs-review` |
| `app/terms-of-use/page.js` | Legal: does not create “adviser-client relationship” by website use alone | `public-needs-review` |
| `app/code-of-conduct/page.js` | Refers to OMARA standards including “clear client communication” for **registered** agents (third-party standards) | `education-ok` (listed here for counsel eyes; see also education-ok) |
| `scripts/generate-client-executive-summary-docx.mjs` | Offline doc generator still says “client management / client portal / client experience” — if ever shared externally, rewrite | `public-needs-review` |
| `website/development/DEVELOPMENT_TRACKER.md` | Dev tracker still lists “Client contact/address” and “client portal” roadmap items | `public-needs-review` |
| `docs/SYSTEM-ARCHITECTURE-AND-DEVELOPER-GUIDE.md` | Mentions “Client document upload” and “client redirect” | `public-needs-review` |
| `docs/no-marn-compliance-technical-report.md` | Notes legacy “client” labelling as open privacy/legal item | `public-needs-review` |
| `reports/stage2-review/README.md`, screenshot filename `home-mobile-390-client-feedback-section.png` | Historical review artefact / filename | `public-needs-review` |
| `data/crm-interactions.seed.json` | Seed CRM notes: “Client requested…” / “Client asked…” (seed only; admin CRM) | `safe-internal` (seed) — if ever shown publicly, review |

### `education-ok`

| Path | Brief context | Classification |
| --- | --- | --- |
| `app/code-of-conduct/page.js` | OMARA professional standards language about registered agents’ duties to *their* clients | `education-ok` |
| `app/disclaimer/page.js` / `app/terms-of-use/page.js` | Negating creation of agent–client / adviser–client relationship (protective legal framing) | `education-ok` / `public-needs-review` (dual) |

### `safe-internal`

| Path | Brief context | Classification |
| --- | --- | --- |
| `lib/compliance.js` | Comment: “Client-visible mirror” for AI chat env flag | `safe-internal` |
| `lib/consultation-slot-policy.js` | Comments about browser/client timezone | `safe-internal` |
| `lib/config.js`, `lib/home-site-data.js`, `lib/navigator-session.js`, `lib/payments/stripe.js`, `lib/security/request-ip.js`, `lib/validation/contact-schema.js`, `lib/chat/gemini.js`, `lib/supabase/server.js`, `components/structured-data.js`, `components/site-footer-interactive.jsx` | Developer comments: client bundle / client-side / client IP | `safe-internal` |
| `app/api/upload/[token]/route.js` | Import path `lib/client-portal`; file URLs under `/api/files/client/...` | `safe-internal` |
| `tests/consultation-slot-policy.test.mjs` | Test description “client TZ” | `safe-internal` |
| `scripts/live-roadmap-verify.mjs` | HTTP “Client/forbidden” diagnostic string | `safe-internal` |
| `scripts/generate-file-audit-report.mjs`, `COMPONENT_MAP.md` | Path reference to `client-journey-map.jsx` | `safe-internal` |
| `docs/deploy-checklist.md`, `docs/CLOUDFLARE-DEPLOYMENT-RUNBOOK.md`, `docs/FINAL-QA-BLOCK-REPORT.md`, `reports/*` | Ops/dev docs mentioning browser client cache or client callers | `safe-internal` |
| `app/api/quiz-results/route.js` | JSDoc field `clientIp` / column `client_ip` | `safe-internal` |
| Admin invoice/CRM panels (after soften) | Remaining only via historical seed text or unrelated SDK names | `safe-internal` |

---

## Portal / migration-matter status (related)

| Surface | Finding |
| --- | --- |
| `app/api/portal/*` | Invoice/profile/payment-method APIs only — no visa matter creation |
| `lib/client-portal/document-center.js` | Visa checklists + timeline helpers — used by upload API when portal flag ON |
| `/upload/[token]` + `/api/upload/[token]*` | **Disabled by default** via `COMPLIANCE_FEATURE_FLAGS.PUBLIC_MIGRATION_MATTER_PORTAL` (410). Historical customer rows retained; admin CRM still has full access |
| Admin customers create / magic link | Remains admin-only; public cannot onboard a new migration matter while flag is OFF |

## Recommended follow-ups

1. Counsel review of disclaimer / terms “agent–client / adviser–client” phrasing (keep if protective; do not invent a MinRosh client relationship).
2. Rewrite or quarantine `scripts/generate-client-executive-summary-docx.mjs` before any external share.
3. Optionally rename URL path `/api/files/client/...` in a later breaking-change release (low priority; not user-visible marketing).
4. Re-run this inventory after any CMS import that might restore old “client tools / client feedback” copy.
