#!/usr/bin/env bash
# Pre-upgrade safety script:
# - Creates a maintenance marker (optional usage by app/web server)
# - Verifies disk space
# - Archives current project files
# - Captures dependency snapshots for rollback
# - Attempts DB dump when env is configured for postgres/mysql

set -euo pipefail

ROOT="${1:-$HOME/minrosh-migration}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_BASE="${BACKUP_BASE:-$HOME/minrosh-backups/upgrades}"
BACKUP_DIR="${BACKUP_BASE}/${TIMESTAMP}"
MAINTENANCE_FILE="${MAINTENANCE_FILE:-$ROOT/maintenance.lock}"
MIN_FREE_MB="${MIN_FREE_MB:-2048}"

mkdir -p "$BACKUP_DIR"
cd "$ROOT"

echo "==> pre-upgrade: ROOT=$ROOT"
echo "==> pre-upgrade: BACKUP_DIR=$BACKUP_DIR"

echo "==> Disk space check (minimum ${MIN_FREE_MB}MB)"
available_kb="$(df -Pk "$ROOT" | awk 'NR==2 {print $4}')"
required_kb="$((MIN_FREE_MB * 1024))"
if [[ "${available_kb}" -lt "${required_kb}" ]]; then
  echo "ERROR: Insufficient disk space for safe backup."
  echo "  Available: $((available_kb / 1024))MB, required: ${MIN_FREE_MB}MB"
  exit 1
fi

echo "==> Enable maintenance marker: $MAINTENANCE_FILE"
touch "$MAINTENANCE_FILE"

echo "==> Capture git state"
git rev-parse --short HEAD > "$BACKUP_DIR/git_head.txt" || true
git status --short > "$BACKUP_DIR/git_status.txt" || true

echo "==> Archive project files (excluding heavy/generated dirs)"
tar \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='storage/uploads' \
  -czf "$BACKUP_DIR/files_backup.tar.gz" \
  -C "$ROOT" .

echo "==> Dependency snapshots"
if [[ -f "$ROOT/package-lock.json" ]]; then
  cp "$ROOT/package-lock.json" "$BACKUP_DIR/package-lock.json.bak"
fi
if [[ -f "$ROOT/package.json" ]]; then
  cp "$ROOT/package.json" "$BACKUP_DIR/package.json.bak"
fi
if command -v pip >/dev/null 2>&1; then
  pip freeze > "$BACKUP_DIR/requirements_pre_upgrade.txt" || true
fi

echo "==> Optional database backup"
if [[ -n "${DATABASE_URL:-}" ]] && command -v pg_dump >/dev/null 2>&1; then
  if pg_dump "$DATABASE_URL" > "$BACKUP_DIR/db_backup.sql" 2>/dev/null; then
    echo "  PostgreSQL dump created from DATABASE_URL"
  else
    echo "  WARNING: PostgreSQL dump via DATABASE_URL failed; continuing."
  fi
elif [[ -n "${DB_NAME:-}" ]] && command -v pg_dump >/dev/null 2>&1; then
  if pg_dump "${DB_NAME}" > "$BACKUP_DIR/db_backup.sql" 2>/dev/null; then
    echo "  PostgreSQL dump created from DB_NAME"
  else
    echo "  WARNING: PostgreSQL dump via DB_NAME failed; continuing."
  fi
elif [[ -n "${DB_NAME:-}" ]] && command -v mysqldump >/dev/null 2>&1; then
  if mysqldump "${DB_NAME}" > "$BACKUP_DIR/db_backup.sql" 2>/dev/null; then
    echo "  MySQL dump created from DB_NAME"
  else
    echo "  WARNING: MySQL dump via DB_NAME failed; continuing."
  fi
else
  echo "  No DB env/tool combo detected; skipping DB dump."
fi

if [[ ! -s "$BACKUP_DIR/files_backup.tar.gz" ]]; then
  echo "ERROR: File backup archive was not created correctly."
  exit 1
fi

echo "==> Pre-upgrade complete"
echo "==> Backup location: $BACKUP_DIR"
echo "==> Maintenance marker remains in place until deploy completes."
