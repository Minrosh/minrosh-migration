# Post-deploy verification

Run these checks after `bash scripts/update-server.sh` completes successfully (or after any manual deploy).

## Server / origin checks

From the production host (or any machine that can reach origin and public URL):

```bash
curl -I https://minroshmigration.com.au/
curl -s https://minroshmigration.com.au/ | grep -i "Preparing your migration portal" || echo "OK: no stuck loader text"
curl -s https://minroshmigration.com.au/ | grep -oE '/_next/static/css/[a-z0-9]+\.css' | sort -u
curl -s http://127.0.0.1:3000/ | grep -oE '/_next/static/css/[a-z0-9]+\.css' | sort -u
pm2 status
npm run reindex:verify
npm run verify:live-roadmap
```

Optional scripted HTML/CSS compare (same logic as `update-server.sh`):

```bash
npm run verify:deploy-html
```

## Browser / service worker / cache reset

Stale HTML, CSS, or service workers can cause a white screen or stuck “Preparing your migration portal” loader even when origin is healthy.

1. Visit **https://minroshmigration.com.au/?sw=reset** once (unregisters service workers and clears caches).
2. Hard refresh: **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (macOS).
3. Confirm in an **incognito/private** window.

## Expected outcomes

| Check | Pass |
|-------|------|
| `curl -I` public homepage | `HTTP/2 200` (or `200`), no long `immutable` cache on HTML |
| Loader grep | Prints `OK: no stuck loader text` |
| Origin vs public CSS hashes | Same list from both `curl` greps |
| `pm2 status` | `minrosh-next` **online** |
| `reindex:verify` / `verify:live-roadmap` | Exit 0 |

## If something fails

- **Origin OK, public stale:** run `npm run purge:cdn` (requires `CLOUDFLARE_*` in `.env`), then re-run `npm run verify:deploy-html`.
- **PM2 not online:** `bash scripts/update-server.sh` or `pm2 delete minrosh-next && pm2 start ecosystem.config.js && pm2 save`.
- **Maintenance still on:** check `MAINTENANCE_MODE` in `.env` and `maintenance.lock` in app root.

See also [deploy-checklist.md](./deploy-checklist.md) and [CLOUDFLARE-DEPLOYMENT-RUNBOOK.md](./CLOUDFLARE-DEPLOYMENT-RUNBOOK.md).
