# Development workflow (MinRosh Migration)

Simple guide for safe changes to the **public website** or **admin panel** in one repository.

## Before you start

```bash
git pull origin main
npm run dev    # http://localhost:3100
```

## Which folder should I edit?

| I want to change… | Edit these zones |
|-------------------|------------------|
| Homepage, contact, service pages | `app/` (not admin), `components/home/`, `components/site-*`, `features/public-site/` |
| Admin dashboard, CRM, invoices | `app/admin/`, `app/api/admin/`, `features/admin-panel/components/`, `lib/admin/` |
| Login, security, CSP, layout | **Shared** — `middleware.js`, `app/layout.js`, `lib/csp/` — test **both** surfaces |

Full map: `docs/ADMIN_PUBLIC_SEPARATION.md`

## Asking Cursor to edit **public only**

> Edit only the public website zone. Do not change `app/admin/`, `lib/admin/`, or `middleware.js` unless required. Do not change homepage hero baseline. Test `/`, `/contact`, `/assessment`.

## Asking Cursor to edit **admin only**

> Edit only the admin zone: `app/admin/`, `app/api/admin/`, `features/admin-panel/components/`, `lib/admin/`. Do not change marketing pages or `app/home.css`. Test `/admin/login` and `/admin`.

## Asking Cursor to edit **shared** code

> This touches shared zone. Test public homepage AND admin dashboard. Run `npm run check:sync -- --acknowledge-shared-risk` only after both pass.

## Before every commit

```bash
npm run check:sync
npm run lint
npm run build
```

If `check:sync` fails on **shared** changes:

1. Test public routes (/, /contact, /assessment)
2. Test admin (/admin/login, /admin, /api/admin/health)
3. Then: `npm run check:sync -- --acknowledge-shared-risk`

## When to commit / push / deploy

| Step | Who decides |
|------|-------------|
| Commit | When you are happy with local tests |
| Push to GitHub | When you want the server to pull changes |
| Deploy (`bash scripts/update-server.sh`) | **Owner only** — never deploy without asking |

Never commit: `.env`, `.env.local`, secrets, `.next/`, `node_modules/`

## QA command reference

| Command | Purpose |
|---------|---------|
| `npm run check:sync` | Zone safety gate |
| `npm run lint` | ESLint |
| `npm run build` | Production build (runs check:sync in prebuild) |
| `npm run test:unit` | Unit tests |
| `npm run test:e2e` | Playwright |
| `npm run verify:deploy-html` | Post-deploy HTML/CSS check |

## Avoid breaking the live site

- Do not remove routes or SEO metadata
- Do not publish MARN numbers
- Do not change visual design without approval
- After deploy: `docs/POST-DEPLOY-VERIFY.md`

## Project structure (after zone separation)

```
app/                              # Next.js routes (URLs stay here)
app/admin/                        # Admin routes
app/api/admin/                    # Admin APIs
features/admin-panel/components/  # Admin UI (canonical)
components/admin/                 # Re-exports → features/admin-panel
features/public-site/components/  # Public-only components
components/home/                  # Homepage sections
lib/admin/                        # Admin server logic
lib/zone-manifest.mjs             # Zone classifier
scripts/check-public-admin-sync.mjs
```
