#!/usr/bin/env bash
# Single entrypoint for Ubuntu: pull + install + build + PM2 reload (via deploy-ubuntu.sh), then flush logs.
# Avoids pasted one-liners like "cd ~/minrosh-migrationgit pull..." missing && or newlines.
#
# Usage (on server):
#   # Run this after every server-side change:
#   # bash ~/minrosh-migration/scripts/update-server.sh
#   cd ~/minrosh-migration && ./deploy-server.sh
# Or:
#   bash ~/minrosh-migration/scripts/update-server.sh
# Or from repo root:
#   bash scripts/update-server.sh
#
# Optional: same args as deploy — custom root
#   bash scripts/update-server.sh /srv/minrosh-migration
#
# Branch override (same as deploy-ubuntu.sh):
#   DEPLOY_GIT_BRANCH=develop bash scripts/update-server.sh
#
# Maintenance mode is automated by scripts/deploy-ubuntu.sh:
#   - sets MAINTENANCE_MODE=true and reloads PM2 before build
#   - builds and reloads app
#   - sets MAINTENANCE_MODE=false and reloads PM2 on success
#   - keeps maintenance ON when deploy fails
# Middleware keeps /api/* and /admin/* accessible while maintenance is ON.

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
rm -f "$ROOT/maintenance.lock" || true
pm2 flush minrosh-next || true
echo "==> update-server: done"
