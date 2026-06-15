# Public website vs admin panel separation

This repository is a **single Next.js 15 App Router** application. Public and admin are
separated by **folder zones** inside one repo — not separate deployables — so URLs and
SEO stay unchanged.

## Zone map

| Zone | Canonical paths | Legacy / route paths |
|------|-----------------|----------------------|
| **Admin** | `features/admin-panel/components/`, `lib/admin/` | `app/admin/`, `app/api/admin/`, `components/admin/` (re-exports) |
| **Public** | `features/public-site/components/`, `components/home/`, `components/site-*` | `app/` pages (non-admin) |
| **Shared** | `middleware.js`, `app/layout.js`, `lib/csp/`, `components/ui/` | See `features/shared/README.md` |

Classifier source: `lib/zone-manifest.mjs`  
Safety script: `npm run check:sync` → `scripts/check-public-admin-sync.mjs`

## Route ownership (URLs unchanged)

| URL prefix | Owner |
|------------|--------|
| `/`, `/contact`, `/destinations`, `/immigration-news`, `/assessment`, `/tools`, guides | Public |
| `/admin`, `/admin/*` | Admin |
| `/api/admin/*` | Admin |
| `/api/contact`, `/api/quiz-results`, most other `/api/*` | Public or shared |

## What not to move

- `app/admin/` route folders — URLs depend on them
- `app/api/admin/` handlers — keep paths stable
- `middleware.js`, `app/layout.js` — high risk; change only with full QA
- `components/home/home-hero-premium.jsx`, `app/home.css` — hero baseline (see `docs/HOMEPAGE-CONTENT-SAFE-REDESIGN-CHECKLIST.md`)

## Import rules

1. **New admin UI** → `features/admin-panel/components/`
2. **New public UI** → `features/public-site/components/` or existing `components/home/`, `components/site-*`
3. **Shared UI** → `components/ui/` or document in `features/shared/`
4. Legacy `@/components/admin/*` imports still work via re-export shims

## Sync-check script

```bash
npm run check:sync
```

| Change type | Exit code | Action |
|-------------|-----------|--------|
| Public only | 0 | Warn + test public routes |
| Admin only | 0 | Warn + test admin routes |
| Shared | 1 | Test **both** zones, then `--acknowledge-shared-risk` |
| Unknown | 1 | Classify in `zone-manifest.mjs` or `--acknowledge-unknown-risk` |

```bash
npm run check:sync -- --acknowledge-shared-risk   # after testing both surfaces
ACKNOWLEDGE_SHARED_RISK=1 npm run build           # deployment / CI only when appropriate
```

`prebuild` runs `check:sync` — production deploy sets `ACKNOWLEDGE_SHARED_RISK=1` after tree reset (see `scripts/deploy-ubuntu.sh`).

## How to test

### Public website

```bash
npm run dev   # http://localhost:3100
```

- `/` — homepage
- `/contact` — contact form
- `/assessment` — Smart Navigator
- `/destinations/australia` — country page
- `/skilled-migration` — service page
- Mobile menu

### Admin panel

- `/admin/login` — sign in
- `/admin` — dashboard (must not stay on “Loading…”)
- `/api/admin/health` — health check
- `/api/admin/stats` — dashboard data

**Local dev:** `localhost` may bypass admin session (`lib/admin/dev-bypass.js`). Production requires `ADMIN_SESSION_SECRET` and password auth.

## GitHub workflow

1. Pull `main`
2. Edit one zone when possible
3. `npm run check:sync` → `npm run lint` → `npm run build`
4. Manual smoke (public and/or admin)
5. Commit when ready — never commit `.env`
6. Push → deploy with `bash scripts/update-server.sh` only when owner approves

See also: `docs/DEVELOPMENT_WORKFLOW.md`, `docs/POST-DEPLOY-VERIFY.md`
