#!/usr/bin/env bash
# Automated uptime monitor: checks origin + public HTTP, recovers if down, emails admin.
#
# Install on the Ubuntu server (every 5 minutes):
#   */5 * * * * bash /home/YOUR_USER/minrosh-migration/scripts/uptime-watch.sh >>/tmp/minrosh-uptime-watch.log 2>&1
#
# Requires in .env:
#   SMTP_HOST, SMTP_USER, SMTP_PASS          — alert delivery
#   ADMIN_ALERT_EMAIL or UPTIME_WATCH_ALERT_EMAIL
#   NEXT_PUBLIC_SITE_URL or SITE_URL           — public health check
#
# Optional:
#   UPTIME_WATCH_ROOT          — repo path (default: ~/minrosh-migration)
#   ORIGIN_SMOKE_URL           — origin check (default: http://127.0.0.1:3000)
#   UPTIME_WATCH_COOLDOWN_SECS — min seconds between recovery runs (default: 900)
#   UPTIME_WATCH_SKIP_PUBLIC=1 — only check origin (skip Cloudflare/public URL)
#   UPTIME_WATCH_DRY_RUN=1     — log actions but do not restart or deploy
#
# Recovery order when checks fail:
#   1. pm2 restart minrosh-next
#   2. pm2 delete + pm2 start ecosystem.config.js
#   3. bash scripts/update-server.sh (full rebuild + deploy)

set -euo pipefail

ROOT="${UPTIME_WATCH_ROOT:-$HOME/minrosh-migration}"
ENV_FILE="$ROOT/.env"
STATE_FILE="$ROOT/data/uptime-watch-state.json"
LOCK_FILE="/tmp/minrosh-uptime-watch.lock"
LOG_PREFIX="uptime-watch"
APP_PORT=3000
MAINTENANCE_TITLE_MARKER="MinRosh Migration | Maintenance"
COOLDOWN_SECS="${UPTIME_WATCH_COOLDOWN_SECS:-900}"
ORIGIN_WAIT_ATTEMPTS="${UPTIME_WATCH_ORIGIN_WAIT_ATTEMPTS:-12}"
ORIGIN_WAIT_SECS="${UPTIME_WATCH_ORIGIN_WAIT_SECS:-5}"

now_epoch() {
  date +%s
}

log() {
  echo "[$(date -Iseconds)] ${LOG_PREFIX}: $*"
}

load_env() {
  if [[ ! -f "$ENV_FILE" ]]; then
    log "ERROR: missing $ENV_FILE"
    exit 1
  fi
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
}

response_contains_maintenance_page() {
  local body="$1"
  echo "$body" | grep -q "$MAINTENANCE_TITLE_MARKER"
}

# Prints OK:<label> or FAIL:<label>:<reason> on stdout; returns 0/1.
check_http_health() {
  local url="$1"
  local label="$2"
  local tmp_body code body cache_bust

  cache_bust="v=$(date +%s)&uptime=1"
  if [[ "$url" == *"?"* ]]; then
    url="${url}&${cache_bust}"
  else
    url="${url}?${cache_bust}"
  fi

  tmp_body="$(mktemp)"
  code="$(curl -sS -o "$tmp_body" -w "%{http_code}" \
    --connect-timeout 5 --max-time 20 \
    -H "Cache-Control: no-cache" \
    "$url" 2>/dev/null || echo "000")"
  body="$(cat "$tmp_body" 2>/dev/null || true)"
  rm -f "$tmp_body"

  if [[ "$code" != "200" ]]; then
    echo "FAIL:${label}:HTTP_${code}"
    return 1
  fi
  if [[ -n "$body" ]] && response_contains_maintenance_page "$body"; then
    echo "FAIL:${label}:MAINTENANCE_PAGE"
    return 1
  fi
  echo "OK:${label}"
  return 0
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

port_is_listening() {
  ss -ltnp 2>/dev/null | grep -qE ":${APP_PORT}([[:space:]]|$)"
}

read_last_recovery_epoch() {
  if [[ ! -f "$STATE_FILE" ]]; then
    echo "0"
    return
  fi
  node -e "
    const fs = require('fs');
    try {
      const s = JSON.parse(fs.readFileSync('$STATE_FILE', 'utf8'));
      process.stdout.write(String(s.lastRecoveryEpoch || 0));
    } catch {
      process.stdout.write('0');
    }
  " 2>/dev/null || echo "0"
}

write_state() {
  local action="$1"
  local outcome="$2"
  local details="$3"
  UPTIME_STATE_FILE="$STATE_FILE" \
  UPTIME_STATE_EPOCH="$(now_epoch)" \
  UPTIME_STATE_ACTION="$action" \
  UPTIME_STATE_OUTCOME="$outcome" \
  UPTIME_STATE_DETAILS="$details" \
  node -e "
    const fs = require('fs');
    const path = require('path');
    const file = process.env.UPTIME_STATE_FILE;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    let prev = {};
    try { prev = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
    const next = {
      ...prev,
      lastCheckAt: new Date().toISOString(),
      lastRecoveryEpoch: Number(process.env.UPTIME_STATE_EPOCH || 0),
      lastAction: process.env.UPTIME_STATE_ACTION || '',
      lastOutcome: process.env.UPTIME_STATE_OUTCOME || '',
      lastDetails: process.env.UPTIME_STATE_DETAILS || '',
    };
    fs.writeFileSync(file, JSON.stringify(next, null, 2));
  "
}

send_alert() {
  local subject="$1"
  local body="$2"
  if [[ ! -f "$ROOT/scripts/uptime-notify.mjs" ]]; then
    log "WARN: uptime-notify.mjs missing — cannot send alert"
    return 1
  fi
  if ! node --env-file="$ENV_FILE" "$ROOT/scripts/uptime-notify.mjs" \
    --subject "$subject" \
    --body "$body"; then
    log "WARN: alert email failed"
    return 1
  fi
  return 0
}

wait_for_origin() {
  local origin_base="${ORIGIN_SMOKE_URL:-http://127.0.0.1:3000}"
  local attempt result
  for attempt in $(seq 1 "$ORIGIN_WAIT_ATTEMPTS"); do
    if result="$(check_http_health "${origin_base}/" "origin-recheck")"; then
      log "$result (attempt ${attempt}/${ORIGIN_WAIT_ATTEMPTS})"
      return 0
    fi
    log "$result (attempt ${attempt}/${ORIGIN_WAIT_ATTEMPTS}, PM2=$(pm2_app_status), port=$(port_is_listening && echo yes || echo no))"
    if [[ "$attempt" -lt "$ORIGIN_WAIT_ATTEMPTS" ]]; then
      sleep "$ORIGIN_WAIT_SECS"
    fi
  done
  return 1
}

run_recovery_pm2_restart() {
  log "recovery step 1: pm2 restart minrosh-next"
  if [[ "${UPTIME_WATCH_DRY_RUN:-}" == "1" ]]; then
    return 0
  fi
  pm2 restart minrosh-next
  pm2 save || true
}

run_recovery_pm2_start() {
  log "recovery step 2: pm2 delete + start ecosystem.config.js"
  if [[ "${UPTIME_WATCH_DRY_RUN:-}" == "1" ]]; then
    return 0
  fi
  pm2 delete minrosh-next 2>/dev/null || true
  pm2 start "$ROOT/ecosystem.config.js"
  pm2 save
}

run_recovery_update_server() {
  log "recovery step 3: scripts/update-server.sh (full deploy)"
  if [[ "${UPTIME_WATCH_DRY_RUN:-}" == "1" ]]; then
    return 0
  fi
  bash "$ROOT/scripts/update-server.sh" "$ROOT"
}

acquire_lock() {
  exec 9>"$LOCK_FILE"
  if ! flock -n 9; then
    log "another uptime-watch run is in progress — exiting"
    exit 0
  fi
}

main() {
  cd "$ROOT"
  load_env

  ORIGIN_SMOKE_URL="${ORIGIN_SMOKE_URL:-http://127.0.0.1:3000}"
  PUBLIC_BASE="${SITE_URL:-${NEXT_PUBLIC_SITE_URL:-}}"

  acquire_lock

  local origin_result public_result failures=()
  origin_result="$(check_http_health "${ORIGIN_SMOKE_URL}/" "origin")" || failures+=("$origin_result")

  if [[ "${UPTIME_WATCH_SKIP_PUBLIC:-}" != "1" && -n "$PUBLIC_BASE" ]]; then
    public_result="$(check_http_health "${PUBLIC_BASE%/}/" "public")" || failures+=("$public_result")
  elif [[ "${UPTIME_WATCH_SKIP_PUBLIC:-}" != "1" && -z "$PUBLIC_BASE" ]]; then
    log "WARN: SITE_URL / NEXT_PUBLIC_SITE_URL not set — skipping public check"
  fi

  if [[ ${#failures[@]} -eq 0 ]]; then
    log "healthy — ${origin_result}${public_result:+; ${public_result}}"
    node -e "
      const fs = require('fs');
      const file = '$STATE_FILE';
      if (!fs.existsSync(file)) process.exit(0);
      try {
        const s = JSON.parse(fs.readFileSync(file, 'utf8'));
        s.lastHealthyAt = new Date().toISOString();
        fs.writeFileSync(file, JSON.stringify(s, null, 2));
      } catch {}
    " 2>/dev/null || true
    exit 0
  fi

  log "UNHEALTHY — ${failures[*]}"

  local last_recovery now cooldown_left
  last_recovery="$(read_last_recovery_epoch)"
  now="$(now_epoch)"
  cooldown_left=$((COOLDOWN_SECS - (now - last_recovery)))

  if [[ "$last_recovery" != "0" && "$cooldown_left" -gt 0 ]]; then
    log "recovery cooldown active (${cooldown_left}s left) — alerting only"
    send_alert \
      "[MinRosh] Site still unhealthy (recovery on cooldown)" \
      "$(printf '%s\n\nChecks failed:\n%s\n\nPM2 status: %s\nPort %s listening: %s\n\nRecovery was attempted recently; next automatic recovery after cooldown (%ss).\nServer: %s\nTime: %s\n' \
        "The uptime monitor detected problems but did not run recovery because cooldown is active." \
        "$(printf '%s\n' "${failures[@]}")" \
        "$(pm2_app_status)" \
        "$APP_PORT" \
        "$(port_is_listening && echo yes || echo no)" \
        "$cooldown_left" \
        "$(hostname -f 2>/dev/null || hostname)" \
        "$(date -Iseconds)")" || true
    exit 1
  fi

  local report_file action_taken recovery_ok=0
  report_file="$(mktemp)"
  {
    echo "MinRosh uptime monitor — automatic recovery ran while you were away."
    echo ""
    echo "Server: $(hostname -f 2>/dev/null || hostname)"
    echo "Time: $(date -Iseconds)"
    echo "Repo: $ROOT"
    echo ""
    echo "Failed checks:"
    printf '  - %s\n' "${failures[@]}"
    echo ""
    echo "PM2 before recovery: $(pm2_app_status)"
    echo "Port ${APP_PORT} listening: $(port_is_listening && echo yes || echo no)"
    echo ""
    echo "Recovery steps:"
  } >"$report_file"

  if [[ "${UPTIME_WATCH_DRY_RUN:-}" == "1" ]]; then
    echo "  (dry run — no changes applied)" >>"$report_file"
    action_taken="dry_run"
  else
    if run_recovery_pm2_restart && wait_for_origin; then
      echo "  1. pm2 restart — SUCCESS" >>"$report_file"
      action_taken="pm2_restart"
      recovery_ok=1
    else
      echo "  1. pm2 restart — still unhealthy" >>"$report_file"
      if run_recovery_pm2_start && wait_for_origin; then
        echo "  2. pm2 delete + start — SUCCESS" >>"$report_file"
        action_taken="pm2_start"
        recovery_ok=1
      else
        echo "  2. pm2 delete + start — still unhealthy" >>"$report_file"
        if run_recovery_update_server; then
          echo "  3. update-server.sh — SUCCESS" >>"$report_file"
          action_taken="update_server"
          recovery_ok=1
        else
          echo "  3. update-server.sh — FAILED (check /tmp/minrosh-uptime-watch.log and pm2 logs)" >>"$report_file"
          action_taken="update_server_failed"
        fi
      fi
    fi
  fi

  {
    echo ""
    echo "PM2 after recovery: $(pm2_app_status)"
    echo "Port ${APP_PORT} listening: $(port_is_listening && echo yes || echo no)"
    echo ""
    if [[ "$recovery_ok" -eq 1 ]]; then
      echo "Outcome: site recovered automatically."
    else
      echo "Outcome: automatic recovery did not restore the site — manual intervention required."
      echo "Try: cd $ROOT && bash scripts/update-server.sh"
      echo "Logs: pm2 logs minrosh-next --lines 100"
    fi
  } >>"$report_file"

  local subject
  if [[ "$recovery_ok" -eq 1 ]]; then
    subject="[MinRosh] Uptime recovery succeeded ($action_taken)"
  else
    subject="[MinRosh] Uptime recovery FAILED — action needed"
  fi

  send_alert "$subject" "$(cat "$report_file")" || true
  rm -f "$report_file"

  if [[ "$recovery_ok" -eq 1 ]]; then
    write_state "$action_taken" "recovered" "${failures[*]}"
  else
    write_state "$action_taken" "failed" "${failures[*]}"
  fi

  if [[ "$recovery_ok" -eq 1 ]]; then
    log "recovery succeeded via $action_taken"
    exit 0
  fi

  log "recovery failed — admin notified"
  exit 1
}

main "$@"
