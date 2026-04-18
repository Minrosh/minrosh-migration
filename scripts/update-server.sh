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

set -euo pipefail
ROOT="${1:-$HOME/minrosh-migration}"
# If pre-upgrade or deploy fails, remove maintenance marker so the site is not left "stuck" in maintenance.
cleanup_on_fail() {
  rm -f "$ROOT/maintenance.lock" || true
}
trap cleanup_on_fail ERR
cd "$ROOT"
echo "==> update-server: ROOT=$ROOT"
echo "==> update-server: running pre-upgrade safety checks"
bash "$ROOT/scripts/pre-upgrade.sh" "$ROOT"
if ! bash "$ROOT/scripts/deploy-ubuntu.sh" "$ROOT"; then
  echo "==> update-server: deploy failed — clearing maintenance.lock" >&2
  rm -f "$ROOT/maintenance.lock" || true
  exit 1
fi
pm2 flush minrosh-next || true
rm -f "$ROOT/maintenance.lock" || true
echo "==> update-server: done"
