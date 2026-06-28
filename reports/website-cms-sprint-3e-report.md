# Website CMS — Sprint 3e Report (`/post-study-visa-australia` only)

**Branch:** `feature/website-cms`  
**Date:** 2026-06-28  
**Scope:** Create and connect public `/post-study-visa-australia` to Website Manager CMS on **staging only**. No other public routes. **No production deploy.**

**Prerequisite:** Sprint 3d (`/skilled-migration`) approved; CMS foundation committed on `feature/website-cms`.

---

## Pre-flight

| Check | Result |
|-------|--------|
| `feature/website-cms` committed (foundation) | Yes — commit `e38866c` |
| `npm run lint` | Pass |
| `npm run build` | Pass |
| `npm run test:unit` | Pass (77 tests) |
| Production CMS flag | Remains **OFF** (`.env.example` commented) |

---

## Summary

Sprint 3e **creates** the new route `/post-study-visa-australia` and wires it to Website Manager:

1. `getPageForRenderOnRoute("/post-study-visa-australia")` loads published CMS sections when `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true`.
2. CMS path renders blocks via `PageRenderer`; **breadcrumb + FAQ JSON-LD preserved** from `data/seo-pages.json` (`servicePages.postStudyVisa`).
3. If CMS is off, empty, unpublished, corrupt, or unreadable → **full legacy ContentPage guide** (hero strip, eligibility checklist, hub navigator, sections, FAQ, related links).
4. SEO defaults from new `postStudyVisa` entry in `seo-pages.json`; optional CMS SEO overrides merge when published fields are non-empty.
5. Route added to sitemap (`STATIC_SITEMAP_ROUTES`, priority `0.88`).
6. Page already listed in `WEBSITE_PAGE_REGISTRY` for admin editor.

**Stopped after `/post-study-visa-australia`.** Await owner approval before header/footer, FAQ hub, country pages, or homepage.

---

## Changed files (Sprint 3e)

| File | Change |
|------|--------|
| `app/post-study-visa-australia/page.js` | **New** — thin CMS wrapper + metadata |
| `components/post-study-visa-australia/post-study-visa-australia-legacy-page.jsx` | **New** — default guide (fallback) |
| `components/post-study-visa-australia/post-study-visa-australia-cms-page.jsx` | **New** — `PageRenderer` + preserved JSON-LD |
| `lib/website/post-study-visa-australia-metadata.js` | **New** — default SEO + CMS merge |
| `data/seo-pages.json` | **New** `servicePages.postStudyVisa` content |
| `lib/public-indexable-routes.js` | Sitemap route + priority |
| `components/seo/hub-cluster-navigator.jsx` | Student hub link to new guide |
| `lib/zone-manifest.mjs` | Classify new app/components paths as public |
| `tests/website-cms-post-study-visa-fallback.test.mjs` | **New** — flag off, publish path, corrupt JSON |

**Not changed:** CRM, contact APIs, homepage, header, footer nav arrays, other public routes, production deploy.

---

## Implementation

### Route wrapper

```js
const cmsContent = await getPageForRenderOnRoute("/post-study-visa-australia");
if (cmsContent?.sections?.length) return <PostStudyVisaAustraliaCmsPage content={cmsContent} />;
return <PostStudyVisaAustraliaLegacyPage />;
```

### CMS path structured data (preserved)

- `breadcrumbJsonLd` — Home → Post-Study Visa Australia
- `faqJsonLd(pageData.faq)` — 5 FAQ entries from `seo-pages.json`

### Legacy path

Premium guide layout matching student/skilled pages: `PageHeroStrip`, eligibility checklist, `HubClusterNavigator` (student category), sections, FAQ accordion, related guides, CTAs.

---

## Verification

### Automated

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass |
| `tests/website-cms-post-study-visa-fallback.test.mjs` | 3/3 pass |
| Full unit suite | 77/77 pass |

### Manual (local staging simulation)

| Scenario | Port | CMS flag | Result |
|----------|------|----------|--------|
| Legacy fallback | 3200 | OFF | Full ContentPage guide renders |
| CMS published | 3201 | ON | CMS hero + text blocks render |
| Corrupt JSON | — | ON (test) | Legacy fallback (vitest) |

### SEO / schema / sitemap

| Item | Verified |
|------|----------|
| Canonical URL | Yes |
| OG title / description | Yes |
| `BreadcrumbList` JSON-LD | Yes |
| `FAQPage` JSON-LD | Yes |
| `sitemap.xml` entry | `https://minroshmigration.com.au/post-study-visa-australia` |

Screenshots: `reports/website-cms-sprint-3e-screenshots/`

---

## Staging test plan (owner)

1. Deploy `feature/website-cms` to staging with `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=false` → confirm legacy guide at `/post-study-visa-australia`.
2. Enable CMS flag on staging only → publish draft in Website Manager → confirm CMS blocks render.
3. Toggle flag OFF → confirm legacy returns instantly.
4. Desktop + mobile visual review against student/skilled guide pages.

---

## Out of scope (unchanged)

- Homepage, header, footer CMS wiring
- Production deploy
- `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true` on production
