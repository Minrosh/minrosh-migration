#!/usr/bin/env bash
# Non-destructive checks before npm run build or deploy (see docs/pre-release-checklist.md).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Branch / remote"
git status -sb

echo ""
echo "==> Diff stat (staged + unstaged)"
git diff --stat
git diff --cached --stat 2>/dev/null || true

echo ""
echo "==> Untracked (first 40 lines)"
git status -u --porcelain | grep '^??' | head -40 || true

echo ""
echo "==> Brochure PDF changed?"
if git diff --quiet -- public/assets/minrosh-email-brochure.pdf 2>/dev/null; then
  echo "    (no unstaged diff for brochure)"
else
  echo "    WARNING: public/assets/minrosh-email-brochure.pdf has local changes (often from npm run build)."
fi

echo ""
echo "OK — review output above, then run: npm run build"
