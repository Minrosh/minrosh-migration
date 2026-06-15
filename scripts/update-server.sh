#!/usr/bin/env bash
# Single entrypoint for Ubuntu: safety checks, deploy-ubuntu.sh, then log flush.
#
# Usage (on server):
#   cd ~/minrosh-migration && ./deploy-server.sh
# Or:
#   bash ~/minrosh-migration/scripts/update-server.sh
#
# Optional custom root:
#   bash scripts/update-server.sh /srv/minrosh-migration
#
# Branch override (same as deploy-ubuntu.sh):
#   DEPLOY_GIT_BRANCH=develop bash scripts/update-server.sh
#
# Optional CDN purge (recommended for runtime/chunk incidents):
#   export CLOUDFLARE_ZONE_ID=...
#   export CLOUDFLARE_API_TOKEN=...
#   export CLOUDFLARE_PURGE_EVERYTHING=true
#   bash scripts/update-server.sh
#
# Working tree: commit/push from dev first so origin/main matches what you expect. If this
# checkout has local modifications, `git pull` will warn; resolve (stash/discard/commit) so
# deploys always track a known commit.
#
# Maintenance mode behavior for this script:
#   - MAINTENANCE_MODE=true in .env during git pull / install / build (no PM2 reload mid-build)
#   - deploy-ubuntu removes .next (old PM2 process dies; site down during build is expected)
#   - ONE PM2 start after build with MAINTENANCE_MODE=false
#   - wait until origin http://127.0.0.1:3000 returns HTTP 200, then public smoke checks
#   - ON when any step fails

set -euo pipefail

ROOT="${1:-$HOME/minrosh-migration}"
ENV_FILE="$ROOT/.env"

STATUS_BUILD="PENDING"
STATUS_ORIGIN="PENDING"
STATUS_MAINTENANCE="ON"
STATUS_PM2="PENDING"
STATUS_CDN="SKIPPED"
STATUS_SMOKE="PENDING"

MAINTENANCE_TITLE_MARKER="MinRosh Migration | Maintenance"
# ecosystem.config.js merges .env then sets PORT=3000 (overrides any .env PORT).
APP_PORT=3000
ORIGIN_WAIT_ATTEMPTS="${ORIGIN_WAIT_ATTEMPTS:-45}"
ORIGIN_WAIT_SECS="${ORIGIN_WAIT_SECS:-2}"

cd "$ROOT"
echo "==> update-server: ROOT=$ROOT"
echo "==> update-server: PM2 command: node .next/standalone/server.js (via ecosystem.config.js)"
echo "==> update-server: listen PORT=${APP_PORT} HOSTNAME=0.0.0.0"

pm2_exists() {
  pm2 describe minrosh-next >/dev/null 2>&1
}

pm2_app_status() {
  node -e "
    const { execSync } = require('child_process');
    try {
      const list = JSON.parse(execSync('pm2 jlist', { encoding: 'utf8' }));
      const proc = list.find((p) => p.name === 'minrosh-next');
      process.stdout.write(proc?.pm2_env?.status || 'missing');
    } catch {
      process.stdout.write('error');
    }
  " 2>/dev/null || echo "error"
}

standalone_server_present() {
  [[ -f "$ROOT/.next/standalone/server.js" ]]
}

maintenance_env_enabled() {
  local val
  val="$(grep -E '^MAINTENANCE_MODE=' "$ENV_FILE" 2>/dev/null | tail -1 | cut -d= -f2- | tr '[:upper:]' '[:lower:]' || true)"
  [[ "$val" == "1" || "$val" == "true" || "$val" == "on" || "$val" == "yes" ]]
}

assert_maintenance_disabled() {
  if [[ -f "$ROOT/maintenance.lock" ]]; then
    echo "ERROR: $ROOT/maintenance.lock still exists before origin/public checks" >&2
    return 1
  fi
  if maintenance_env_enabled; then
    echo "ERROR: MAINTENANCE_MODE is still enabled in $ENV_FILE before origin/public checks" >&2
    return 1
  fi
  return 0
}

verify_build_artifacts() {
  local failed=0
  if [[ ! -f "$ROOT/.next/standalone/server.js" ]]; then
    echo "ERROR: missing $ROOT/.next/standalone/server.js after build" >&2
    failed=1
  fi
  if [[ ! -d "$ROOT/.next/static" ]]; then
    echo "ERROR: missing $ROOT/.next/static after build" >&2
    failed=1
  fi
  if [[ ! -d "$ROOT/public" ]]; then
    echo "ERROR: missing $ROOT/public" >&2
    failed=1
  fi
  return "$failed"
}

set_env_value() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    printf "\n%s=%s\n" "$key" "$value" >> "$ENV_FILE"
  fi
}

port_is_listening() {
  ss -ltnp 2>/dev/null | grep -qE ":${APP_PORT}([[:space:]]|$)"
}

print_runtime_diagnostics() {
  local label="$1"
  echo ""
  echo "--- runtime diagnostics: ${label} ---"
  pm2 status minrosh-next 2>&1 || pm2 status 2>&1 || true
  echo "PM2 app status: $(pm2_app_status)"
  echo "ss -ltnp | grep ':${APP_PORT}':"
  ss -ltnp 2>/dev/null | grep ":${APP_PORT}" || echo "(no listener on :${APP_PORT})"
  echo "curl -I http://127.0.0.1:${APP_PORT}/:"
  curl -sS -I --connect-timeout 3 --max-time 8 "http://127.0.0.1:${APP_PORT}/" 2>&1 || echo "(curl failed)"
  echo "MAINTENANCE_MODE=$(grep -E '^MAINTENANCE_MODE=' "$ENV_FILE" 2>/dev/null | tail -1 | cut -d= -f2- || echo unset)"
  echo "maintenance.lock=$([[ -f "$ROOT/maintenance.lock" ]] && echo present || echo absent)"
  echo "--- end diagnostics ---"
  echo ""
}

show_pm2_error_logs() {
  echo "==> update-server: PM2 logs minrosh-next (last 80 lines)" >&2
  pm2 logs minrosh-next --lines 80 --nostream 2>&1 || true
}

fail_runtime_unreachable() {
  local context="$1"
  print_runtime_diagnostics "$context"
  local status
  status="$(pm2_app_status)"
  if [[ "$status" == "online" ]] && ! port_is_listening; then
    echo "ERROR: PM2 online but app is not listening on PORT=${APP_PORT}" >&2
  elif [[ "$status" == "errored" || "$status" == "stopped" ]]; then
    echo "ERROR: PM2 process minrosh-next is ${status}" >&2
  else
    echo "ERROR: origin http://127.0.0.1:${APP_PORT}/ not ready (${context})" >&2
  fi
  show_pm2_error_logs
  return 1
}

stop_pm2_if_running() {
  if pm2_exists; then
    echo "==> update-server: stopping PM2 before build (standalone will be replaced)"
    pm2 delete minrosh-next || true
    pm2 save || true
  fi
}

start_pm2_production() {
  local label="$1"
  if ! standalone_server_present; then
    echo "ERROR: cannot start PM2 — $ROOT/.next/standalone/server.js missing" >&2
    return 1
  fi
  echo "==> update-server: ${label}"
  if pm2_exists; then
    pm2 delete minrosh-next
  fi
  # ecosystem.config.js re-reads .env on each start (MAINTENANCE_MODE must already be set in .env).
  pm2 start "$ROOT/ecosystem.config.js"
  pm2 save
  if ! pm2_exists; then
    fail_runtime_unreachable "PM2 start failed (${label})"
    return 1
  fi
  print_runtime_diagnostics "${label}"
  return 0
}

set_maintenance_on() {
  set_env_value "MAINTENANCE_MODE" "true"
  touch "$ROOT/maintenance.lock"
  echo "==> update-server: maintenance ON (.env updated, maintenance.lock created)"
  echo "==> update-server: PM2 not restarted yet — deploy will replace .next (old process stopped before build)"
  STATUS_MAINTENANCE="ON (during build)"
}

set_maintenance_off() {
  set_env_value "MAINTENANCE_MODE" "false"
  rm -f "$ROOT/maintenance.lock" || true
  echo "==> update-server: maintenance OFF (MAINTENANCE_MODE=false, maintenance.lock removed)"
  if ! assert_maintenance_disabled; then
    return 1
  fi
  STATUS_MAINTENANCE="OFF"
  return 0
}

response_contains_maintenance_page() {
  local body="$1"
  echo "$body" | grep -q "$MAINTENANCE_TITLE_MARKER"
}

fail_if_maintenance_page() {
  local label="$1"
  local body="$2"
  if response_contains_maintenance_page "$body"; then
    echo "ERROR: maintenance still enabled — ${label} returned the maintenance page." >&2
    echo "       Check MAINTENANCE_MODE in $ENV_FILE, maintenance.lock, and reload PM2." >&2
    return 1
  fi
  return 0
}

# Poll until origin returns HTTP 200 with maintenance OFF. Never accept 503 maintenance here.
wait_for_origin_live() {
  local origin_url="$1"
  local attempt code body tmp_body status

  if ! assert_maintenance_disabled; then
    return 1
  fi

  echo "==> update-server: waiting for origin live at ${origin_url}/ (expect HTTP 200, maintenance OFF)"
  tmp_body="$(mktemp)"
  for attempt in $(seq 1 "$ORIGIN_WAIT_ATTEMPTS"); do
    status="$(pm2_app_status)"

    if [[ "$status" == "errored" || "$status" == "stopped" ]]; then
      rm -f "$tmp_body"
      fail_runtime_unreachable "PM2 ${status} during live wait (attempt ${attempt})"
      return 1
    fi

    if [[ "$status" == "online" ]] && ! port_is_listening && [[ "$attempt" -ge 5 ]]; then
      rm -f "$tmp_body"
      fail_runtime_unreachable "PM2 online but port ${APP_PORT} not listening (attempt ${attempt})"
      return 1
    fi

    code="$(curl -s -o "$tmp_body" -w "%{http_code}" --connect-timeout 2 --max-time 10 \
      "${origin_url}/?v=$(date +%s)&origin=live&attempt=${attempt}" 2>/dev/null || true)"
    body="$(cat "$tmp_body" 2>/dev/null || true)"

    if [[ -z "$body" ]]; then
      if [[ "$attempt" -lt "$ORIGIN_WAIT_ATTEMPTS" ]]; then
        echo "==> update-server: live wait attempt ${attempt}/${ORIGIN_WAIT_ATTEMPTS} (unreachable, PM2 ${status}, port: $(port_is_listening && echo yes || echo no))"
        sleep "$ORIGIN_WAIT_SECS"
        continue
      fi
      rm -f "$tmp_body"
      fail_runtime_unreachable "origin unreachable after maintenance disabled"
      return 1
    fi

    if [[ "$code" == "503" ]] && response_contains_maintenance_page "$body"; then
      rm -f "$tmp_body"
      echo "ERROR: maintenance still enabled — origin returned HTTP 503 maintenance page" >&2
      print_runtime_diagnostics "origin still serving maintenance"
      show_pm2_error_logs
      return 1
    fi

    if [[ "$code" == "200" ]]; then
      if ! fail_if_maintenance_page "origin ${origin_url}/" "$body"; then
        rm -f "$tmp_body"
        show_pm2_error_logs
        return 1
      fi
      rm -f "$tmp_body"
      echo "==> update-server: OK origin live (HTTP 200, attempt ${attempt}/${ORIGIN_WAIT_ATTEMPTS})"
      return 0
    fi

    if [[ "$attempt" -lt "$ORIGIN_WAIT_ATTEMPTS" ]]; then
      echo "==> update-server: live wait attempt ${attempt}/${ORIGIN_WAIT_ATTEMPTS} (HTTP ${code}, PM2 ${status}, port: $(port_is_listening && echo yes || echo no))"
      sleep "$ORIGIN_WAIT_SECS"
    fi
  done

  rm -f "$tmp_body"
  fail_runtime_unreachable "origin live wait timed out (expected HTTP 200)"
  return 1
}

print_final_summary() {
  echo ""
  echo "==> update-server: summary"
  echo "    Build:          ${STATUS_BUILD}"
  echo "    Origin:         ${STATUS_ORIGIN}"
  echo "    Maintenance:    ${STATUS_MAINTENANCE}"
  echo "    PM2:            ${STATUS_PM2}"
  echo "    CDN purge:      ${STATUS_CDN}"
  echo "    Public smoke:   ${STATUS_SMOKE}"
  echo ""
}

on_update_error() {
  trap - ERR
  echo "" >&2
  echo "==> update-server: FAILURE — maintenance mode remains ON" >&2
  echo "    Visitors will see the maintenance page until a successful deploy completes." >&2
  echo "    Rollback: checkout a known-good commit, then re-run: bash scripts/update-server.sh" >&2
  echo "    Manual recovery:" >&2
  echo "      sed -i 's/^MAINTENANCE_MODE=.*/MAINTENANCE_MODE=false/' $ENV_FILE" >&2
  echo "      rm -f $ROOT/maintenance.lock" >&2
  echo "      pm2 delete minrosh-next && pm2 start ecosystem.config.js && pm2 save" >&2
  echo "" >&2
  set_env_value "MAINTENANCE_MODE" "true"
  touch "$ROOT/maintenance.lock"
  STATUS_MAINTENANCE="ON"
  if standalone_server_present; then
    start_pm2_production "failure recovery (maintenance ON)" || true
  fi
  print_final_summary
  exit 1
}

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE is missing. Create it before running update-server.sh." >&2
  exit 1
fi

# Load deploy secrets (CLOUDFLARE_*, SITE_URL, etc.) without requiring manual export.
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

ORIGIN_SMOKE_URL="${ORIGIN_SMOKE_URL:-http://127.0.0.1:3000}"
SMOKE_BASE="${SITE_URL:-https://minroshmigration.com.au}"
CACHE_BUST="v=$(date +%s)"

trap on_update_error ERR
set_maintenance_on
stop_pm2_if_running

echo "==> update-server: running pre-upgrade safety checks"
bash "$ROOT/scripts/pre-upgrade.sh" "$ROOT"

# Caller owns maintenance toggles and public smoke — deploy-ubuntu must not disable maintenance or hit public URLs.
if ! DEPLOY_MAINTENANCE_MANAGED_EXTERNALLY=1 SKIP_REINDEX_VERIFY=1 bash "$ROOT/scripts/deploy-ubuntu.sh" "$ROOT"; then
  echo "==> update-server: deploy failed" >&2
  exit 1
fi
STATUS_BUILD="OK"

if ! verify_build_artifacts; then
  echo "==> update-server: build artifact check failed" >&2
  exit 1
fi

if ! set_maintenance_off; then
  echo "==> update-server: failed to disable maintenance before PM2 start" >&2
  exit 1
fi

if ! start_pm2_production "starting PM2 with new standalone build (maintenance OFF)"; then
  echo "==> update-server: PM2 start failed after build" >&2
  exit 1
fi
STATUS_PM2="online"

if ! wait_for_origin_live "$ORIGIN_SMOKE_URL"; then
  echo "==> update-server: origin live check failed — public checks skipped" >&2
  exit 1
fi
STATUS_ORIGIN="OK"

if [[ -n "${CLOUDFLARE_ZONE_ID:-}" && -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  if [[ -f "$ROOT/scripts/purge-cdn.js" ]]; then
    echo "==> update-server: purging CDN cache via scripts/purge-cdn.js"
    (
      cd "$ROOT"
      npm run purge:cdn
    )
    STATUS_CDN="OK"
  else
    echo "ERROR: CLOUDFLARE_* is set but purge-cdn.js is missing." >&2
    exit 1
  fi
else
  echo "==> update-server: CDN env vars not set; skipping CDN purge"
fi

echo "==> update-server: public HTTP smoke checks (maintenance is OFF)"
SMOKE_FAIL=0

for path in "/" "/student-visa-australia" "/contact" "/assessment" "/book-consultation"; do
  tmp_body="$(mktemp)"
  code="$(curl -s -o "$tmp_body" -w "%{http_code}" "${SMOKE_BASE}${path}?${CACHE_BUST}" || true)"
  body="$(cat "$tmp_body")"
  rm -f "$tmp_body"

  if response_contains_maintenance_page "$body"; then
    echo "==> update-server: ERROR ${SMOKE_BASE}${path} — maintenance still enabled" >&2
    SMOKE_FAIL=1
    continue
  fi
  if [[ "$code" != "200" ]]; then
    echo "==> update-server: WARNING ${SMOKE_BASE}${path} returned HTTP ${code}"
    SMOKE_FAIL=1
  else
    echo "==> update-server: OK ${SMOKE_BASE}${path}"
  fi
done

if [[ "$SMOKE_FAIL" -ne 0 ]]; then
  echo "==> update-server: public smoke checks failed" >&2
  exit 1
fi
STATUS_SMOKE="OK"

echo "==> update-server: verifying origin vs public homepage HTML (CSS + stale-loader)"
(
  cd "$ROOT"
  ROOT="$ROOT" SITE_URL="$SMOKE_BASE" ORIGIN_SMOKE_URL="$ORIGIN_SMOKE_URL" node scripts/verify-deploy-html.mjs
)

if pm2_exists; then
  pm2 flush minrosh-next || true
fi

trap - ERR
print_final_summary
echo "==> update-server: done"
