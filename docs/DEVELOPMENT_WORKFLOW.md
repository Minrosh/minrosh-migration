# Development workflow (MinRosh Migration)

Step-by-step guide for safe changes to the public website or admin panel inside one repository.

## Daily workflow

1. **Pull latest** from `main` before starting work.
2. **Run the dev server:** `npm run dev` → http://localhost:3100
3. **Make focused edits** in the correct zone (see `docs/ADMIN_PUBLIC_SEPARATION.md`).
4. **Before committing**, run:
   ```bash
   npm run check:sync
   npm run lint
   npm run build
   ```
5. **Manual smoke test** the areas you touched (public and/or admin).
6. **Commit and push only when you explicitly want to** — do not deploy unless requested.

## Asking Cursor / Codex to edit **public website only**

Include instructions like:

> Edit only the public website zone: `app/` pages (not `app/admin/`), `components/home/`, `components/site-*`, public APIs under `app/api/` (not `app/api/admin/`). Do not change `middleware.js`, `app/layout.js`, or `lib/admin/` unless required. Run homepage + contact smoke test.

## Asking Cursor / Codex to edit **admin panel only**

> Edit only the admin zone: `app/admin/`, `app/api/admin/`, `components/admin/`, `lib/admin/`. Do not change marketing pages, homepage hero, or `app/home.css`. Test `/admin/login` and `/admin` after changes.

## QA commands

| Command | Purpose |
|---------|---------|
| `npm run check:sync` | Warn when public/admin/shared zones change together |
| `npm run lint` | ESLint (Next.js) |
| `npm run build` | Production build (runs `prebuild` → sync check) |
| `npm run qa` | lint + build |
| `npm run test:unit` | Vitest unit tests |
| `npm run test:e2e` | Playwright (when configured) |

## Avoid breaking the live website

- Do **not** commit, push, or run deploy scripts unless the owner asks.
- Do **not** change homepage hero baseline (`components/home/home-hero-premium.jsx`, `app/home.css`) without an explicit audit.
- Do **not** remove SEO metadata, routes, or forms without approval.
- Use maintenance mode on the server only when planned (`npm run maintenance:on` / `off`).
- After deploy, verify HTML with `npm run verify:deploy-html` (see `docs/POST-DEPLOY-VERIFY.md`).

## GitHub rules

- Work on `main` or feature branches; open PRs for large changes when possible.
- Never force-push `main`.
- Never commit `.env` or secrets.
- Use `npm run check:sync -- --acknowledge-shared-risk` only after you have tested **both** surfaces.

## Admin login troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Stuck on “Loading dashboard…” | API 401 while UI loaded without session; sign in at `/admin/login` |
| Login returns “Invalid password” | `ADMIN_PASSWORD` in `.env` does not match `data/admin-auth.json` — see `.env.example` |
| Login returns session signing error | Set `ADMIN_SESSION_SECRET` (≥24 random chars): `npm run generate:admin-session-secret` |
| Admin blank page in production | CSP blocking scripts — check browser console on `/admin` |

## Project structure reference

```
app/                    # Next.js routes (public + admin)
app/admin/              # Admin panel pages
app/api/admin/          # Admin APIs
components/admin/       # Admin UI
components/home/        # Public homepage
lib/admin/              # Admin server logic
lib/zone-manifest.mjs   # Zone classifier for sync script
features/               # Zone README pointers (logical separation)
scripts/check-public-admin-sync.mjs
docs/ADMIN_PUBLIC_SEPARATION.md
```
