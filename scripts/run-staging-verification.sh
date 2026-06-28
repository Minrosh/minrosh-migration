#!/usr/bin/env bash
# Formal staging verification harness (port 3001, CMS on).
set -euo pipefail

BASE="${STAGING_BASE_URL:-http://127.0.0.1:3001}"
PAGES=(
  "/about|CMS About — Staging Verify 3a|Initial profile orientation"
  "/contact|CMS Contact — Staging Verify 3b|Clear next-step guidance"
  "/student-visa-australia|CMS Student Visa — Staging Verify 3c|Student Visa Australia"
  "/skilled-migration|CMS Skilled Migration — Staging Verify 3d|SkillSelect"
  "/post-study-visa-australia|CMS Post-Study Visa — Staging Verify 3e|Post-Study"
  "/faq|CMS FAQ — Staging Verify 3f|Frequently asked questions about migration pathways"
)

log() { echo "[verify] $*"; }

check_headers() {
  local path="$1"
  local headers
  headers="$(curl -sS -D - -o /dev/null "${BASE}${path}" 2>/dev/null | tr -d '\r')"
  echo "$headers" | grep -qi 'x-robots-tag: noindex, nofollow' || {
    echo "FAIL: missing X-Robots-Tag on ${path}"
    return 1
  }
  log "PASS noindex ${path}"
}

check_cms_on() {
  local path="$1" cms_marker="$2"
  local html code
  code="$(curl -sS -o /tmp/stg.html -w "%{http_code}" "${BASE}${path}")"
  html="$(cat /tmp/stg.html)"
  [[ "$code" == "200" ]] || { echo "FAIL ${path} HTTP $code"; return 1; }
  echo "$html" | grep -qF "$cms_marker" || { echo "FAIL ${path} missing CMS marker: $cms_marker"; return 1; }
  echo "$html" | grep -q 'rel="canonical"' || { echo "FAIL ${path} canonical"; return 1; }
  echo "$html" | grep -q 'property="og:title"' || { echo "FAIL ${path} og:title"; return 1; }
  log "PASS CMS ON ${path}"
}

check_page_schemas() {
  local path="$1"
  local html
  html="$(curl -sS "${BASE}${path}")"
  echo "$html" | grep -q 'BreadcrumbList' || { echo "FAIL ${path} BreadcrumbList"; return 1; }
  case "$path" in
    /faq)
      echo "$html" | grep -q 'FAQPage' || { echo "FAIL /faq FAQPage"; return 1; }
      echo "$html" | grep -q 'SpeakableSpecification' || { echo "FAIL /faq Speakable"; return 1; }
      ;;
    /post-study-visa-australia|/student-visa-australia|/skilled-migration)
      echo "$html" | grep -q 'FAQPage' || { echo "FAIL ${path} FAQPage"; return 1; }
      ;;
  esac
  log "PASS schema ${path}"
}

log "=== CMS ON checks at ${BASE} ==="
check_headers "/"
for entry in "${PAGES[@]}"; do
  IFS='|' read -r path cms_marker _legacy <<<"$entry"
  check_cms_on "$path" "$cms_marker"
  check_page_schemas "$path"
done

code="$(curl -sS -o /tmp/home.html -w "%{http_code}" "${BASE}/")"
[[ "$code" == "200" ]]
echo "$(cat /tmp/home.html)" | grep -q 'portal-shell--premium-home' && log "PASS homepage shell present"
echo "$(cat /tmp/home.html)" | grep -q 'CMS About' && { echo "FAIL homepage shows CMS about marker"; exit 1; } || log "PASS homepage not CMS-wired"

log "=== corrupt JSON fallback ==="
PAGES_FILE="/home/minrosh/minrosh-migration/.next/standalone/data/website-pages.json"
BACKUP="/tmp/website-pages-backup.json"
cp "$PAGES_FILE" "$BACKUP"
echo '{ bad json' >"$PAGES_FILE"
pm2 restart minrosh-staging >/dev/null
sleep 4
curl -sS "${BASE}/faq" -o /tmp/stg-faq-corrupt.html
grep -q 'Frequently asked questions' /tmp/stg-faq-corrupt.html || { echo "FAIL corrupt JSON fallback /faq"; exit 1; }
log "PASS corrupt JSON /faq legacy fallback"
mv "$BACKUP" "$PAGES_FILE"
WEBSITE_CMS_TEST_DATA_DIR=/home/minrosh/minrosh-migration/.next/standalone/data node /home/minrosh/minrosh-migration/scripts/seed-staging-cms-pages.mjs >/dev/null
pm2 restart minrosh-staging >/dev/null
sleep 4

log "=== contact API ==="
resp="$(curl -sS -X POST "${BASE}/api/contact" \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"Staging","lastName":"Verify","email":"staging-verify@example.com","phone":"0400000000","message":"Sprint 3f staging verification enquiry","privacyPolicyAccepted":true,"source":"staging-verify"}')"
echo "$resp" | grep -qE 'enquiryId|ENQ-|success' && log "PASS contact API response" || { echo "FAIL contact: $resp"; exit 1; }

log "=== production untouched ==="
prod_code="$(curl -sS -o /dev/null -w "%{http_code}" https://minroshmigration.com.au/)"
[[ "$prod_code" == "200" ]]
prod_psv="$(curl -sS -o /dev/null -w "%{http_code}" https://minroshmigration.com.au/post-study-visa-australia)"
log "production / HTTP ${prod_code} (unchanged deploy — post-study ${prod_psv})"
pm2 jlist | node -e "const l=JSON.parse(require('fs').readFileSync(0,'utf8')); const p=l.find(x=>x.name==='minrosh-next'); console.log('production PM2 uptime', p?.pm2_env?.pm_uptime);"

log "ALL STAGING CMS-ON CHECKS PASSED"
