#!/usr/bin/env bash
set -euo pipefail

echo "After every code/content change on the server, run:"
echo ""
echo "  bash ~/minrosh-migration/scripts/update-server.sh"
echo ""
echo "This applies pre-upgrade safety checks, builds, and reloads PM2."
