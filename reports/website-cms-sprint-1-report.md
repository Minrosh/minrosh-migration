# Website Manager CMS — Sprint 0 + Sprint 1 Report

**Branch:** `feature/website-cms`  
**Date:** 2026-06-27  
**Scope:** Sprint 0 (stores + feature flag) and Sprint 1 (admin UI + APIs only)  
**Production deploy:** No  
**Public page routes changed:** No  
**`NEXT_PUBLIC_WEBSITE_CMS_ENABLED`:** Not set (defaults off)

---

## Sprint deliverables

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Changed-files report | This document + git file list below |
| 2 | Admin CMS UI at `/admin/website` | Done |
| 3 | Drafts save to JSON | Verified (`tests/website-cms-pages-store.test.mjs`) |
| 4 | `npm run lint` | Pass |
| 5 | `npm run build` | Pass (with `ACKNOWLEDGE_SHARED_RISK=1` for zone-manifest update) |
| 6 | No public page route changes | Confirmed — no edits to `app/page.js`, `/about`, `/contact`, etc. |

---

## What was built

### Sprint 0
- Feature branch `feature/website-cms`
- JSON seed files: `data/website-*.seed.json`
- Store paths in `lib/admin/paths.js`
- Media storage dir: `storage/website-media/`
- `.env.example`: `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=false` documented

### Sprint 1
- **Admin nav:** Website Manager group → `/admin/website`
- **Admin pages:** dashboard, page editor, compliance, header/footer, media
- **APIs:** `/api/admin/website/pages`, `pages/[slug]`, compliance, navigation, footer, media
- **Libraries:** `lib/website/*` (block schemas, corruption-safe store reads, pages store, cms-loader with flag)
- **Block renderers:** `components/website-blocks/*` (admin preview only — not wired to public routes)
- **Audit actions:** website draft save, compliance, navigation, footer
- **Zone manifest:** classified new CMS paths as admin zone

---

## Admin URLs (dev/staging)

| URL | Purpose |
|-----|---------|
| `/admin/website` | Page list + CMS status |
| `/admin/website/pages/about` | Edit `/about` draft |
| `/admin/website/compliance` | MARN + disclaimers |
| `/admin/website/navigation` | Header links + footer line |
| `/admin/website/media` | Media library (upload in Sprint 2) |

---

## Changed files (CMS work only)

**Modified:**
- `.env.example`
- `features/admin-panel/components/admin-shell.jsx`
- `lib/admin/audit-actions.js`
- `lib/admin/paths.js`
- `lib/zone-manifest.mjs`

**New (44 files):**
- `app/admin/(secure)/website/**` (5 pages)
- `app/api/admin/website/**` (6 routes)
- `components/website-blocks/**` (5 files)
- `features/admin-panel/components/website/**` (5 panels)
- `lib/website/**` (9 modules)
- `data/website-*.seed.json` (7 seeds)
- `storage/website-media/.gitkeep`
- `tests/website-cms-pages-store.test.mjs`

**Not part of this sprint (pre-existing local changes):**
- `README.md`
- `docs/SYSTEM-ARCHITECTURE-AND-DEVELOPER-GUIDE.md`

---

## Verification commands run

```bash
npm run lint                                    # ✔ No ESLint warnings or errors
ACKNOWLEDGE_SHARED_RISK=1 npm run build          # ✔ Build succeeded
npx vitest run tests/website-cms-pages-store.test.mjs  # ✔ Draft save proof
```

---

## Public site impact

**None.** The live public website should look and behave exactly the same because:

1. No public route files were modified
2. `NEXT_PUBLIC_WEBSITE_CMS_ENABLED` is not `true`
3. `cms-loader.js` returns `null` when flag is off → legacy content would render if wired (not wired yet)

---

## Next step (Sprint 2 — after owner review)

Do **not** connect public pages until Sprint 2 is complete on staging:

- Draft Mode preview API
- Publish + version history + rollback
- Staging `noindex` middleware
- SEO preview panel in page editor
- Media upload

After Sprint 2 passes on staging → connect **`/about` only** on staging and wait for owner approval before live.

---

## Screenshots

Capture manually after logging into admin on dev/staging:

1. `/admin/website` — page list with “Sprint 1 — admin only” banner
2. `/admin/website/pages/about` — hero/text block editor + preview panel
3. Save draft → confirm `data/website-pages.json` updated on server
