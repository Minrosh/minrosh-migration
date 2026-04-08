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

if [[ "${DEPLOY_SKIP_GIT_PULL:-}" == "1" ]]; then
  echo "==> Skipping git pull (DEPLOY_SKIP_GIT_PULL=1)"
else
  echo "==> Pull latest (optional — set DEPLOY_SKIP_GIT_PULL=1 if you deploy without git)"
  git pull origin main
fi

echo "==> Install & build"
npm ci
npm run build

if [[ ! -f "$ROOT/.env" ]]; then
  echo "ERROR: $ROOT/.env is missing."
  exit 1
fi

echo "==> Preflight secret checks"
# Session signing: explicit secret preferred; app also accepts ADMIN_PASSWORD (see lib/admin/session.js).
if ! grep -qE '^ADMIN_SESSION_SECRET=.' "$ROOT/.env" && ! grep -qE '^ADMIN_PASSWORD=.' "$ROOT/.env"; then
  echo "ERROR: Set ADMIN_SESSION_SECRET or ADMIN_PASSWORD in .env (non-empty value)."
  exit 1
fi
if ! grep -qE '^NURTURE_CRON_SECRET=.' "$ROOT/.env"; then
  echo "WARNING: NURTURE_CRON_SECRET unset or empty — /api/cron/nurture will reject requests until set."
fi
if ! grep -qE '^GOOGLE_FORM_WEBHOOK_SECRET=.' "$ROOT/.env"; then
  echo "WARNING: GOOGLE_FORM_WEBHOOK_SECRET unset or empty — Google Form webhook will reject until set."
fi

if [[ ! -f "$ROOT/.next/standalone/server.js" ]]; then
  echo "ERROR: $ROOT/.next/standalone/server.js is missing after build."
  echo "  Often caused by a stray package-lock.json in \$HOME — see warning above."
  exit 1
fi

if [[ ! -d "$ROOT/.next/standalone/.next/static" ]]; then
  echo "ERROR: $ROOT/.next/standalone/.next/static is missing (page will load with no CSS)."
  echo "  Use full npm run build (not next build alone) so copy-standalone-assets runs."
  exit 1
fi

echo "==> Writable private uploads (app + standalone copy)"
mkdir -p storage/uploads .next/standalone/storage/uploads
chmod -R u+rwX storage/uploads
chmod -R u+rwX .next/standalone/storage/uploads || true

echo "==> Writable runtime data under standalone (enquiries, customers, invoices, …)"
mkdir -p .next/standalone/data
chmod -R u+rwX .next/standalone/data

echo "==> Reload PM2 from ecosystem (.env merge guaranteed)"
pm2 delete minrosh-next || true
pm2 start ecosystem.config.js
pm2 save

echo "==> Done. Put SMTP_*, ADMIN_PASSWORD, etc. in $ROOT/.env — PM2 loads them from ecosystem.config.js."
