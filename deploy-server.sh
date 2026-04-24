#!/usr/bin/env bash
# Ubuntu server: pull, maintenance-mode toggle, build, PM2 reload, flush logs (see scripts/update-server.sh).
# From repo root (avoids pasting long chained commands without &&):
#   cd ~/minrosh-migration && ./deploy-server.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
echo "==> deploy-server: repo=$ROOT (also: npm run deploy:server from this directory)"
exec bash "$ROOT/scripts/update-server.sh" "$ROOT"
