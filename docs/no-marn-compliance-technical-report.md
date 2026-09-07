# No-MARN Compliance Technical Report

**Branch:** `compliance/no-marn-update` (from `main` @ pre-change HEAD)  
**Deploy status:** **Nothing deployed to production.** Staging/local verification only.  
**CMS production feature flag:** left OFF / unchanged for production publish workflows.

This report is an implementation summary for engineering review. It is **not** legal advice or a final legal certification.

## Official references

- Migration Act 1958 (Cth), current compilation (esp. ss 276, 280, 283–285): https://www.legislation.gov.au/C1958A00062/latest
- Home Affairs — Who can help with your application: https://immi.homeaffairs.gov.au/help-support/who-can-help-with-your-application
- OMARA — Getting help from someone who is not a registered migration agent: https://www.mara.gov.au/get-help-with-a-visa/helpers-not-registered
- OMARA — Use of artificial intelligence: https://www.mara.gov.au/about-us/use-of-artificial-intelligence

## Feature flags

| Flag / constant | Default | Effect |
| --- | --- | --- |
| `COMPLIANCE_FEATURE_FLAGS.PERSONALISED_NAVIGATOR` | `false` | Smart Navigator not mounted; code marked `DISABLED_PENDING_AUTHORISED_PROFESSIONAL_REVIEW` |
| `COMPLIANCE_FEATURE_FLAGS.PERSONALISED_QUIZ_RESULTS` | `false` (`ENABLE_PERSONALISED_QUIZ_RESULTS`) | `/api/quiz-results` returns **410** |
| `COMPLIANCE_FEATURE_FLAGS.AI_PATHWAY_FUNNEL` | `false` (`ENABLE_AI_PATHWAY_FUNNEL`) | `/api/ai-funnel` returns **410** |
| `COMPLIANCE_FEATURE_FLAGS.AUTHORISED_RMA_MODE` | `false` (`ENABLE_AUTHORISED_RMA_MODE`) | No public MARN overlay; future-only |
| `SHOW_DESTINATION_CONFIDENCE_TOOLS` | `false` (hardcoded in destination pages) | Hides confidence strip / outcome simulator |
| `COMPLIANCE_FEATURE_FLAGS.PUBLIC_AI_CHAT` | `false` (`ENABLE_PUBLIC_AI_CHAT`) | `/api/chat` returns **410**; UI also needs `NEXT_PUBLIC_ENABLE_PUBLIC_AI_CHAT` |
| `COMPLIANCE_FEATURE_FLAGS.PUBLIC_MIGRATION_MATTER_PORTAL` | `false` | Public `/upload` portal gated |
| `SITE_ENVIRONMENT` | unset / `production` on live; `staging` on private staging | Staging-only noindex + robots Disallow |

## Staging review follow-up (resolved)

| Item | Resolution |
| --- | --- |
| 404 pathway/portal framing | Neutral “Page not found” + general-information CTAs |
| `/tools` personalised marketing | Repositioned as General Information Tools; removed disabled personalised cards and cost/timeline estimator |
| PR pathway explorer | Renamed Permanent Migration Information Explorer; official-link topics only |
| Contact `sheetSync: "ok"` false positive | `resolveSheetSyncStatus()` → `not_configured` / `skipped` / `success` / `failed`; processing omitted from public responses |
| Zone unknown files | Classified under `lib/zone-manifest.mjs` public prefixes |
| Standalone symlink copy crash | Guard in `scripts/copy-standalone-assets.mjs` |
| Staging noindex overlays | Env-controlled via `SITE_ENVIRONMENT=staging` (`lib/site-environment.js`, `lib/seo-robots.js`) |

## Credential exposure response (names only — do not auto-rotate)

Previous private staging PM2 process (`minrosh-staging` before isolation) had production-linked credential **names** available in process env. Operator tools such as `pm2 env` can expose values to anyone with server access. PM2 app log files on disk were scanned for common secret **value** patterns: **no matches found** in `minrosh-staging-*.log` / `minrosh-next-*.log` at review time. Exposure window for the old staging process: roughly from staging process creation (**2026-07-06**) through private restage (**2026-09-07**). Agent/chat transcripts that dump `pm2 env` may also hold values — treat as compromised for rotation planning.

| Credential name | Exposure possible | Secret value in PM2 logs | Required admin action |
| --- | --- | --- | --- |
| `SMTP_PASS` | Yes (process env) | Not found in scanned PM2 logs | Rotate Gmail app password; update production `.env`; restart production only after change window |
| `SMTP_USER` / `SMTP_FROM` / `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | Yes (non-secret config + identity) | N/A | Confirm still correct after password rotate |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Yes (process env) | Not found in scanned PM2 logs | Create new key in Google Cloud IAM; disable/delete old key; update env/secret file |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Yes | N/A | Remains with new key |
| `GOOGLE_APPLICATION_CREDENTIALS` | Yes (path) | N/A | Point to updated JSON; restrict file perms |
| `GOOGLE_FORM_WEBHOOK_SECRET` | Yes | Not found in scanned PM2 logs | Rotate webhook secret; update Google Form / Apps Script consumers |
| `GOOGLE_SHEETS_*` / `GOOGLE_DRIVE_*` / `GOOGLE_CALENDAR_ID` / `GOOGLE_WORKSPACE_DELEGATED_USER` | Yes (IDs / identity) | N/A | Review access ACLs; no automatic deletion |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes (public by design) | Not found as raw dump in scanned logs | Restrict key HTTP referrers in Google Cloud Console |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Yes (public by design) | N/A | Keep off staging; review GA data retention |

### Manual rotation steps (administrator)

1. **SMTP:** Google Account → Security → App passwords → revoke old app password → create new → update server `.env` `SMTP_PASS` → restart **production** PM2 only in a planned window (`pm2 delete/start` via ecosystem so `.env` reloads).
2. **Google service account:** Cloud Console → IAM → Service Accounts → Keys → add new JSON key → update `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` / credentials file → verify Sheets/Drive/Calendar → **delete old key**.
3. **Form webhook:** Generate new random secret → update `GOOGLE_FORM_WEBHOOK_SECRET` and the form/script that posts to `/api/webhooks/google-form`.
4. **Maps key:** Cloud Console → Credentials → application restrictions (HTTP referrers for production host only).
5. Do **not** delete PM2 logs as part of rotation; retain for forensics.
6. Do **not** paste secret values into tickets or chat.

## Disabled / replaced endpoints & surfaces

| Surface | Action |
| --- | --- |
| `components/smart-navigator.js` + `lib/navigator.js` | Not mounted publicly; disabled banner; replaced by Official Information Finder |
| `app/assessment` | Hosts Official Information Finder (route preserved for SEO continuity) |
| `/api/ai-funnel` | Disabled (410) unless flag enabled |
| `/api/quiz-results` | Disabled (410) unless flag enabled |
| `/api/chat` | Disabled (410) unless flag enabled |
| Public MARN / “Available on request” | Removed from `site.json`; stripped in `withPublicMarn`; removed from JSON-LD |
| Agent registration strip | Referral-only copy |
| Content-page MARA badge | Removed |
| Resume / migration document upload | Rejected on public contact path |
| Destination confidence tools | Gated off |
| Skilled cost/timeline estimator on `/tools` | Removed from tools hub (personalised scenario framing) |

## Data / CMS

- Added central `data/site.json` → `compliance` fields (disclosure, disclaimers, referral URLs, form acknowledgement, AI notice, category banners).
- Removed public `brand.marn`.
- `validatePublishableCopy()` blocks prohibited registration/agent self-claims on intelligence news publish (`lib/intelligence/publish.js`).
- Enquiry categories normalised to `general_information` / `education_enquiry` with server-side acknowledgement requirement.
- Restricted enquiry outcome: `referred_to_authorised_professional` when message looks like immigration assistance.

## Privacy / legal human review still required

See **Remaining items requiring external legal or privacy review** below.

## Key files changed (staging review pass)

- 404 / tools / explorer: `app/not-found.js`, `app/tools/page.js`, `app/tools/pr-pathway-explorer/page.js`, `components/tools/pr-pathway-explorer-client.jsx`
- Staging robots: `lib/site-environment.js`, `lib/seo-robots.js`, `app/robots.js`, `app/layout.js`, `middleware.js`
- Contact telemetry: `app/api/contact/route.js`, `lib/google-sheets-crm.js`
- Zones / standalone: `lib/zone-manifest.mjs`, `scripts/copy-standalone-assets.mjs`
- Tests: `tests/site-environment-and-sheet-sync.test.mjs`, `tests/robots-site-environment.test.mjs`, contact route tests

## Database / content backup

No destructive CMS migration was run against production. Local `data/*.json` edited on the compliance branch only. Historical CRM/quiz/AI-funnel records were **not** deleted.

## Unrelated workspace note

Untracked `reports/seo-meta-audit.md` was left untouched.

## Remaining items requiring external legal or privacy review

1. Historical CRM, quiz, AI-funnel, upload, and nurture records — retention, lawful basis, access hardening (see `docs/no-marn-historical-data-inventory.md`). **Do not auto-delete.**
2. Re-enabling public generative AI (`ENABLE_PUBLIC_AI_CHAT`) — counsel approval required; generative drift cannot be fully eliminated by prompts alone.
3. Admin CRM terminology and any residual adviser–client relationship framing.
4. Success stories / testimonials with subclass or timeline language.
5. Educational RMA/lawyer comparison pages — confirm third-person referral framing.
6. CMS rollback / republish of pre-compliance copy — require explicit confirmation.
7. Historical invoices that may have described immigration assistance — commercial/legal review (forward-looking line guard only).
8. Google Sheets/Drive/Calendar migration-status mirrors — access and retention.
9. Remaining `client` strings classified `public-needs-review` in `docs/no-marn-client-terminology-inventory.md`.
10. Complete SMTP + Google credential rotation per table above (administrator action).

