# Website CMS — Staging QA report (master)

**Branch:** `feature/website-cms`  
**Date:** 2026-07-06

## Automated verification

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass |
| `npm run test:unit` | Pass |

## Connected routes

| Route | CMS | Legacy fallback |
|-------|-----|-----------------|
| `/about`, `/contact`, service guides, `/faq` | Yes | Yes |
| `/` homepage (hero protected) | Yes | Yes |
| `/destinations/*` hubs | Yes | Yes |
| Header / footer chrome | Yes | Yes |

## Safety

- Feature flag default off
- Staging noindex middleware
- Corrupt JSON → legacy fallback
- Homepage prod publish: `ownerApprovalConfirmed` + owner/super
- Migration seed: `node scripts/migrate-website-cms-seed.mjs` (draft only)

## Production

Not deployed — see `docs/WEBSITE-CMS-LIVE-DEPLOY-CHECKLIST.md`.
