# Website Manager CMS — Sprint 2 Report

**Branch:** `feature/website-cms`  
**Date:** 2026-06-27  
**Scope:** Publish, version history, rollback, draft preview, staging noindex, permissions, media upload, SEO preview, docs  
**Production deploy:** No  
**Public page routes changed:** No  
**`NEXT_PUBLIC_WEBSITE_CMS_ENABLED` on production:** Not enabled  

---

## Sprint 2 deliverables

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Save Draft / Publish workflow | Done |
| 2 | Version history | Done (`data/website-versions.json`) |
| 3 | Rollback (restore draft / published / unpublish) | Done |
| 4 | Next.js Draft Mode preview | Done (`/api/draft` → admin preview route) |
| 5 | Staging noindex | Done (`middleware.js` + `STAGING_SITE`) |
| 6 | Role permissions | Done (`website:read/write/publish`) |
| 7 | Media upload | Done (POST `/api/admin/website/media`) |
| 8 | SEO preview panel | Done |
| 9 | Owner guide | [`docs/WEBSITE-CMS-OWNER-GUIDE.md`](../docs/WEBSITE-CMS-OWNER-GUIDE.md) |
| 10 | Rollback runbook | [`docs/WEBSITE-CMS-ROLLBACK-RUNBOOK.md`](../docs/WEBSITE-CMS-ROLLBACK-RUNBOOK.md) |
| 11 | `npm run lint` | Pass |
| 12 | `npm run build` | Pass |
| 13 | Public site unchanged | Confirmed — no public route wiring |

---

## New admin capabilities

| Feature | How to use |
|---------|------------|
| **Publish** | Page editor → Publish (requires `website:publish`) |
| **Version history** | Page editor → Version history panel |
| **Rollback** | Restore to draft / Restore published |
| **Preview** | Page editor → Preview, or `/admin/website/preview/{slug}` |
| **Draft Mode API** | `/api/draft?secret=...&slug=about` (admin session + `WEBSITE_CMS_DRAFT_SECRET`) |
| **Media upload** | Website Manager → Media |
| **SEO preview** | Page editor → Search preview box |

---

## New / modified files (Sprint 2)

**New:**
- `lib/website/permissions.js`, `lib/website/version-store.js`
- `app/api/admin/website/pages/[slug]/publish/route.js`
- `app/api/admin/website/pages/[slug]/versions/route.js`
- `app/api/admin/website/pages/[slug]/rollback/route.js`
- `app/api/admin/website/media/[id]/file/route.js`
- `app/api/draft/route.js`, `app/api/draft/disable/route.js`
- `app/admin/(secure)/website/preview/[slug]/page.js`
- `features/admin-panel/components/website/website-seo-preview.jsx`
- `tests/website-cms-publish.test.mjs`, `tests/website-cms-permissions.test.mjs`
- `docs/WEBSITE-CMS-OWNER-GUIDE.md`, `docs/WEBSITE-CMS-ROLLBACK-RUNBOOK.md`
- `scripts/website-cms-emergency-off.mjs`

**Modified:**
- `lib/website/pages-store.js` (publish, rollback, dedupe by slug)
- `lib/website/media-store.js` (upload)
- `lib/admin/auth-route.js` (`requireWebsiteWrite`, `requireWebsitePublish`)
- `lib/admin/audit-actions.js`
- `middleware.js` (staging noindex)
- `features/admin-panel/components/website/website-page-editor-panel.jsx`
- `features/admin-panel/components/website/website-media-panel.jsx`
- `features/admin-panel/components/website/website-dashboard-panel.jsx`
- `.env.example`, `lib/zone-manifest.mjs`

---

## Verification

```bash
npm run lint                                              # ✔
npx vitest run tests/website-cms-*.test.mjs               # ✔ 6 tests
ACKNOWLEDGE_SHARED_RISK=1 ACKNOWLEDGE_UNKNOWN_RISK=1 npm run build  # ✔
```

---

## Public site impact

**None.** No changes to `app/page.js`, `/about`, `/contact`, or other public routes. CMS flag remains off by default.

---

## Next step (after owner review)

Connect **`/about` on staging only** — wait for owner desktop/mobile approval before live or next page.

Do **not** enable `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true` on production until staging sign-off.
