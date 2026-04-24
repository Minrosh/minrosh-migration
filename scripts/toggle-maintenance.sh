#!/usr/bin/env bash
set -euo pipefail

ROOT="${2:-$HOME/minrosh-migration}"
ENV_FILE="$ROOT/.env"
ACTION="${1:-}"

if [[ -z "$ACTION" ]]; then
  echo "Usage: bash scripts/toggle-maintenance.sh <on|off|status> [project-root]"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found."
  exit 1
fi

set_env_value() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    printf "\n%s=%s\n" "$key" "$value" >> "$ENV_FILE"
  fi
}

read_status() {
  local current
  current="$(awk -F= '/^MAINTENANCE_MODE=/{print $2}' "$ENV_FILE" | tail -n 1)"
  if [[ -z "$current" ]]; then
    echo "false"
  else
    echo "$current"
  fi
}

reload_runtime_for_env() {
  echo "==> Reload runtime to apply env changes"
  # PM2 restart --update-env can keep stale env; recreate process to force .env reload via ecosystem.config.js.
  pm2 delete minrosh-next || true
  pm2 start ecosystem.config.js
  pm2 save
}

case "$ACTION" in
  on)
    set_env_value "MAINTENANCE_MODE" "true"
    reload_runtime_for_env
    echo "==> MAINTENANCE_MODE enabled"
    ;;
  off)
    set_env_value "MAINTENANCE_MODE" "false"
    reload_runtime_for_env
    echo "==> MAINTENANCE_MODE disabled"
    ;;
  status)
    echo "MAINTENANCE_MODE=$(read_status)"
    ;;
  *)
    echo "Usage: bash scripts/toggle-maintenance.sh <on|off|status> [project-root]"
    exit 1
    ;;
esac
