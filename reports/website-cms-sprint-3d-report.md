# Website CMS — Sprint 3d Report (`/skilled-migration` only)

**Branch:** `feature/website-cms`  
**Date:** 2026-06-27  
**Scope:** Connect public `/skilled-migration` to Website Manager CMS on **staging only**. No other public routes. **No production deploy.**

**Prerequisite:** Sprint 3c (`/student-visa-australia`) approved by owner after real staging review.

---

## Pre-flight

| Check | Result |
|-------|--------|
| Sprint 3c owner approval | Assumed per user instruction to proceed |
| Staging host reachable from dev | `staging.minroshmigration.com.au` not reachable here — owner verifies on live staging |
| Production CMS flag | Remains **OFF** (no production deploy) |

---

## Summary

Sprint 3d adds a thin CMS wrapper to `/skilled-migration`:

1. `getPageForRenderOnRoute("/skilled-migration")` loads published CMS sections when `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true`.
2. CMS path renders blocks via `PageRenderer`; **breadcrumb + FAQ JSON-LD preserved** from `data/seo-pages.json`.
3. If CMS is off, empty, unpublished, corrupt, or unreadable → **full legacy ContentPage guide unchanged** (VisaRailSkilledAu left rail, hub navigator, sections, FAQ UI, related links, CTAs).
4. SEO defaults from `seo-pages.json` remain intact; optional CMS SEO overrides merge only when published SEO fields are non-empty.

**Stopped after `/skilled-migration`.** Await owner approval before `/post-study-visa-australia` or any other page.

---

## Changed files (Sprint 3d — public wiring)

| File | Change |
|------|--------|
| `app/skilled-migration/page.js` | Thin wrapper: metadata + CMS vs legacy branch |
| `components/skilled-migration/skilled-migration-legacy-page.jsx` | **New** — original page extracted unchanged |
| `components/skilled-migration/skilled-migration-cms-page.jsx` | **New** — `PageRenderer` + preserved JSON-LD |
| `lib/website/skilled-migration-metadata.js` | **New** — default SEO + CMS merge |
| `lib/zone-manifest.mjs` | Classify `components/skilled-migration/` as public |
| `tests/website-cms-skilled-migration-fallback.test.mjs` | **New** — flag off, publish path, corrupt JSON |

**Not changed:** CRM, contact APIs, homepage, header, footer, other public routes, `components/content-page`, `VisaRailSkilledAu`.

---

## Implementation

### Route wrapper

```js
const cmsContent = await getPageForRenderOnRoute("/skilled-migration");
if (cmsContent?.sections?.length) return <SkilledMigrationCmsPage content={cmsContent} />;
return <SkilledMigrationLegacyPage />;
```

### CMS path structured data (preserved)

- `breadcrumbJsonLd` — Home → Skilled Migration Australia
- `faqJsonLd(pageData.faq)` — legacy FAQ entries (5 questions) from `seo-pages.json`

### Legacy path

Identical to pre-Sprint 3d: `ContentPage` with hero strip, `VisaRailSkilledAu`, eligibility checklist, hub navigator, sections, FAQ accordion, related guides, premium CTAs.

---

## Verification

### Automated

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass (with `ACKNOWLEDGE_SHARED_RISK=1 ACKNOWLEDGE_UNKNOWN_RISK=1`) |
| `tests/website-cms-skilled-migration-fallback.test.mjs` | 3/3 pass |

### Manual (local staging simulation)

| Scenario | Flag | HTTP | Markers |
|----------|------|------|---------|
| Legacy fallback | OFF | 200 | `189/190/491`, `SkillSelect`, full guide |
| CMS published | ON | 200 | `CMS Skilled Migration — Staging Preview` |
| Corrupt `website-pages.json` | ON | 200 | Legacy `SkillSelect` (no crash) |

### SEO / schema (CMS path, flag ON)

| Item | Verified |
|------|----------|
| `<title>` | `Skilled Migration Australia 189/190/491 \| MinRosh Migration` |
| Canonical | `https://minroshmigration.com.au/skilled-migration` |
| JSON-LD | `BreadcrumbList` + `FAQPage` present |
| FAQ content | Legacy FAQ question text in JSON-LD |

---

## Staging deployment checklist

**Staging only:**

```env
NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true
STAGING_SITE=true
```

**Production must keep:**

```env
NEXT_PUBLIC_WEBSITE_CMS_ENABLED=false
```

### Owner verification on live staging

1. `/skilled-migration` flag OFF → full legacy guide (left rail, sections, FAQ).
2. Flag ON + published CMS blocks → CMS hero/text; FAQ schema still in page source.
3. Corrupt/missing `website-pages.json` → legacy fallback.
4. Desktop + mobile views.
5. Admin edit → Publish → staging page update.

---

## Screenshots

See `reports/website-cms-sprint-3d-screenshots/README.md`:

- Legacy desktop (CMS off)
- CMS desktop + mobile (CMS on)
- Admin editor (Publish)
- SEO/schema verified via curl

---

## Out of scope (unchanged)

- Homepage, header, footer, prior sprint routes (`/about`, `/contact`, `/student-visa-australia`), other public routes
- CRM, leads, invoices, Smart Navigator, contact APIs, analytics, admin auth
- Production deploy and production CMS flag enablement
- Page redesign; legacy content removal

---

## Next step (blocked on owner approval)

Connect `/post-study-visa-australia` (or next approved page) after explicit sign-off on staging `/skilled-migration`.
