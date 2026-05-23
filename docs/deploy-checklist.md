# Deploy Checklist

## Preferred: `scripts/update-server.sh` (Ubuntu server)

Run **on the production host** from the app root (default `~/minrosh-migration`). Requires a real `.env` at `$ROOT/.env`. This is the safest single entrypoint: it toggles **maintenance mode**, runs `scripts/pre-upgrade.sh`, then `scripts/deploy-ubuntu.sh` (pull / install / build / PM2), optional CDN purge, HTTP smoke checks, then turns **maintenance off** on success. If any step fails, maintenance is left **ON** until you fix and redeploy.

```bash
cd ~/minrosh-migration && bash scripts/update-server.sh
```

- **Custom app root:** `bash scripts/update-server.sh /srv/minrosh-migration`
- **Branch override:** `DEPLOY_GIT_BRANCH=develop bash scripts/update-server.sh`
- **CDN purge (optional):** set `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN`, and optionally `CLOUDFLARE_PURGE_EVERYTHING=true` (see script header comments).

**Before you run it (human / owner steps — not automated in CI):**

1. **Commit and push** from your dev machine so `git pull` on the server matches the release you intend (dirty server trees cause noisy pulls and surprise merges).
2. **Supabase:** apply any pending SQL migrations **before** relying on new APIs (e.g. Web Push: `supabase/migrations/20260510120000_push_subscriptions.sql` via Supabase SQL editor or `supabase db push` when linked). `update-server.sh` does **not** run Supabase migrations.
3. **Server `.env`:** add or update variables there only (never commit secrets). For Web Push, see `.env.example` (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, optional `VAPID_SUBJECT`, `INTERNAL_PUSH_SUBSCRIPTION_JSON`, plus existing `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` if subscribe API is used).

**Alternative (manual steps):** if you are not using `update-server.sh`, the manual sequence below still applies.

## Manual deploy (without `update-server.sh`)

1. **Clean tree on the server (recommended):** before `git pull`, ensure the production checkout matches `origin/main` (no stray edits). Either commit and push from your laptop first, or on the server run `git status` and use `git stash push -u` (or discard with `git reset --hard origin/main` only if you are certain nothing local must be kept). A dirty tree makes `git pull` noisy and can hide real merge problems.
2. `git pull origin main`
3. `npm ci`
4. `npm run build`
5. `pm2 delete minrosh-next && pm2 start ecosystem.config.js && pm2 save`

## Immediate Smoke Checks
1. `curl -I http://127.0.0.1:3000/` returns `200`.
2. Admin login works.
3. Admin Integrations:
   - Required vars configured
   - Calendar/Sheets/Drive probes pass

## Feature Checks
1. Homepage:
   - Pathway map renders (no CSP block in browser console)
   - Reviews section renders or fallback trust cards show
2. Customer drawer:
   - “Open matching sheet row” opens sheet row when present
   - Missing row shows friendly not-found message
3. Webhook:
   - Authenticated call to `/api/webhooks/google-form` returns `{ ok: true }`
   - Duplicate payload returns `duplicate: true`
4. Nurture cron:
   - Authenticated call to `/api/cron/nurture` returns run stats
   - `processed/sent/suppressed/failed` counters are present

## If `.env` changed
- Always use `delete/start/save` PM2 cycle (not restart only).

## Web Push / `push_subscriptions` (optional feature)

- **Schema:** `subscription` is stored as **JSONB** (includes `keys.p256dh` and `keys.auth` inside the standard `PushSubscription` object). Separate columns for those keys are **not required** unless you want them for reporting-only queries; say so if you want a follow-up migration.
- **After deploy:** confirm `public/sw.js` updates in the browser (one hard refresh or `?sw=reset` once if a client sticks on an old service worker).

## Database migrations (general)

- **Application deploy** (`update-server.sh` / `deploy-ubuntu.sh`) updates Node code and PM2; it does **not** apply Postgres/Supabase DDL. Run migration SQL (or your Supabase CLI workflow) **in the database** as a deliberate step before or after code deploy, depending on whether the new code depends on the new tables.
