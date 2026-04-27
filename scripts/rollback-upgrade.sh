#!/usr/bin/env bash
# Rollback helper for update backups created by scripts/pre-upgrade.sh
#
# Usage:
#   bash scripts/rollback-upgrade.sh
#   bash scripts/rollback-upgrade.sh /home/minrosh/minrosh-backups/upgrades/20260417_210313
#
# Optional env:
#   ROLLBACK_ROOT=/home/minrosh/minrosh-migration
#   BACKUP_BASE=/home/minrosh/minrosh-backups/upgrades
#   RESTORE_DB=1

set -euo pipefail

ROOT="${ROLLBACK_ROOT:-$HOME/minrosh-migration}"
BACKUP_BASE="${BACKUP_BASE:-$HOME/minrosh-backups/upgrades}"
INPUT_BACKUP_DIR="${1:-}"
MAINTENANCE_FILE="${MAINTENANCE_FILE:-$ROOT/maintenance.lock}"

pick_latest_backup() {
  local latest
  latest="$(ls -1dt "$BACKUP_BASE"/* 2>/dev/null | head -n 1 || true)"
  echo "$latest"
}

if [[ -n "$INPUT_BACKUP_DIR" ]]; then
  BACKUP_DIR="$INPUT_BACKUP_DIR"
else
  BACKUP_DIR="$(pick_latest_backup)"
fi

if [[ -z "${BACKUP_DIR:-}" || ! -d "$BACKUP_DIR" ]]; then
  echo "ERROR: Backup directory not found."
  echo "  Provided: ${INPUT_BACKUP_DIR:-<none>}"
  echo "  Checked base: $BACKUP_BASE"
  exit 1
fi

ARCHIVE="$BACKUP_DIR/files_backup.tar.gz"
if [[ ! -s "$ARCHIVE" ]]; then
  echo "ERROR: Missing or empty archive: $ARCHIVE"
  exit 1
fi

echo "==> rollback: ROOT=$ROOT"
echo "==> rollback: BACKUP_DIR=$BACKUP_DIR"
echo "==> rollback: enabling maintenance marker"
touch "$MAINTENANCE_FILE"

mkdir -p "$ROOT"
cd "$ROOT"

echo "==> rollback: restoring project files from archive"
tar -xzf "$ARCHIVE" -C "$ROOT"

if [[ -f "$BACKUP_DIR/package-lock.json.bak" ]]; then
  cp "$BACKUP_DIR/package-lock.json.bak" "$ROOT/package-lock.json"
fi
if [[ -f "$BACKUP_DIR/package.json.bak" ]]; then
  cp "$BACKUP_DIR/package.json.bak" "$ROOT/package.json"
fi

if [[ "${RESTORE_DB:-0}" == "1" ]] && [[ -s "$BACKUP_DIR/db_backup.sql" ]]; then
  echo "==> rollback: attempting database restore from db_backup.sql"
  if [[ -n "${DATABASE_URL:-}" ]] && command -v psql >/dev/null 2>&1; then
    psql "$DATABASE_URL" < "$BACKUP_DIR/db_backup.sql"
    echo "  PostgreSQL restore completed using DATABASE_URL."
  elif [[ -n "${DB_NAME:-}" ]] && command -v psql >/dev/null 2>&1; then
    psql "$DB_NAME" < "$BACKUP_DIR/db_backup.sql"
    echo "  PostgreSQL restore completed using DB_NAME."
  elif [[ -n "${DB_NAME:-}" ]] && command -v mysql >/dev/null 2>&1; then
    mysql "$DB_NAME" < "$BACKUP_DIR/db_backup.sql"
    echo "  MySQL restore completed using DB_NAME."
  else
    echo "  WARNING: DB restore requested but no supported DB env/tool combo detected."
  fi
else
  echo "==> rollback: skipping DB restore (set RESTORE_DB=1 to enable)"
fi

echo "==> rollback: reinstalling dependencies and rebuilding"
npm ci
npm run build

echo "==> rollback: restarting PM2 process"
pm2 delete minrosh-next || true
pm2 start ecosystem.config.js
pm2 save

rm -f "$MAINTENANCE_FILE" || true
echo "==> rollback: complete"
