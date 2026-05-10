# Deploy Checklist

## Deploy
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
