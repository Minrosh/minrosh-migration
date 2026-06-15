# Shared zone

**Owner:** Code used by **both** public website and admin panel, or global framework.

## Physical layout (not moved — documented here)

| Path | Purpose |
|------|---------|
| `app/layout.js` | Root layout, metadata defaults |
| `middleware.js` | Maintenance, admin auth, CSP |
| `lib/csp/` | Content-Security-Policy builders |
| `lib/api/` | Shared API utilities |
| `lib/security/` | Security helpers |
| `lib/contact.js` | Contact form / email |
| `lib/env-validation.js` | Env parsing |
| `components/ui/` | Shared UI primitives (Button, Card, Input) |
| `components/hcaptcha-field.jsx` | Used by public forms |
| `next.config.mjs`, `package.json`, `scripts/` | Framework & deploy |

## Rules

- Any change here requires testing **both** public and admin.
- Run `npm run check:sync -- --acknowledge-shared-risk` only after both pass.
- Do not scope marketing-only CSS globally — admin uses `app/admin/admin.css`.

## Test after changes

Public **and** admin smoke tests (see `docs/ADMIN_PUBLIC_SEPARATION.md`).
