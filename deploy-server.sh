#!/usr/bin/env bash
# Ubuntu server: pull, build, PM2 reload, flush logs (see scripts/update-server.sh).
# From repo root (avoids pasting long chained commands without &&):
#   cd ~/minrosh-migration && ./deploy-server.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
exec bash "$ROOT/scripts/update-server.sh" "$ROOT"
