# No-MARN Compliance Audit

**Branch:** `compliance/no-marn-update`  
**Date:** 2026-09-07 (inventory); **Final public-copy + CMS rollback pass:** 2026-09-08  
**Scope:** Public site, CMS defaults, APIs, forms, AI tools, schema, emails, CMS rollback safeguards  
**Premise:** MinRosh has no registered migration agent and no MARN.  
**Status:** Public-copy + CMS rollback safeguards pass complete on private staging. Awaiting **external legal review**. This is not legal advice and does **not** claim legal clearance.  
**Deploy:** Production untouched; private staging only.

| Location | Current wording/behaviour | Risk | Required action | Replacement/decision |
| --- | --- | --- | --- | --- |
| `data/site.json` `brand.marn` | `"Available on request"` | critical | Remove public MARN field/value | Drop `marn`; use `compliance` CMS block; never publish placeholder |
| `lib/seo.js` `businessJsonLd` | Emits `identifier` / `MARN ${marn}` when truthy | critical | Stop emitting fake MARN | Organization/ProfessionalService without MARN identifier |
| `app/layout.js` metadata | Default title “Migration Agent Brisbane…” | critical | Reword | General Migration Information & Education Support |
| `app/page.js` metadata | Title/keywords “migration agent Brisbane” | critical | Reword | Approved homepage SEO copy |
| `data/seo-pages.json` (contact, partner, SL, refusal, etc.) | “Contact Migration Agent…”, “our migration agents”, “registered migration guidance”, “Brisbane MARA” | critical | Reword all self-claims | Neutral information / education-support framing |
| `app/code-of-conduct/page.js` | Aligns MinRosh with OMARA Code / MAR 2026 as regulatee | critical | Reposition as referral/info page | Do not imply MinRosh is an OMARA-regulated practice |
| `app/immigration-news/[slug]/page.js` | “registered migration practice” | critical | Remove claim | Information service disclosure |
| `app/thank-you/page.js` | “registered migration team” | critical | Reword | General information / education support |
| `lib/contact.js` email copy | “registered migration agents” | critical | Reword | Information/education support team |
| `components/agent-registration-strip.jsx` | Implies OMARA registration / agent details | critical | Replace | Referral strip: Find a Registered Migration Agent |
| `components/content-page.js` | Shows “Registered Migration Agent / MARN” if env set | critical | Remove public badge | Future authorised mode only (disabled) |
| `data/site.json` hero/about/stats/services | Registered guidance, personalised strategies, lodgement prep | critical | Replace | Approved positioning + permitted service cards |
| `components/home-services-pathways.jsx` | “Registered migration guidance…” | critical | Reword | General information / education support |
| `components/smart-navigator.js` + `lib/navigator.js` | Personalised Visa Decision Engine, confidence scores, pathway recommendation | critical | Disable public engine | Official Information Finder (topic → official links) |
| `app/assessment/page.js` | Free Assessment / eligibility framing hosting navigator | high | Reposition | Official Information Finder host |
| `app/api/ai-funnel/route.js` + nurture AI | Personalised pathway analysis emails | high | Disable / neuter | No pathway result emails; restricted enquiry outcome |
| `lib/nurture-sequences-ai.js` | “Personalised Migration Pathway Analysis” | high | Reword/disable | General information follow-up only |
| `components/ai-concierge.js` + `app/api/chat/route.js` | Generative visa next-steps; can drift into assistance | high | Hard refusal boundary | Public-info + official links only; standard refusal |
| `app/book-consultation/page.js` | Strategy session / confidence-rated pathways | high | Reposition | General information / education-course enquiry |
| `components/contact-lead-form.js` | Consultation booking, resume upload, visa needs | high | Restrict types + acknowledgement | `general_information` / `education_enquiry` only; mandatory checkbox; no migration docs |
| `app/api/contact/route.js` | Server accepts consultation/visa categories | high | Server-side enforce | Reject prohibited categories; require acknowledgement |
| `components/destination-outcome-simulator.jsx` + JSON | Confidence / outcome simulator | high | Disable or neuter | Remove confidence/probability framing |
| `components/destination-confidence-strip.jsx` + JSON | Decision confidence metrics | high | Disable/reword | Informational only or hide |
| `components/destination-command-center.jsx` + JSON | Route confidence scores | high | Disable/reword | Informational only or hide |
| `data/home-pathway-future-pacing.json` | Fake confidence percentages | high | Remove | Neutral pacing copy or retire |
| `lib/quiz.js` + `app/api/quiz-results/route.js` | Points/eligibility scoring + email | high | Disable public scoring | Feature-flag off; no personalised result email |
| `app/tools/page.js` | Markets eligibility assessment / points wizard | high | Reword | Information tools / official-source finder |
| `data/crm-quotes.seed.json` | Case management until lodgement / application prep | high | Reword seeds | Education admissions / information support only |
| `app/education-consultation/page.js` | Education Consultation (may blur into visa strategy) | high | Rename + scope | Education Course Enquiry & Admissions Support |
| `components/home/home-hero-premium.jsx` | Pathway check CTA; “Honest advice” | high | Reword CTAs/copy | Explore General Information / Education Course Enquiry |
| `components/home/home-quiz-entry-section.jsx` | Assessment funnel | high | Reword or point to Information Finder | Topic navigation, not eligibility |
| Footer notice (`site-footer.jsx`) | Weak “personal circumstances…consultation” | medium | Replace | Full Important notice + referral links |
| About / meet-the-team / FAQ / mega-menu | Strategy, clients, right visa, lodgement language | medium | Reword | Neutral information terminology map |
| Lawyer vs agent guide SEO page | “best migration agent” keywords; educational | medium | Keep as referral education | Clarify MinRosh is not an RMA; drop self-ranking keywords |
| Schema types | ProfessionalService/LocalBusiness (ok) + MARN id (bad) | medium | Keep Organization/ProfessionalService | No MARN, award, OMARA membership |
| `e2e/smoke.spec.mjs` | Asserts “Migration Agent Brisbane” | medium | Update tests | Assert new compliant titles |
| Portal `/api/portal/*` | Invoices/profile; nurture links to `/dashboard` | medium | Review; no new visa-matter onboarding | Report for privacy/legal; disable migration-case onboarding if present |
| Glossary OMARA/MARA definitions | Educational | low | Keep | Educational / referral only |
| `data/tool-disclaimers.json` | Points to registered agent | low | Keep-as-referral | Strengthen with “MinRosh is not registered” |
| Disclaimer / terms pages | Partial mitigation | low | Strengthen | Full approved disclaimer content |
| `.env.example` `NEXT_PUBLIC_MARN` | Documents optional public MARN | low | Document future-only mode | Disabled by default; never set without real RMA |

## Behavioural claims (no exact keyword required)

| Surface | Behaviour | Risk | Decision |
| --- | --- | --- | --- |
| Smart Navigator | Personal answers → confidence, primary pathway, risks, timeline, email capture | critical | Disabled pending authorised review; replaced by Official Information Finder |
| AI Concierge | Applies migration knowledge to user facts | high | Hard refusal + system prompt rewrite |
| Booking / contact | Visa strategy sessions, document review, lodgement readiness | high | Restricted enquiry types only |
| Success stories with timelines/outcomes | Implies MinRosh delivered visa outcomes | medium | Soften or frame as illustrative education stories without lodgement claims |
| OMARA register link framed as “verify us” | Self-registration implication | critical | Label as Find a Registered Migration Agent (referral) |

## Final public-copy pass (2026-09-08)

Completed on private staging only. Not legal clearance.

### CMS rollback & publish safeguards

| Item | Status |
| --- | --- |
| `lib/compliance-publish-guard.js` | Contextual **block** + **warning** patterns; masks safe RMA referral snippets before matching |
| `lib/cms-content-restore.js` | `restorePublishHistoryEntryToDraft` (draft only); `assertCanPublishNewsCopy`; `canRestoreSnapshotDirectlyToPublic` |
| `POST /api/admin/intelligence/publish-history` | Supports `restore_to_draft` \| `restore` (never auto-publishes); default action remains emergency **unpublish** (`rollback`) |
| Admin news POST/PATCH | Gated by compliance validation |
| Admin success-stories POST/PATCH | Gated by compliance validation |
| `getHomeSiteData` | Forces `successStories: []` — admin success-stories store is **not** merged to public |
| `tests/cms-rollback-compliance.test.mjs` | Proves these cannot restore directly to public: “Migration Agent Brisbane”; “MARN Available on request”; “we assess your eligibility”; “we lodge your visa application” |

### Public content cleanup

| Item | Status |
| --- | --- |
| Destination sections, CTAs, howWeHelp, FAQs, seo-pages, news seed | Residual cleanup; no “Check eligibility” / “Free assessment” CTAs |
| `news-seed-001` (`migration-sri-lanka-australia-2026`) | Unpublished |
| `successStories` | Emptied; FEEDBACK carousel empty; no AggregateRating / Review schema |
| Pathway / personalised rules | Applied per approved positioning |
| Public “client” marketing | Scrubbed; protective legal / OMARA third-party uses retained (see client terminology inventory) |

### Invoices / mirrors / credentials (inventory only — historical records not modified)

| Item | Status |
| --- | --- |
| Invoice descriptions | Live in `data/invoices.json` (+ optional `invoices_mirror` / Supabase); tokenised portal billing only; new lines blocked via `lib/invoice/line-description-guard.js` |
| Google Sheets / Drive / Calendar | Env-driven; service-account access; retention left for legal/privacy |
| Credential rotation checklist | `data/admin-credential-rotation-checklist.json` + GET/PATCH `/api/admin/credential-rotation-checklist` — status only; all items still **pending** until admin confirms |

## Residual items for counsel / follow-up (post-implementation)

| Location | Issue | Risk | Status |
| --- | --- | --- | --- |
| Header / mega-menu / mobile tabs | “Book consultation” CTAs | medium | Reworded; booking route redirected to `/book-information-session` |
| `data/contact-readiness-signals.json` | Clients / success / strategy wording | medium | Rewritten |
| Destination Command Center | Strategy / confidence UX | critical | Rebuilt as Destination Information Hub; route graph gated OFF |
| AI Concierge | Generative drift | high | **OFF by default** (`ENABLE_PUBLIC_AI_CHAT`); API 410; hard refusal + injection tests |
| Historical CRM/quiz/AI-funnel | Sensitive retention | high | Documented in `docs/no-marn-historical-data-inventory.md` — not deleted |
| Public migration upload portal | Visa docs/stages | high | OFF by default (`PUBLIC_MIGRATION_MATTER_PORTAL`) |
| Remaining “client” strings | Mixed internal/public | medium | Inventory in `docs/no-marn-client-terminology-inventory.md`; marketing scrubbed 2026-09-08 |
| CMS version rollback | Pre-compliance republish risk | high | **Mitigated 2026-09-08** — draft-only restore + publish guards (counsel may still review residual intentional referral matches) |

## Verification (local, continuation pass)

- Unit tests: includes CMS rollback compliance + staging robots / sheet-sync / contact telemetry tests
- Lint: run before commit
- Build: use `ACKNOWLEDGE_SHARED_RISK=1` when shared zones changed; unknown zones classified in `lib/zone-manifest.mjs` (prefer classification over `ACKNOWLEDGE_UNKNOWN_RISK`)
- Private staging: `SITE_ENVIRONMENT=staging` on `127.0.0.1:3001` only
- Screenshots: `docs/no-marn-compliance-screenshots/` and `docs/staging-no-marn-review/`
- **Nothing deployed to production**

## Staging review remediation (resolved)

| Issue | Status |
| --- | --- |
| Outdated 404 pathway/portal copy | Resolved |
| `/tools` personalised cards / estimator | Resolved — General Information Tools |
| PR pathway explorer personalised sequencing | Resolved — Permanent Migration Information Explorer |
| False `sheetSync: "ok"` | Resolved — accurate statuses; omitted from public API |
| Unclassified `data/*` zones | Resolved in zone-manifest |
| Staging noindex via untracked overlay | Resolved — `SITE_ENVIRONMENT=staging` |
| Credential exposure | Documented for admin rotation (not auto-rotated); checklist statuses still pending |

## Remaining items requiring external legal or privacy review

1. Historical CRM, quiz, AI-funnel, upload, and nurture records — retention, lawful basis, access hardening, and whether any fields must be redacted or quarantined (see historical-data inventory). **Do not auto-delete.**
2. Whether generative public AI may ever be re-enabled; if so, under what counsel-approved controls. Current default is OFF because safe generative enforcement cannot be guaranteed.
3. Testimonials / success stories — legal review before any republish (public store emptied; admin store not merged to homepage).
4. Historical invoice description wording — deferred to legal / accounting / privacy (forward-looking line guard only; do not modify historical records in this pass).
5. External Google Sheets / Drive / Calendar mirrors — access and retention review (env-driven; service account).
6. Administrator confirmation of credential rotation checklist (SMTP password, Google SA key, Google webhook secret, Maps API restrictions) — all still **pending**.
7. Residual keyword matches that are intentional RMA / OMARA referrals or protective legal phrasing — confirm framing remains appropriate.
8. Admin CRM “customer/client” naming and any residual adviser–client relationship framing in admin-only tools.
9. Lawyer-vs-agent educational SEO page and other pages that discuss RMAs in third-person — confirm referral-only presentation.
