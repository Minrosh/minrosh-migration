# Phase 00 — Admin / CRM risk register

Redesign work that only “touches the public site” can still break admin/CRM via shared files or lead-intake contracts.

## Severity legend

- **High** — likely auth, data loss, or compliance publish failure  
- **Medium** — degraded CRM ops or broken conversion → lead path  
- **Low** — cosmetic or deferred

## Risk register

| ID | Risk | Severity | Why | Guard |
| --- | --- | --- | --- | --- |
| CRM-01 | Edit `middleware.js` while restyling | High | Admin session gate + CSP + maintenance live here | Public-only CSS/components; dual smoke `/admin/login` + `/api/admin/health` |
| CRM-02 | Change `app/layout.js` / root metadata template | High | Affects admin shell + SEO suffix behaviour | Prefer page-level metadata; re-test admin dashboard load |
| CRM-03 | Broad `app/globals.css` rewrite | High | Admin + public share tokens; history of header/main padding bugs (ISS-023) | Scope selectors; never restyle `.admin-root` (see `.cursorrules`) |
| CRM-04 | Break contact / booking form field contracts | High | Leads, acknowledgements, restricted categories (compliance) | Keep `app/api/contact` schema; run contact E2E |
| CRM-05 | Rename booking URL without CRM/email updates | High | Nurture, Stripe return URLs, AI CTAs still use `/book-consultation` on `main` | Inventory all hrefs; update APIs/emails together (later phase) |
| CRM-06 | Touch `lib/contact.js` mail transport | High | Shared by contact, nurture, newsletter, broadcast | Admin broadcast smoke after any change |
| CRM-07 | Disable or rewrite quiz-results without admin awareness | Medium | Lead scoring / interactions | Feature-flag; keep API shape |
| CRM-08 | CMS publish guard bypass on redesign copy | High (compliance branch) | Banned RMA/MARN phrases can republish | Keep `lib/compliance-publish-guard.js` behaviour |
| CRM-09 | Success-stories / news public merge | Medium | Compliance forces empty public success stories | Do not re-wire admin store onto homepage casually |
| CRM-10 | Portal / upload / payments redesign side effects | High | PII + billing | Leave `app/api/portal/*`, upload, Stripe alone unless tasked |
| CRM-11 | `ACKNOWLEDGE_SHARED_RISK` habit | Medium | Hides zone-sync failures | Run `npm run check:sync`; classify zones |
| CRM-12 | Localhost admin bypass mistaken for prod auth | Medium | `lib/admin/dev-bypass.js` | Never treat local bypass as security proof |
| CRM-13 | Invoice line-description / historical CRM data | Medium | Compliance inventory leaves historical records | Do not bulk-delete CRM data in redesign |
| CRM-14 | Admin CSS (`app/admin/admin.css`) overridden by marketing CSS | High | Known product default | Scope marketing CSS away from `.admin-root` |

## Shared files (treat as dual-zone)

Per `docs/ADMIN_PUBLIC_SEPARATION.md`:

- `middleware.js`, `app/layout.js`, `components/ui/**`, `lib/csp/**`  
- Classifier: `lib/zone-manifest.mjs`  
- Safety: `npm run check:sync`

## Must-not-break smoke list (for later phases)

1. `/admin/login` → authenticated `/admin` (not stuck on Loading…)  
2. `GET /api/admin/health`  
3. `GET /api/admin/stats` with session  
4. Create lead via `/contact` (and booking path) → visible in `/admin/leads`  
5. Admin news draft save (and compliance publish guard on compliance tree)  
6. Public homepage + one destination + `/assessment` still 200  

## Phase 00 action

None. Register only — no code changes.
