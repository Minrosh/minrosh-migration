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
# Working tree: commit/push from dev first so origin/main matches what you expect. If this
# checkout has local modifications, `git pull` will warn; resolve (stash/discard/commit) so
# deploys always track a known commit.
#
# Maintenance mode behavior for this script:
#   - force ON at the start of update-server.sh
#   - keep ON while pre-upgrade checks, git/build/deploy, CDN purge, and smoke checks run
#   - set OFF only at the very end on success
#   - keep ON when any step fails

set -euo pipefail

ROOT="${1:-$HOME/minrosh-migration}"
ENV_FILE="$ROOT/.env"

cd "$ROOT"
echo "==> update-server: ROOT=$ROOT"

set_env_value() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    printf "\n%s=%s\n" "$key" "$value" >> "$ENV_FILE"
  fi
}

reload_runtime_for_env() {
  pm2 delete minrosh-next || true
  if [[ ! -f "$ROOT/.next/standalone/server.js" ]]; then
    echo "WARN: $ROOT/.next/standalone/server.js missing — skip PM2 start until deploy builds standalone."
    return 0
  fi
  pm2 start ecosystem.config.js
  pm2 save
}

enable_maintenance_mode() {
  set_env_value "MAINTENANCE_MODE" "true"
  touch "$ROOT/maintenance.lock"
  echo "==> update-server: enabling maintenance mode"
  reload_runtime_for_env
}

disable_maintenance_mode() {
  set_env_value "MAINTENANCE_MODE" "false"
  rm -f "$ROOT/maintenance.lock" || true
  echo "==> update-server: disabling maintenance mode"
  reload_runtime_for_env
}

on_update_error() {
  trap - ERR
  echo "==> update-server: failure detected; maintenance mode remains ON" >&2
  set_env_value "MAINTENANCE_MODE" "true"
  touch "$ROOT/maintenance.lock"
  reload_runtime_for_env
  exit 1
}

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE is missing. Create it before running update-server.sh." >&2
  exit 1
fi

trap on_update_error ERR
enable_maintenance_mode

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

disable_maintenance_mode
pm2 flush minrosh-next || true

trap - ERR
echo "==> update-server: done"
