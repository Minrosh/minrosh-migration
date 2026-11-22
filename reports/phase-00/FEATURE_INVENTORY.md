# Phase 00 — Existing feature inventory

Public and admin features that a redesign must keep operational unless a later phase explicitly retires them with approval.

## Public marketing & conversion

| Feature | Primary routes / files | Notes |
| --- | --- | --- |
| Premium homepage | `/`, `components/home/home-hero-premium.jsx`, `app/home.css` | Hero baseline locked |
| Destination hubs | `/destinations/[slug]`, sections | AU/CA/UK/NZ |
| Service landings | skilled, student, partner, employer, visitor, Sri Lanka, healthcare, over-25 | |
| Guide / SEO articles | `*-guide` pages + `data/seo-pages.json` | |
| Popular / global / visa hubs | `/popular-routes`, `/global-pathways`, `/visa-services` | Overlap cluster |
| Official sources hub | `/australian-visas-official-sources` | |
| Contact enquiry | `/contact` → `app/api/contact` | CRM lead intake → enquiries + leads + customers |
| Booking / information session | `/book-consultation` (`main`) / `/book-information-session` (live) | **Drift**; same contact API + optional Stripe/calendar |
| Education enquiry | `/education-consultation` | Admissions support framing on live |
| Assessment / Information Finder | `/assessment`, `components/smart-navigator.js` | Repositioned on compliance; live lead path via `/api/ai-funnel` |
| CRM enquiry hub | `/admin/crm` → `/api/admin/enquiries` | Website form source of truth (`data/enquiries.json`) |
| Tools hub | `/tools` | |
| Student cost planner | `/tools/student-country-cost-planner` | Disclaimers required |
| PR pathway explorer | `/tools/pr-pathway-explorer` | Sequencing only |
| Immigration news | `/immigration-news`, `[slug]` | Admin CMS |
| Meet the team / about / FAQ / referral | respective pages | |
| Legal pages | privacy, disclaimer, terms, complaints, code-of-conduct | Keep disclosures |
| WhatsApp / phone CTAs | header, hero, contact | |
| Sticky mobile CTA / tab bar | `components/sticky-mobile-cta.jsx`, `site-mobile-tab-bar.jsx` | Mobile UX |
| AI concierge | `components/ai-concierge.js`, `app/api/chat` | Feature-flagged; off on compliance |
| Newsletter unsubscribe | `/newsletter/unsubscribe` | noindex |
| Thank-you | `/thank-you` | noindex |
| Maintenance page | `/maintenance` | middleware gate |
| Token upload | `/upload/[token]` | Portal; gated on compliance |

## Lead → CRM data flows

| Intake | API / storage | Admin surface |
| --- | --- | --- |
| Contact / booking forms | `app/api/contact`, optional Supabase mirror | Leads, inbox, customers |
| Quiz / finder results | `app/api/quiz-results` | Leads / interactions |
| AI funnel / nurture | `app/api/ai-funnel`, nurture libs | Automations / emails |
| Newsletter | newsletter libs | Stats / broadcast |
| Payments | `app/api/payments/*` | Invoices / quotes |
| Uploads | `app/api/upload/[token]/*` | Documents / customers |
| Webhooks | Google Form, Facebook comments | Inbox / leads |

## Admin / CRM module map

| Module | UI route | Typical APIs |
| --- | --- | --- |
| Dashboard | `/admin` | `/api/admin/stats`, health |
| Leads | `/admin/leads` | `/api/admin/leads` |
| Pipeline | `/admin/pipeline` | opportunities |
| CRM / insights | `/admin/crm`, `/admin/crm-insights` | interactions |
| Customers | `/admin/customers` | customers |
| Inbox | `/admin/inbox` | inbox |
| Quotes | `/admin/quotes` | quotes |
| Invoices | `/admin/invoices` | invoices + reminders/sync |
| Tasks | `/admin/tasks` | tasks |
| Automations | `/admin/automations` | automations |
| Intelligence / CMS | `/admin/intelligence`, `/admin/news` | publish history, news |
| Success stories | `/admin/success-stories` | stories (public merge gated on compliance) |
| Reports / audit / users | respective routes | reports, audit, users |

## Shared platform

- Auth: signed admin session cookie + middleware  
- CSP: public vs admin modes (`lib/csp`)  
- Zone sync: `lib/zone-manifest.mjs`, `npm run check:sync`  
- Observability: request IDs, runbooks in `docs/`
