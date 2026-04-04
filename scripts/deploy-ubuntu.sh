#!/usr/bin/env bash
# Run on the Ubuntu server from your project root (e.g. ~/minrosh-migration).
# Prerequisites: Node 20+, PM2, git, and a .env or exported vars with ADMIN_PASSWORD, SMTP_*, etc.

set -euo pipefail

ROOT="${1:-$HOME/minrosh-migration}"
cd "$ROOT"

if [[ -f "$HOME/package-lock.json" ]] && [[ "$HOME" != "$ROOT" ]]; then
  echo "!!! WARNING: $HOME/package-lock.json exists."
  echo "    Next.js may treat ~ as the app root and break standalone (PM2: Cannot find module .../server.js)."
  echo "    Fix: remove or rename ~/package-lock.json (and ~/package.json) unless you really keep a Node project in HOME."
  echo ""
fi

echo "==> Pull latest (optional — comment out if you deploy without git)"
git pull origin main

echo "==> Install & build"
npm ci
npm run build

if [[ ! -f "$ROOT/.next/standalone/server.js" ]]; then
  echo "ERROR: $ROOT/.next/standalone/server.js is missing after build."
  echo "  Often caused by a stray package-lock.json in \$HOME — see warning above."
  exit 1
fi

echo "==> Writable private uploads (app + standalone copy)"
mkdir -p storage/uploads .next/standalone/storage/uploads
chmod -R u+rwX storage/uploads
chmod -R u+rwX .next/standalone/storage/uploads || true

echo "==> Writable runtime data under standalone (enquiries, customers, invoices, …)"
mkdir -p .next/standalone/data
chmod -R u+rwX .next/standalone/data

echo "==> Restart PM2 (loads env from your shell if you exported vars first)"
pm2 restart ecosystem.config.js --update-env

echo "==> Done. Tip: set secrets with export ADMIN_PASSWORD=... before pm2, or use pm2 ecosystem env_file."
