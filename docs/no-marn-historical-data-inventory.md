# No-MARN: Historical data inventory (CRM / quiz / AI funnel)

**Branch:** `compliance/no-marn-update`  
**Generated:** 2026-09-07 from **code inspection only**  
**Updated:** 2026-09-08 — expanded invoices / Google mirrors / accessibility notes (final public-copy + CMS rollback pass). Historical records **not** modified.  
**Policy:** Do **not** auto-delete historical records. Privacy/minimisation actions require authorised human review.

This document maps where personal and migration-adjacent data may still live so counsel/ops can decide retention, access hardening, and lawful basis — not to purge data from the app.

---

## Summary

| Store | Primary location | Public write today? | Contains sensitive visa-profile data? | Access |
| --- | --- | --- | --- | --- |
| Website enquiries | `data/enquiries.json` (+ optional Supabase mirror) | Yes (`POST /api/contact`) | Possible (free-text message, quiz summary, PII) | Admin inbox/CRM; disk on server |
| CRM customers | `data/customers.json` (+ optional Supabase mirror) | Indirect (contact may `findOrCreateCustomerByIdentity`) | High if docs/passport OCR/notes present | Admin only |
| Customer uploads | Private upload dirs / Google Drive | **Gated OFF** (`PUBLIC_MIGRATION_MATTER_PORTAL`) | High (identity docs) | Admin + historical magic links (now 410) |
| CRM leads / interactions / opportunities / tasks / conversations / quotes | `data/crm-*.json` | Lead create from contact / (disabled) AI funnel | Medium–high | Admin |
| Quiz / points leads | Email + Supabase `quiz_submissions` + `enquiries_mirror` QUIZ-* | **API 410** unless `ENABLE_PERSONALISED_QUIZ_RESULTS` | High (profile answers, score, email) | Admin / SMTP inbox / DB |
| AI pathway funnel | CRM lead + nurture | **API 410** unless `ENABLE_AI_PATHWAY_FUNNEL` | High (answers, insights) | Admin |
| Nurture queue | `data/nurture-queue.json` | Enqueued from contact / (disabled) AI nurture | Medium (email + sequence meta) | Cron + admin |
| Invoices / payments | `data/invoices.json` (+ optional `invoices_mirror` / Supabase) | Portal token read (invoice only); not open web | Medium (billing PII); historical line text deferred to legal/accounting/privacy; new lines compliance-guarded | Admin + tokenised portal |
| Newsletter | `data/newsletter*.json` (via newsletter flows) | Opt-in forms | Low–medium (email) | Admin / unsubscribe |
| Audit log | `data/audit-log.json` | System | Low–medium (actions, ids) | Admin |
| Google Sheets / Drive / Calendar | External Google APIs | When configured | High if used for status/docs | Service account + delegated user |

---

## 1. Contact / enquiries (`lib/contact.js`)

| Item | Detail |
| --- | --- |
| **Storage** | Preferred: `data/enquiries.json` (override `ENQUIRIES_FILE`). Legacy migrate from `data-enquiries.json`. Seed: `data/enquiries.seed.json`. |
| **Dual-write** | `lib/supabase/enquiries-dual-write.js` → Postgres `public.enquiries_mirror` (`id`, `payload` jsonb, `created_at`). On when Supabase URL + service role set unless `SUPABASE_DUAL_WRITE_ENQUIRIES=false`. Migration: `supabase/migrations/20260414120000_enquiries_mirror.sql`. |
| **Written by** | `POST /api/contact` (also may create CRM customer + lead). |
| **Typical fields** | Name, email, phone, message, enquiry type, mainNeed, quizSummary, privacyConsentLog (IP, timestamp, policy version), Drive folder ids, resume upload status. |
| **Sensitive?** | Yes — free text may include visa circumstances; consent log includes IP. |
| **Retention** | No automated purge in code for enquiries JSON. |
| **Recommended privacy actions** | (1) Inventory production `enquiries.json` + `enquiries_mirror` for immigration-assistance requests already flagged `referred_to_authorised_professional`. (2) Confirm retention schedule with privacy policy. (3) Minimise quizSummary attachment going forward. (4) Do not bulk-delete without legal sign-off. |

---

## 2. CRM customers & migration documents

| Item | Detail |
| --- | --- |
| **Storage** | `data/customers.json` (seed `customers.seed.json`). Paths in `lib/admin/paths.js`. |
| **Dual-write** | `lib/supabase/crm-dual-write.js` → `customers_mirror` when enabled. Migration: `20260415120000_customers_invoices_mirror.sql`. |
| **Documents** | Local private dirs via `lib/admin/uploads-storage.js`; optional Google Drive folders (`lib/google-drive.js`). Passport OCR hints may merge into customer records (`mergePassportOcrHints`). |
| **Document checklists / stages** | `lib/client-portal/document-center.js` (skilled/partner/student requirement sets); Google Sheets portal status (`GOOGLE_SHEETS_STATUS_*`). |
| **Public portal** | `/upload/[token]`, `/api/upload/[token]*` — **disabled by default** (`ENABLE_PUBLIC_MIGRATION_MATTER_PORTAL` unset/false → HTTP 410). **Does not delete** historical customers or files. |
| **Access** | Admin customers UI (`features/admin-panel`, `/api/admin/customers`). Magic links remain in DB hashes but public API early-returns. |
| **Recommended privacy actions** | (1) Keep portal flag OFF until authorised professional mode. (2) Review Drive folders and local uploads for identity documents; apply existing retention cron (`UPLOAD_RETENTION_*`) only under policy. (3) Restrict Sheets status spreadsheet ACLs. (4) Prefer education-only tagging on new CRM rows. |

---

## 3. CRM leads, interactions, opportunities, tasks, quotes, automations

| Store | Path / module | Notes |
| --- | --- | --- |
| Leads | `data/crm-leads.json` (`lib/crm/leads-service.js`, `lib/admin/crm-store.js`) | Created from contact; historically from AI funnel |
| Interactions | `data/crm-interactions.json` | Seed text may say “Client requested…” |
| Opportunities / tasks / conversations / quotes / automations | Matching `data/crm-*.json` | Admin CRM only |
| **Sensitive?** | Lead `message` / quiz fields may hold pathway answers | |
| **Recommended** | Export inventory for counsel; soft-delete/archive policy; no automated wipe from this branch |

---

## 4. Quiz results (`app/api/quiz-results/route.js`)

| Item | Detail |
| --- | --- |
| **Public status** | **Disabled** unless `ENABLE_PERSONALISED_QUIZ_RESULTS=true` → otherwise **410** + `DISABLED_PENDING_AUTHORISED_PROFESSIONAL_REVIEW`. |
| **When enabled historically** | SMTP email to inbox; `dualWriteQuizLeadToSupabase` into `enquiries_mirror` with `QUIZ-*` ids; optional insert into `quiz_submissions` (name, email, score, details, `client_ip`). |
| **Sensitive?** | High — structured quiz answers + indicative points + PII. |
| **Recommended** | Leave flag OFF. Review Supabase `quiz_submissions` / QUIZ-* mirror rows for retention. Do not delete without privacy review. |

---

## 5. AI pathway funnel (`app/api/ai-funnel/route.js`, `lib/nurture-sequences-ai.js`)

| Item | Detail |
| --- | --- |
| **Public status** | **Disabled** unless `ENABLE_AI_PATHWAY_FUNNEL=true` → **410**. |
| **When enabled** | `createLead` with answers/insights; `startNurtureSequence(leadId, "ai_funnel")` (no-ops when flag off). |
| **Sensitive?** | High — goal, country, raw answers, “why/risks/timeline” insights. |
| **Recommended** | Flag OFF. Review existing `ai_navigator_funnel` leads in `crm-leads.json`. Quarantine nurture copy that promises pathway analysis. |

---

## 6. Nurture (`lib/nurture-sequences.js`, `lib/nurture-sequences-ai.js`)

| Item | Detail |
| --- | --- |
| **Storage** | `data/nurture-queue.json` (override `NURTURE_FILE`); seed `nurture-queue.seed.json`. |
| **Trigger** | Contact success paths / cron `POST /api/cron/nurture`; AI sequence gated by compliance flag. |
| **Sensitive?** | Email + enquiry linkage; sequence step state. |
| **Recommended** | Confirm stopped personalised pathway emails; retain queue for audit trail until retention decision. |

---

## 7. Invoices & portal billing (`lib/admin/invoices-service.js`, `app/api/portal/*`)

| Item | Detail |
| --- | --- |
| **Where descriptions live** | Primary: `data/invoices.json` (and related invoice-* JSON under `data/`). Optional dual-write / mirror: `invoices_mirror` (Supabase) when CRM dual-write is configured. |
| **Public accessibility** | **Not** open web. Tokenised portal billing only (`GET /api/portal/invoices`, profile, payment-method). Otherwise **admin-only**. No visa-stage / matter UI on these endpoints. |
| **New invoices (forward-looking)** | Blocked / guarded via `lib/invoice/line-description-guard.js` — rejects or sanitizes line descriptions claiming immigration assistance, lodgement, or visa application preparation. |
| **Historical records** | **Do not modify** in this compliance pass. Description wording decisions deferred to **legal / accounting / privacy**. Prefer amending future invoices and recording a compliance note over silently rewriting paid historical PDFs or destroying audit trails. |
| **Recommended** | Inventory historical line text for counsel; leave rows in place until authorised process decides correction vs retention. |

---

## 7a. Google Sheets / Drive / Calendar mirrors

| Item | Detail |
| --- | --- |
| **Configuration** | Env-driven (`GOOGLE_SHEETS_*`, `GOOGLE_DRIVE_*`, `GOOGLE_CALENDAR_ID`, service-account / delegated-user vars). When unset, sync paths skip / report not configured. |
| **Access** | Google Cloud **service account** (+ optional workspace delegated user). Not public website content. |
| **Sensitive data risk** | High if used for portal status, customer docs, or matter timelines. |
| **Retention** | Leave retention and ACL hardening for **legal / privacy** review. Do not auto-delete mirrors from this branch. |
| **Credential rotation** | Status tracked in `data/admin-credential-rotation-checklist.json` (SMTP, SA key, webhook secret, Maps restrictions) — status only; never stores secrets. Items remain **pending** until admin confirms. |

---

## 8. Other `data/*.json` stores (content vs personal data)

| Category | Examples | Personal data? | Action |
| --- | --- | --- | --- |
| CMS / marketing | `site.json`, `seo-pages.json`, `news.json`, destination JSON | No (copy) | Content already compliance-edited on branch |
| Signal / UX JSON | `*-signals.json`, planners | No | None |
| Seeds | `*.seed.json` for CRM/invoices | Synthetic / sample | Replace seed wording that says “Client…” over time |
| Success stories | `success-stories.json` (admin); public `site.json` / `getHomeSiteData` force empty | Possibly if real names | Emptied publicly 2026-09-08; counsel review before any republish |
| Social / intelligence | `intelligence-*`, `social-*` | Usually not end-user PII | Standard admin ACLs |

---

## 9. External systems (when env configured)

| System | Purpose | Sensitive data risk |
| --- | --- | --- |
| Google Drive | Lead/customer document folders | High |
| Google Sheets | Portal status + CRM append/summary | High |
| Google Calendar | Booked sessions + visa expiry reminders | Medium |
| SMTP / Gmail API | Enquiry, quiz, nurture, invoice emails | Medium–high |
| Stripe | Consultation payments | Medium (payment metadata) |
| Twilio | Upload SMS OTP | Low (phone) |
| Supabase | Mirrors + quiz_submissions | High |

---

## Recommended privacy action checklist (human review — do not automate delete)

1. **Access:** Confirm production admin accounts, Supabase service role, Drive/Sheets ACLs are least-privilege.
2. **Inventory:** Export counts (not full dumps into tickets) for enquiries, QUIZ-* mirrors, ai_funnel leads, customers with documents.
3. **Retention:** Align with published privacy policy; document periods for enquiries vs identity uploads vs invoices (financial retention may differ).
4. **Minimisation going forward:** Keep personalised quiz/AI funnel/portal flags OFF; contact schema already restricts enquiry types.
5. **Historical correction:** Where invoice/CRM notes claim immigration assistance, record a compliance note; prefer amending future documents over destroying audit trails. **Do not rewrite historical invoice descriptions in this pass.**
6. **No silent purge:** This branch intentionally leaves all historical JSON/DB rows in place.
7. **Google mirrors:** Review service-account ACLs and retention; leave data until privacy/legal decide.
8. **Credentials:** Confirm rotation via checklist API/file statuses only after rotating outside the app.

---

## Code references (entry points)

- `lib/contact.js` — enquiries file I/O  
- `lib/supabase/enquiries-dual-write.js`, `lib/supabase/crm-dual-write.js`  
- `lib/admin/customers-service.js`, `lib/admin/json-store.js`, `lib/admin/paths.js`  
- `lib/nurture-sequences.js`, `lib/nurture-sequences-ai.js`  
- `app/api/quiz-results/route.js`, `app/api/ai-funnel/route.js`, `app/api/contact/route.js`  
- `app/api/upload/[token]/route.js` + `COMPLIANCE_FEATURE_FLAGS.PUBLIC_MIGRATION_MATTER_PORTAL`  
- `lib/invoice/line-description-guard.js`  
- `data/admin-credential-rotation-checklist.json`, `app/api/admin/credential-rotation-checklist/route.js`
