# Website CMS — Sprint 3a Report (`/about` only)

**Branch:** `feature/website-cms`  
**Date:** 2026-06-27  
**Scope:** Connect public `/about` to Website Manager CMS on **staging only**. No other public routes. **No production deploy.**

---

## Summary

Sprint 3a adds a thin CMS wrapper to `/about`:

1. `getPageForRenderOnRoute("/about")` loads published CMS sections when `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true`.
2. If CMS is off, empty, unpublished, corrupt, or unreadable → **legacy `/about` renders unchanged**.
3. SEO defaults (`ABOUT_PAGE_SEO`) remain intact; optional CMS SEO overrides merge only when published SEO fields are non-empty.

**Stopped after `/about`.** Await owner approval before `/contact` or any other page.

---

## Changed files (Sprint 3a — public wiring)

| File | Change |
|------|--------|
| `app/about/page.js` | Thin wrapper: metadata + CMS vs legacy branch |
| `components/about/about-legacy-page.jsx` | **New** — original `/about` content extracted unchanged |
| `components/about/about-cms-page.jsx` | **New** — `SiteShell`, breadcrumbs, JSON-LD, `PageRenderer` |
| `lib/website/about-metadata.js` | **New** — default SEO + `buildAboutPageMetadata()` |
| `lib/website/cms-loader.js` | `getPageForRenderOnRoute()`, try/catch on SEO + store reads |
| `lib/zone-manifest.mjs` | Classify `components/about/` as public |
| `tests/website-cms-about-fallback.test.mjs` | **New** — flag off, publish path, corrupt JSON |

Prior sprints (admin, stores, blocks) remain on the same branch but were **not** extended to other public routes in 3a.

---

## Implementation

### Route wrapper (`app/about/page.js`)

```js
const cmsContent = await getPageForRenderOnRoute("/about");
if (cmsContent?.sections?.length) return <AboutCmsPage content={cmsContent} />;
return <AboutLegacyPage />;
```

### Fallback conditions (returns legacy)

- `NEXT_PUBLIC_WEBSITE_CMS_ENABLED !== "true"`
- No published sections
- `data/website-pages.json` missing, empty, or corrupt (logged, no crash)
- Draft preview with no draft sections (falls through to published, then legacy)

### SEO

- `generateMetadata()` → `getCmsSeoForSlug("/about")` + `buildAboutPageMetadata()`
- Legacy title, description, keywords, canonical, and OG tags preserved when CMS SEO is empty
- Breadcrumb JSON-LD kept in both legacy and CMS paths

---

## Verification

### Automated

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass (with `ACKNOWLEDGE_SHARED_RISK=1 ACKNOWLEDGE_UNKNOWN_RISK=1`) |
| `tests/website-cms-about-fallback.test.mjs` | 3/3 pass |
| All CMS tests (`website-cms-*.test.mjs`) | 8/8 pass |

### Manual (local staging simulation)

| Scenario | Port | Flag | HTTP | Content marker |
|----------|------|------|------|----------------|
| Legacy fallback | 3101 | `false` (default) | 200 | `Initial profile orientation`, `Case Strategy Lead` |
| CMS published | 3102 | `true` | 200 | `CMS About — Staging Preview` |
| Corrupt `website-pages.json` | 3102 | `true` | 200 | Legacy markers (no crash) |

**Admin → publish → public update:** Saved draft + published via `/api/admin/website/pages/about` and `/publish`; public `/about` on port 3102 reflected CMS hero + text blocks immediately after publish.

---

## Staging deployment checklist

**Staging only** — do **not** set on production:

```env
NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true
STAGING_SITE=true
# optional draft preview:
# WEBSITE_CMS_DRAFT_SECRET=...
```

**Production must keep:**

```env
NEXT_PUBLIC_WEBSITE_CMS_ENABLED=false
```

### Test matrix on staging

1. **Flag OFF** → `/about` shows full legacy page (timeline, team, trust stats).
2. **Flag ON, no published content** → legacy fallback.
3. **Flag ON, publish hero + text in admin** → CMS blocks via `PageRenderer`.
4. **Corrupt `data/website-pages.json`** → legacy fallback, HTTP 200.
5. **Unpublish / empty published sections** → legacy fallback.
6. View **desktop + mobile**; confirm metadata in page source matches defaults unless CMS SEO filled.

---

## Screenshots / video

Captured during local verification (Cursor browser). Files saved under:

`reports/website-cms-sprint-3a-screenshots/`

| File | Description |
|------|-------------|
| `about-legacy-desktop-cms-off.png` | Legacy `/about` — CMS flag off |
| `about-cms-desktop-cms-on.png` | CMS hero + text — flag on |
| `about-cms-mobile-cms-on.png` | CMS content — mobile viewport (390×844) |
| `admin-about-edit-publish.png` | Admin editor with Publish, version history |

**Recommended owner video (staging):**

1. Open `/admin/website/pages/about`, edit hero heading, Save draft → Publish.
2. Open staging `/about` (desktop + mobile) — confirm new heading.
3. Set `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=false` on staging → reload `/about` — confirm legacy page.

---

## Out of scope (unchanged)

- Homepage, header, footer, `/contact`, other public routes
- CRM, leads, invoices, Smart Navigator, contact APIs, analytics, admin auth
- Production deploy and production CMS flag enablement
- Removal of legacy `/about` content

---

## Next step (blocked on owner approval)

**Sprint 3b:** Connect `/contact` using the same thin-wrapper pattern after explicit sign-off on staging `/about`.
