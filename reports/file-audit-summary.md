# File Audit Summary

Generated: 2026-06-24

## Totals

- **Files audited:** 700
- **Full CSV:** [file-audit-full.csv](./file-audit-full.csv)

## Recommended actions

| Action | Count |
|--------|-------|
| KEEP | 663 |
| REVIEW | 33 |
| MERGE | 4 |

## Categories

| Category | Count |
|----------|-------|
| Shared component | 258 |
| Admin workspace core | 121 |
| Data/config | 103 |
| Public website core | 86 |
| Documentation | 40 |
| Deployment/server | 35 |
| API/backend route | 32 |
| Test/CI | 20 |
| SEO/schema | 4 |
| Build/generated/cache | 1 |

## REVIEW queue (33)

- `app/api/news/route.js` — API may be called externally (cron, webhook, portal)
- `app/api/payments/checkout/route.js` — API may be called externally (cron, webhook, portal)
- `app/api/payments/webhook/route.js` — API may be called externally (cron, webhook, portal)
- `app/api/portal/invoices/route.js` — API may be called externally (cron, webhook, portal)
- `app/api/portal/payment-method/route.js` — API may be called externally (cron, webhook, portal)
- `app/api/portal/profile/route.js` — API may be called externally (cron, webhook, portal)
- `app/api/translate/route.js` — API may be called externally (cron, webhook, portal)
- `cleanup-dev-files.js` — No static importers detected in source scan
- `components/ai-concierge-lazy.jsx` — No static importers detected in source scan
- `components/ai-concierge.js` — No static importers detected in source scan
- `components/content-page.js` — Contains hardcoded MARN; centralize via site.json
- `components/country-coverage.js` — No static importers detected in source scan
- `components/exit-intent-popup.jsx` — No static importers detected in source scan
- `components/global-client-widgets.jsx` — No static importers detected in source scan
- `components/home-below-fold.jsx` — No static importers detected in source scan
- `components/home-deferred-carousels.jsx` — No static importers detected in source scan
- `components/quick-enquiry-form.jsx` — No static importers detected in source scan
- `components/site-topbar.js` — No static importers detected in source scan
- `components/sticky-mobile-cta.jsx` — No static importers detected in source scan
- `components/ui/pathway-infographics.jsx` — No static importers detected in source scan
- `components/ultra-maximum-effects.jsx` — No static importers detected in source scan
- `lib/client-portal/document-center.js` — No static importers detected in source scan
- `lib/content/site-config.js` — No static importers detected in source scan
- `lib/intelligence/veo.js` — No static importers detected in source scan
- `lib/navigator.js` — No static importers detected in source scan
- `lib/passport-ocr.js` — No static importers detected in source scan
- `lib/security/chat-limits.js` — No static importers detected in source scan
- `middleware.js` — No static importers detected in source scan
- `pages/500.js` — No static importers detected in source scan
- `public/scripts/dismiss-route-loading.js` — No static importers detected in source scan
- `public/scripts/theme-light.js` — No static importers detected in source scan
- `public/sw.js` — No static importers detected in source scan
- `tailwind.config.js` — No static importers detected in source scan

## SAFE TO DELETE candidates (0)

None flagged in Phase 1

## MERGE candidates (4)

- `app/api/admin/broadcast/route.js` — Duplicate nodemailer transport; consolidate to lib/contact.js
- `lib/intelligence/notifications.js` — Duplicate nodemailer transport; consolidate to lib/contact.js
- `lib/newsletter.js` — Duplicate nodemailer transport; consolidate to lib/contact.js
- `lib/nurture-sequences.js` — Duplicate nodemailer transport; consolidate to lib/contact.js

## Notes

- No files were deleted during audit generation.
- API routes in REVIEW may have external callers (cron, webhooks, Stripe).
- Legacy homepage cluster should only be removed after `npm run verify:ci` passes.
