#!/usr/bin/env bash
# Trigger the intelligence scan (same as Admin → Intelligence → Run scan) from cron.
#
# Schedule (server local clock 01:00 daily — adjust TZ= in crontab if needed):
#   0 1 * * * bash /home/YOUR_USER/minrosh-migration/scripts/intelligence-daily-cron.sh >>/tmp/intel-cron.log 2>&1
#
# Requires in the app .env (sourced below) or in the cron environment:
#   INTELLIGENCE_CRON_SECRET   — long random string; must match what the app loads (≥16 chars in production)
#   NEXT_PUBLIC_SITE_URL       — public site base, e.g. https://minroshmigration.com.au
#
# Optional:
#   INTELLIGENCE_DIGEST_EMAIL  — digest recipient (default admin@minroshmigration.com.au; falls back to ADMIN_ALERT_EMAIL)
#
# After each run, the app emails that address with scan stats and a link to Admin → Intelligence.

set -euo pipefail

ROOT="${INTEL_CRON_ROOT:-$HOME/minrosh-migration}"
cd "$ROOT"

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

URL="${NEXT_PUBLIC_SITE_URL%/}/api/cron/intelligence-scan"
SECRET="${INTELLIGENCE_CRON_SECRET:-}"

if [[ -z "$SECRET" ]]; then
  echo "ERROR: INTELLIGENCE_CRON_SECRET is not set." >&2
  exit 1
fi

if [[ -z "${NEXT_PUBLIC_SITE_URL:-}" ]]; then
  echo "ERROR: NEXT_PUBLIC_SITE_URL is not set." >&2
  exit 1
fi

exec curl -sS -X POST "$URL" \
  -H "x-cron-secret: $SECRET" \
  -H "Content-Type: application/json" \
  --max-time 420 \
  -w "\nHTTP %{http_code}\n"
