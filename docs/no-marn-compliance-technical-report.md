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

## Disabled / replaced endpoints & surfaces

| Surface | Action |
| --- | --- |
| `components/smart-navigator.js` + `lib/navigator.js` | Not mounted publicly; disabled banner; replaced by Official Information Finder |
| `app/assessment` | Hosts Official Information Finder (route preserved for SEO continuity) |
| `/api/ai-funnel` | Disabled (410) unless flag enabled |
| `/api/quiz-results` | Disabled (410) unless flag enabled |
| Public MARN / “Available on request” | Removed from `site.json`; stripped in `withPublicMarn`; removed from JSON-LD |
| Agent registration strip | Referral-only copy |
| Content-page MARA badge | Removed |
| Resume / migration document upload | Rejected on public contact path |
| Destination confidence tools | Gated off |

## Data / CMS

- Added central `data/site.json` → `compliance` fields (disclosure, disclaimers, referral URLs, form acknowledgement, AI notice, category banners).
- Removed public `brand.marn`.
- `validatePublishableCopy()` blocks prohibited registration/agent self-claims on intelligence news publish (`lib/intelligence/publish.js`).
- Enquiry categories normalised to `general_information` / `education_enquiry` with server-side acknowledgement requirement.
- Restricted enquiry outcome: `referred_to_authorised_professional` when message looks like immigration assistance.

## Privacy / legal human review still required

See **Remaining items requiring external legal or privacy review** below. Earlier notes superseded by continuation pass (AI OFF by default; booking redirected; destination hub rebuilt; portal gated).

## Key files changed (continuation pass additions)

- AI: `app/api/chat/route.js`, `components/global-client-widgets.jsx`, `tests/chat-compliance.test.mjs`, `lib/compliance.js` (`PUBLIC_AI_CHAT`)
- Destination hub: `components/destination-command-center.jsx`, `data/destination-command-center.json`, `components/destination-command-palette.jsx`, destination pages (route graph gated)
- Booking: `app/book-information-session/page.js`, `app/book-consultation/page.js` (redirect), `next.config.mjs`, sitemap/`lib/public-indexable-routes.js`, link sweep
- Portal: upload APIs gated (`PUBLIC_MIGRATION_MATTER_PORTAL`), `lib/invoice/line-description-guard.js`
- Inventories: `docs/no-marn-historical-data-inventory.md`, `docs/no-marn-client-terminology-inventory.md`

## Database / content backup

No destructive CMS migration was run against production. Local `data/*.json` edited on the compliance branch only. Historical CRM/quiz/AI-funnel records were **not** deleted. Before any staging content import that mutates shared DB, take a backup of CMS/DB as required by ops runbooks.

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

