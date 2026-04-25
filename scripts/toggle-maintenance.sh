#!/usr/bin/env bash
# Toggle the production maintenance flag used by Next.js middleware.
#
# Usage on the server:
#   bash scripts/toggle-maintenance.sh on
#   bash scripts/toggle-maintenance.sh off
#   bash scripts/toggle-maintenance.sh status

set -euo pipefail

MODE="${1:-}"
ROOT="${2:-$HOME/minrosh-migration}"
ENV_FILE="$ROOT/.env"
MAINTENANCE_FILE="${MAINTENANCE_FILE:-$ROOT/maintenance.lock}"

if [[ "$MODE" != "on" && "$MODE" != "off" && "$MODE" != "status" ]]; then
  echo "Usage: bash scripts/toggle-maintenance.sh on|off|status [project-root]" >&2
  exit 2
fi

cd "$ROOT"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE is missing." >&2
  exit 1
fi

set_env_flag() {
  local value="$1"
  if grep -qE '^MAINTENANCE_MODE=' "$ENV_FILE"; then
    sed -i -E "s/^MAINTENANCE_MODE=.*/MAINTENANCE_MODE=$value/" "$ENV_FILE"
  else
    printf "\nMAINTENANCE_MODE=%s\n" "$value" >> "$ENV_FILE"
  fi
}

reload_runtime_for_env() {
  if ! command -v pm2 >/dev/null 2>&1 || [[ ! -f "$ROOT/ecosystem.config.js" ]]; then
    echo "WARNING: PM2 or ecosystem.config.js not found; flag updated but app was not reloaded." >&2
    return 0
  fi

  echo "==> Reload runtime to apply env changes"
  # ecosystem.config.js merges .env manually; recreate the PM2 process so fresh values are guaranteed.
  pm2 delete minrosh-next || true
  pm2 start ecosystem.config.js
  pm2 save
}

case "$MODE" in
  on)
    set_env_flag "true"
    touch "$MAINTENANCE_FILE"
    reload_runtime_for_env
    echo "Maintenance mode: ON"
    ;;
  off)
    set_env_flag "false"
    rm -f "$MAINTENANCE_FILE"
    reload_runtime_for_env
    echo "Maintenance mode: OFF"
    ;;
  status)
    current="$(grep -E '^MAINTENANCE_MODE=' "$ENV_FILE" | tail -1 | cut -d= -f2- || true)"
    marker="missing"
    [[ -f "$MAINTENANCE_FILE" ]] && marker="present"
    echo "MAINTENANCE_MODE=${current:-unset}"
    echo "maintenance.lock=$marker"
    ;;
esac
