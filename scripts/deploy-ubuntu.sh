#!/usr/bin/env bash
# Run on the Ubuntu server from your project root (e.g. ~/minrosh-migration).
# Prerequisites: Node 20+, PM2, git, and a .env or exported vars with ADMIN_PASSWORD, SMTP_*, etc.

set -euo pipefail

ROOT="${1:-$HOME/minrosh-migration}"
cd "$ROOT"

echo "==> Pull latest (optional — comment out if you deploy without git)"
git pull origin main

echo "==> Install & build"
npm ci
npm run build

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
