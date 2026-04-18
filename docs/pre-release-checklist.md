# Pre-release checklist

Run before `npm run build`, merge to default branch, or [`scripts/deploy-ubuntu.sh`](../scripts/deploy-ubuntu.sh).

## 1. Change review (required)

Automated helper (non-destructive):

```bash
npm run prebuild:verify
```

Or manually:

- `git status -sb` — correct branch; no surprise secrets (`.env`, `.secrets/`).
- `git diff --stat` — skim every changed path.
- Untracked `??` files — commit, ignore, or remove; do not deploy a machine with orphan half-features unintentionally.
- `public/assets/minrosh-email-brochure.pdf` — build regenerates it; commit only if you intend to ship the new bytes.

## 2. Build (required)

```bash
npm run build
```

Fix compile and type errors; treat ESLint **errors** as blockers; warnings triage as needed.

## 3. URL / SEO spot-check (recommended)

- Run **`npm run reindex:verify`** after deploy (HEAD-checks `/`, `/sitemap.xml`, `/robots.txt`). See [`docs/SEARCH-CONSOLE-REINDEX.md`](SEARCH-CONSOLE-REINDEX.md) for **Google Search Console** steps (sitemap submit + URL Inspection → Request indexing).
- Open [`app/sitemap.js`](../app/sitemap.js) output locally or hit `/sitemap.xml` after deploy.
- Confirm no intended **404** on previously indexed paths (use crawler or manual list from [`content-contract.md`](content-contract.md)).
- Any removed or renamed public URL → add **permanent** redirect in [`next.config.mjs`](../next.config.mjs).

## 4. Environment and secrets (production)

- Admin: `ADMIN_SESSION_SECRET` (required for cookie signing); `ADMIN_PASSWORD` or `data/admin-auth.json` for login only (see `.env.example`). Generate: `npm run generate:admin-session-secret`.
- Cron/webhooks you use: `NURTURE_CRON_SECRET`, `GOOGLE_FORM_WEBHOOK_SECRET`, invoice/Facebook secrets if those routes are enabled.
- `deploy-ubuntu.sh` preflight: session + optional nurture/google warnings per script.

## 5. Deploy

- From server project root: `bash scripts/deploy-ubuntu.sh` (or `DEPLOY_SKIP_GIT_PULL=1` only when you intentionally deploy the current tree without `git pull`).
- Confirm PM2 app online and smoke-test `/`, `/contact`, one destination hub.

## 6. Content contract

- If routes or stable data files changed, update [`docs/content-contract.md`](content-contract.md).
