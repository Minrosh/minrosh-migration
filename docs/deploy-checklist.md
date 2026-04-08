# Deploy Checklist

## Deploy
1. `git pull origin main`
2. `npm ci`
3. `npm run build`
4. `pm2 delete minrosh-next && pm2 start ecosystem.config.js && pm2 save`

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
