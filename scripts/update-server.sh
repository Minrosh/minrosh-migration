#!/usr/bin/env bash
# Single entrypoint for Ubuntu: pull + install + build + PM2 reload (via deploy-ubuntu.sh), then flush logs.
# Avoids pasted one-liners like "cd ~/minrosh-migrationgit pull..." missing && or newlines.
#
# Usage (on server):
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
cd "$ROOT"
echo "==> update-server: ROOT=$ROOT"
bash "$ROOT/scripts/deploy-ubuntu.sh" "$ROOT"
pm2 flush minrosh-next || true
echo "==> update-server: done"
