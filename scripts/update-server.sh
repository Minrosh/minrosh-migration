#!/usr/bin/env bash
# Single entrypoint for Ubuntu: safety checks, deploy-ubuntu.sh, then log flush.
#
# Usage (on server):
#   cd ~/minrosh-migration && ./deploy-server.sh
# Or:
#   bash ~/minrosh-migration/scripts/update-server.sh
#
# Optional custom root:
#   bash scripts/update-server.sh /srv/minrosh-migration
#
# Branch override (same as deploy-ubuntu.sh):
#   DEPLOY_GIT_BRANCH=develop bash scripts/update-server.sh
#
# Optional CDN purge (recommended for runtime/chunk incidents):
#   export CLOUDFLARE_ZONE_ID=...
#   export CLOUDFLARE_API_TOKEN=...
#   export CLOUDFLARE_PURGE_EVERYTHING=true
#   bash scripts/update-server.sh
#
# Maintenance mode is automated by scripts/deploy-ubuntu.sh:
#   - sets MAINTENANCE_MODE=true and reloads PM2 before build
#   - builds the new standalone app
#   - sets MAINTENANCE_MODE=false before booting the new app
#   - keeps maintenance ON when deploy fails

set -euo pipefail

ROOT="${1:-$HOME/minrosh-migration}"

cd "$ROOT"
echo "==> update-server: ROOT=$ROOT"

echo "==> update-server: running pre-upgrade safety checks"
bash "$ROOT/scripts/pre-upgrade.sh" "$ROOT"

if ! bash "$ROOT/scripts/deploy-ubuntu.sh" "$ROOT"; then
  echo "==> update-server: deploy failed" >&2
  exit 1
fi

if [[ -n "${CLOUDFLARE_ZONE_ID:-}" && -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  if [[ -f "$ROOT/scripts/purge-cdn.js" ]]; then
    echo "==> update-server: purging CDN cache via scripts/purge-cdn.js"
    (
      cd "$ROOT"
      npm run purge:cdn
    ) || echo "==> update-server: CDN purge failed (continuing deploy)"
  else
    echo "==> update-server: purge-cdn.js not found; skipping CDN purge"
  fi
else
  echo "==> update-server: CDN env vars not set; skipping CDN purge"
fi

echo "==> update-server: post-deploy HTTP smoke checks"
SMOKE_BASE="${SITE_URL:-https://minroshmigration.com.au}"
for path in "/" "/student-visa-australia" "/contact" "/assessment" "/book-consultation"; do
  code="$(curl -s -o /dev/null -w "%{http_code}" "${SMOKE_BASE}${path}?v=$(date +%s)" || true)"
  if [[ "$code" != "200" ]]; then
    echo "==> update-server: WARNING ${SMOKE_BASE}${path} returned HTTP ${code}"
  else
    echo "==> update-server: OK ${SMOKE_BASE}${path}"
  fi
done

rm -f "$ROOT/maintenance.lock" || true
pm2 flush minrosh-next || true

echo "==> update-server: done"
