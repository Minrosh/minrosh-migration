#!/usr/bin/env bash
# Run on the Ubuntu server from your project root (e.g. ~/minrosh-migration).
# Prerequisites: Node 20+, PM2, git, and .env with ADMIN_SESSION_SECRET (required), ADMIN_PASSWORD or bcrypt auth, SMTP_*, etc.
#
# Prefer one command (pull/build/PM2 + log flush) so pasted lines are not concatenated:
#   cd ~/minrosh-migration && ./deploy-server.sh
#   bash scripts/update-server.sh
#
# Git: pulls origin/$DEPLOY_GIT_BRANCH (default: main). Example staging from develop:
#   DEPLOY_GIT_BRANCH=develop ./scripts/deploy-ubuntu.sh

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
  DEPLOY_GIT_BRANCH="${DEPLOY_GIT_BRANCH:-main}"
  echo "==> Fetch & fast-forward origin/${DEPLOY_GIT_BRANCH} (override with DEPLOY_GIT_BRANCH=…, or DEPLOY_SKIP_GIT_PULL=1)"
  git fetch origin "$DEPLOY_GIT_BRANCH"
  git checkout "$DEPLOY_GIT_BRANCH"
  git pull --ff-only origin "$DEPLOY_GIT_BRANCH"
fi

if [[ ! -f "$ROOT/.env" ]]; then
  echo "ERROR: $ROOT/.env is missing. Create it (see .env.example) before deploy."
  exit 1
fi

echo "==> Preflight secret checks (before install/build)"
# Cookie HMAC requires ADMIN_SESSION_SECRET (never ADMIN_PASSWORD). Edge middleware cannot sign cookies without it.
if ! grep -qE '^ADMIN_SESSION_SECRET=.' "$ROOT/.env"; then
  echo ""
  echo "ERROR: $ROOT/.env must set ADMIN_SESSION_SECRET (non-empty) for admin session cookie signing."
  echo "  This is separate from ADMIN_PASSWORD — use a long random value, not your login password."
  echo ""
  echo "  Fix on this server:"
  echo "    1) Generate a secret, e.g.:"
  echo "         cd \"$ROOT\" && node scripts/generate-admin-session-secret.mjs"
  echo "       (or: openssl rand -base64 48)"
  echo "    2) Add one line to $ROOT/.env (or fix an empty ADMIN_SESSION_SECRET= line):"
  echo "         ADMIN_SESSION_SECRET=<paste output, no spaces>"
  echo "    3) Re-run: bash scripts/update-server.sh"
  echo ""
  echo "  Note: changing this value invalidates existing admin cookies — sign in again after deploy."
  echo ""
  exit 1
fi
if ! grep -qE '^NURTURE_CRON_SECRET=.' "$ROOT/.env"; then
  echo "WARNING: NURTURE_CRON_SECRET unset or empty — /api/cron/nurture will reject requests until set."
fi
if ! grep -qE '^GOOGLE_FORM_WEBHOOK_SECRET=.' "$ROOT/.env"; then
  echo "WARNING: GOOGLE_FORM_WEBHOOK_SECRET unset or empty — Google Form webhook will reject until set."
fi
if ! grep -qE '^INTELLIGENCE_CRON_SECRET=.' "$ROOT/.env"; then
  echo "WARNING: INTELLIGENCE_CRON_SECRET unset or empty — POST /api/cron/intelligence-scan will reject; daily digest cron cannot run until set (see scripts/intelligence-daily-cron.sh)."
fi

echo "==> Install & build"
npm ci
# Fail fast if critical brand/hero assets are missing or placeholder-sized.
node scripts/verify-required-assets.mjs
npm run build

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

if [[ "${SKIP_REINDEX_VERIFY:-}" == "1" ]]; then
  echo "==> Skipping reindex:verify (SKIP_REINDEX_VERIFY=1)"
else
  echo "==> Crawl signal check (/, /sitemap.xml, /robots.txt). Override base: SITE_URL=https://… npm run reindex:verify"
  (cd "$ROOT" && npm run reindex:verify) || echo "WARNING: reindex:verify failed (network, DNS, or SITE_URL). See docs/SEARCH-CONSOLE-REINDEX.md"
fi

echo "==> Done. Keep SMTP_*, ADMIN_SESSION_SECRET, ADMIN_PASSWORD, etc. in $ROOT/.env — PM2 loads them from ecosystem.config.js."
echo "==> After deploy: if forms show Server Action errors, hard-refresh the site (Ctrl+Shift+R) so the browser loads new /_next/static chunks."
echo "==> SEO: submit/refresh sitemap + Request indexing for priority URLs in Google Search Console — docs/SEARCH-CONSOLE-REINDEX.md"
