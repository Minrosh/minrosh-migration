# Cloudflare + Deployment Runbook

This runbook keeps deploys smooth and avoids generic Cloudflare error pages.

## 1) Use maintenance mode during upgrades

- Preferred command:
  - `npm run deploy:update`
- Manual maintenance controls:
  - `npm run maintenance:on`
  - `npm run maintenance:off`
  - `npm run maintenance:status`

Notes:
- `scripts/update-server.sh` already toggles maintenance mode around build/reload.
- The app middleware rewrites non-admin/non-API traffic to `/maintenance` when `MAINTENANCE_MODE=true`.

## 2) Cloudflare dashboard settings

Set these once in Cloudflare:

1. **Origin Error Page Pass-through**
   - Enable pass-through so origin maintenance/error responses are shown instead of generic Cloudflare 5xx pages.

2. **Always Online**
   - Enable to serve cached pages when origin is temporarily unavailable.

3. **Cache Rules**
   - Add a rule for static assets:
     - Match paths like `/_next/static/*`, `/images/*`, and other immutable static assets.
     - Set a generous Edge Cache TTL.
   - Add a rule for origin error pass-through on HTML requests if your plan supports it.

4. **Do not cache dynamic form/API routes**
   - Exclude `/api/*`, `/admin/*`, and form endpoints from edge caching.

## 3) Deployment workflow recommendation

- Use one command in production:
  - `npm run deploy:update`
- This script already:
  - runs pre-upgrade checks/backups
  - enables maintenance mode
  - pulls/builds/reloads PM2
  - disables maintenance mode on success
  - leaves maintenance mode on if deploy fails

## 4) UX/Conversion guidance applied in-app

- Keep one primary CTA in hero sections where possible.
- Keep Smart Navigator as advisory:
  - readiness labels (Low/Medium/High) instead of raw confidence numbers
  - visible disclaimer explaining it is not official eligibility determination

## 5) Post-deploy checks

After each deploy:

1. Hard refresh client cache (`Ctrl+Shift+R`) if UI chunks changed.
2. Verify:
   - `/`
   - `/assessment`
   - `/book-consultation`
3. Check Search Console crawl signals:
   - `/robots.txt`
   - `/sitemap.xml`
