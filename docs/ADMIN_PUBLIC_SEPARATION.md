# Public website vs admin panel separation

This repository is a **single Next.js 15 App Router** application. Public and admin code
are separated by **folder zones** (not separate deployables) so routes keep working and
build risk stays low.

## Where code lives

### Public website (`features/public-site/`)

- **Routes:** all `app/` pages except `app/admin/` (homepage, `/contact`, `/destinations/*`, `/immigration-news/*`, `/assessment`, service guides, etc.)
- **Components:** `components/home/`, `components/site-*`, marketing forms, Smart Navigator, immigration news UI
- **APIs:** `app/api/contact/`, `app/api/quiz-results/`, `app/api/chat/`, public news routes, etc.
- **Styles:** `app/globals.css`, `app/home.css`, page-level CSS

### Admin panel (`features/admin-panel/`)

- **Routes:** `/admin` and nested pages under `app/admin/(secure)/`
- **Login:** `/admin/login`
- **APIs:** all handlers under `app/api/admin/`
- **Components:** `components/admin/` (shell, dashboard, CRM panels)
- **Server logic:** `lib/admin/` (auth, sessions, CRM stores, invoices)
- **Styles:** `app/admin/admin.css` (scoped under `.admin-root`)

### Shared (`features/shared/`)

- **Root layout:** `app/layout.js` — fonts, metadata defaults, CSP nonce bootstrap
- **Middleware:** `middleware.js` — maintenance gate, admin session, CSP modes
- **UI kit:** `components/ui/`
- **Cross-cutting libs:** `lib/api/`, `lib/csp/`, `lib/security/`, `lib/contact.js`, `lib/env-validation.js`
- **Zone manifest:** `lib/zone-manifest.mjs` (used by sync script)

## Route map

| URL prefix | Owner |
|------------|--------|
| `/`, `/contact`, `/destinations`, `/immigration-news`, `/assessment`, `/tools`, service/country guides | Public |
| `/admin`, `/admin/*` | Admin |
| `/api/admin/*` | Admin |
| `/api/contact`, `/api/quiz-results`, most other `/api/*` | Public or shared |

## Files that need extra care

| File / area | Why |
|-------------|-----|
| `middleware.js` | Auth redirect + CSP for both surfaces |
| `app/layout.js` | Wraps all pages; public widgets gated via `components/public-site-widgets-gate.jsx` |
| `lib/csp/build-csp-header.js` | Public uses `unsafe-inline`; admin uses nonce + `strict-dynamic` |
| `lib/admin/session*.js` | Admin cookies; Edge middleware must use `ADMIN_SESSION_SECRET` only |
| `app/globals.css` | Marketing theme; admin uses `admin.css` under `.admin-root` |

## How to test

### Public website

```bash
npm run dev
```

- http://localhost:3100/ — homepage
- http://localhost:3100/contact — contact form
- http://localhost:3100/assessment — Smart Navigator
- http://localhost:3100/destinations/australia — sample country page
- http://localhost:3100/skilled-migration — sample service page

### Admin panel

- http://localhost:3100/admin/login — sign in
- http://localhost:3100/admin — dashboard (must not stay on “Loading…” indefinitely)
- http://localhost:3100/admin/crm — CRM enquiries

**Local dev note:** On `localhost`, middleware may allow `/admin` without a session (`lib/admin/dev-bypass.js`). API routes honour the same bypass so the dashboard can load data. In production you must sign in.

**Required env (production):** `ADMIN_SESSION_SECRET` (≥24 chars), `ADMIN_PASSWORD` or `data/admin-auth.json`, `NEXT_PUBLIC_SITE_URL`.

## Sync-check script

```bash
npm run check:sync
```

Detects staged, unstaged, and untracked files per zone. Shared changes exit with code 1 unless:

```bash
npm run check:sync -- --acknowledge-shared-risk
```

`prebuild` runs the sync check automatically.

## Before changing shared code

1. Run `npm run check:sync`
2. Run `npm run lint` and `npm run build`
3. Manually test homepage **and** `/admin`
4. If touching CSP or middleware, verify admin scripts hydrate (no blank admin UI)

See also `docs/DEVELOPMENT_WORKFLOW.md`.
