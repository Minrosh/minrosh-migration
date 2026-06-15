#!/usr/bin/env bash
# Run on the Ubuntu server from your project root (e.g. ~/minrosh-migration).
# Prerequisites: Node >= 20.19 (see .nvmrc), PM2, git, and .env with ADMIN_SESSION_SECRET (required), ADMIN_PASSWORD or bcrypt auth, SMTP_*, etc.
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
ENV_FILE="$ROOT/.env"

set_env_value() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    printf "\n%s=%s\n" "$key" "$value" >> "$ENV_FILE"
  fi
}

pm2_exists() {
  pm2 describe minrosh-next >/dev/null 2>&1
}

reload_runtime_for_env() {
  echo "==> Reload runtime to apply env changes"
  # PM2 restart --update-env can reuse persisted env and miss fresh .env merges from ecosystem.config.js.
  # Always rebuild the process from ecosystem so MAINTENANCE_MODE changes are guaranteed.
  if [[ ! -f "$ROOT/.next/standalone/server.js" ]]; then
    echo "NOTE: Standalone server not present yet; this is normal before build. PM2 start will happen after build."
    return 0
  fi
  if pm2_exists; then
    pm2 delete minrosh-next
  fi
  pm2 start ecosystem.config.js
  pm2 save
}

disable_maintenance_mode() {
  set_env_value "MAINTENANCE_MODE" "false"
  reload_runtime_for_env
  echo "==> Maintenance mode disabled"
}

on_deploy_error() {
  trap - ERR
  echo "==> Deploy failed; keeping maintenance mode enabled so visitors see service status"
  set_env_value "MAINTENANCE_MODE" "true"
  reload_runtime_for_env
  echo "==> Maintenance mode remains enabled until a successful deploy clears it."
}

trap on_deploy_error ERR

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
  git fetch origin "refs/heads/${DEPLOY_GIT_BRANCH}:refs/remotes/origin/${DEPLOY_GIT_BRANCH}"
  git checkout "$DEPLOY_GIT_BRANCH"
  git merge --ff-only "origin/${DEPLOY_GIT_BRANCH}"
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ROOT/.env is missing. Create it (see .env.example) before deploy."
  exit 1
fi

sync_production_tree_to_head() {
  local dirty
  dirty="$(git status --porcelain 2>/dev/null || true)"
  if [[ -z "$dirty" ]]; then
    echo "==> deploy: git working tree clean at $(git rev-parse --short HEAD)"
    return 0
  fi
  echo "==> deploy: dirty working tree detected — resetting to HEAD before build"
  echo "$dirty" | head -25
  if [[ "$(echo "$dirty" | wc -l)" -gt 25 ]]; then
    echo "  … ($(echo "$dirty" | wc -l) entries total)"
  fi
  echo "==> deploy: git reset --hard HEAD (gitignored files such as .env are untouched)"
  git reset --hard HEAD
  echo "==> deploy: removing untracked files (gitignored paths are preserved)"
  git clean -fd
  dirty="$(git status --porcelain 2>/dev/null || true)"
  if [[ -n "$dirty" ]]; then
    echo "ERROR: working tree still dirty after reset — resolve manually, then re-run deploy." >&2
    echo "$dirty" >&2
    exit 1
  fi
  echo "==> deploy: tree clean at $(git rev-parse --short HEAD)"
}

sync_production_tree_to_head

if [[ "${DEPLOY_MAINTENANCE_MANAGED_EXTERNALLY:-}" == "1" ]]; then
  echo "==> Maintenance mode is managed by caller; skipping internal enable/disable"
else
  echo "==> Enable maintenance mode before upgrade"
  set_env_value "MAINTENANCE_MODE" "true"
  reload_runtime_for_env
  echo "==> Maintenance mode enabled"
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

# After git pull, .nvmrc is present: prefer project Node (>=20.19 clears npm EBADENGINE for some deps).
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]] && [[ -f "$ROOT/.nvmrc" ]]; then
  # shellcheck disable=SC1091
  source "$NVM_DIR/nvm.sh"
  nvm install
  nvm use
  # Prepend the real nvm version bin (do not rely on `nvm which current` when an IDE injects another `node` first on PATH).
  _nvm_ver="$(sed '/^#/d;/^[[:space:]]*$/d' "$ROOT/.nvmrc" | head -1 | tr -d "[:space:]")"
  _nvm_bin="$NVM_DIR/versions/node/v${_nvm_ver}/bin"
  if [[ -x "$_nvm_bin/node" ]]; then
    export PATH="$_nvm_bin:$PATH"
  fi
  unset _nvm_ver _nvm_bin
  hash -r 2>/dev/null || true
fi
echo "==> deploy: Node $(node -v) ($(command -v node))"
if ! node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>20||(a===20&&b>=19)?0:1)" 2>/dev/null; then
  echo "WARNING: Node is below 20.19 — install nvm + use .nvmrc, or upgrade system Node (see package.json engines)."
fi

echo "==> Install & build"
npm ci
# Fail fast if critical brand/hero assets are missing or placeholder-sized.
node scripts/verify-required-assets.mjs
echo "==> Clean previous Next build artifacts"
rm -rf .next
export DEPLOY_SKIP_SYNC_PREBUILD=1
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

if [[ "${DEPLOY_MAINTENANCE_MANAGED_EXTERNALLY:-}" == "1" ]]; then
  echo "==> Maintenance mode still ON (managed by caller)"
else
  echo "==> Disable maintenance mode before booting the new build"
  set_env_value "MAINTENANCE_MODE" "false"
  reload_runtime_for_env
  echo "==> Maintenance mode disabled"
fi

if [[ "${SKIP_REINDEX_VERIFY:-}" == "1" ]]; then
  echo "==> Skipping live public checks (SKIP_REINDEX_VERIFY=1; caller runs them after maintenance OFF)"
elif [[ "${DEPLOY_MAINTENANCE_MANAGED_EXTERNALLY:-}" == "1" ]]; then
  echo "==> Skipping live public checks (maintenance managed by caller; run after maintenance OFF)"
else
  echo "==> Crawl signal check (/, /sitemap.xml, /robots.txt). Override base: SITE_URL=https://… npm run reindex:verify"
  (cd "$ROOT" && npm run reindex:verify) || echo "WARNING: reindex:verify failed (network, DNS, or SITE_URL). See docs/SEARCH-CONSOLE-REINDEX.md"
  echo "==> Live roadmap smoke (tool routes + sitemap segments + homepage bundle). Override: SITE_URL=https://… npm run verify:live-roadmap"
  (cd "$ROOT" && npm run verify:live-roadmap) || echo "WARNING: verify:live-roadmap failed — prod may still be behind main or CDN stale HTML. See docs/SEARCH-CONSOLE-REINDEX.md"
fi

echo "==> Done. Keep SMTP_*, ADMIN_SESSION_SECRET, ADMIN_PASSWORD, etc. in $ROOT/.env — PM2 loads them from ecosystem.config.js."
echo "==> After deploy: if forms show Server Action errors, hard-refresh the site (Ctrl+Shift+R) so the browser loads new /_next/static chunks."
echo "==> SEO: submit/refresh sitemap + Request indexing for priority URLs in Google Search Console — docs/SEARCH-CONSOLE-REINDEX.md"
trap - ERR
