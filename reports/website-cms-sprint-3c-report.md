# Website CMS — Sprint 3c Report (`/student-visa-australia` only)

**Branch:** `feature/website-cms`  
**Date:** 2026-06-27  
**Scope:** Connect public `/student-visa-australia` to Website Manager CMS on **staging only**. No other public routes. **No production deploy.**

**Prerequisites:** Sprint 3b (`/contact`) approved after staging review.

---

## Pre-flight checks (before Sprint 3c)

| Check | Result |
|-------|--------|
| Staging URL reachable (`staging.minroshmigration.com.au/contact`) | **Not reachable** from this dev environment (connection failed). Owner should re-verify on live staging host. |
| Local `/contact` (CMS flag OFF) | HTTP 200 — legacy copy + `#contact-enquiry-form` present |
| Local contact API POST | Validation passes; enquiry ID assigned (`ENQ-…`). Upstream save may fail without Supabase in dev — **unchanged API behaviour** |
| Production CMS flag | **OFF** (no code change; `.env.example` documents `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=false`) |

---

## Summary

Sprint 3c adds a thin CMS wrapper to `/student-visa-australia`:

1. `getPageForRenderOnRoute("/student-visa-australia")` loads published CMS sections when `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true`.
2. CMS path renders blocks via `PageRenderer` inside the guide shell; **breadcrumb + FAQ JSON-LD preserved** from `data/seo-pages.json`.
3. If CMS is off, empty, unpublished, corrupt, or unreadable → **full legacy ContentPage guide unchanged** (hero, lifestyle block, hub navigator, sections, FAQ UI, related links, CTAs).
4. SEO defaults from `seo-pages.json` remain intact; optional CMS SEO overrides merge only when published SEO fields are non-empty.

**Stopped after `/student-visa-australia`.** Await owner approval before `/skilled-migration` or any other page.

---

## Changed files (Sprint 3c — public wiring)

| File | Change |
|------|--------|
| `app/student-visa-australia/page.js` | Thin wrapper: metadata + CMS vs legacy branch |
| `components/student-visa-australia/student-visa-australia-legacy-page.jsx` | **New** — original page extracted unchanged |
| `components/student-visa-australia/student-visa-australia-cms-page.jsx` | **New** — `PageRenderer` + preserved JSON-LD |
| `lib/website/student-visa-australia-metadata.js` | **New** — default SEO + CMS merge |
| `lib/zone-manifest.mjs` | Classify `components/student-visa-australia/` as public |
| `tests/website-cms-student-visa-fallback.test.mjs` | **New** — flag off, publish path, corrupt JSON |

**Not changed:** contact APIs, CRM, homepage, header, footer, other public routes, `components/content-page`, lifestyle/hub components (used only in legacy path).

---

## Implementation

### Route wrapper

```js
const cmsContent = await getPageForRenderOnRoute("/student-visa-australia");
if (cmsContent?.sections?.length) return <StudentVisaAustraliaCmsPage content={cmsContent} />;
return <StudentVisaAustraliaLegacyPage />;
```

### CMS path structured data (preserved)

- `breadcrumbJsonLd` — Home → Student Visa Australia
- `faqJsonLd(pageData.faq)` — legacy FAQ entries from `seo-pages.json` (5 questions)

### Legacy path

Identical to pre-Sprint 3c: `ContentPage` with hero strip, eligibility checklist, lifestyle experience block, hub navigator, sections, FAQ accordion, related guides, premium CTAs.

---

## Verification

### Automated

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass (with `ACKNOWLEDGE_SHARED_RISK=1 ACKNOWLEDGE_UNKNOWN_RISK=1`) |
| `tests/website-cms-student-visa-fallback.test.mjs` | 3/3 pass |
| Route fallback tests (about + contact + student) | 9/9 pass |

### Manual (local staging simulation)

| Scenario | Flag | HTTP | Markers |
|----------|------|------|---------|
| Legacy fallback | OFF | 200 | `Genuine Student`, full ContentPage |
| CMS published | ON | 200 | `CMS Student Visa — Staging Preview` |
| Corrupt `website-pages.json` | ON | 200 | Legacy `Genuine Student` (no crash) |

### SEO / schema (CMS path, flag ON)

| Item | Verified |
|------|----------|
| `<title>` | `Student Visa Australia – Subclass 500 \| MinRosh Migration` |
| Canonical | `https://minroshmigration.com.au/student-visa-australia` |
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

1. `/contact` — legacy or CMS layout; form submits; enquiry visible in admin/leads.
2. `/student-visa-australia` flag OFF → full legacy guide.
3. Flag ON + published CMS blocks → CMS hero/text; FAQ schema still in page source.
4. Corrupt/missing `website-pages.json` → legacy fallback.
5. Desktop + mobile views.

---

## Screenshots

See `reports/website-cms-sprint-3c-screenshots/README.md`:

- Legacy desktop (CMS off)
- CMS desktop + mobile (CMS on)
- Admin editor (Publish)
- SEO/schema verified via curl (documented above)

---

## Out of scope (unchanged)

- Homepage, header, footer, `/about`, `/contact` (prior sprints), other public routes
- CRM, leads, invoices, Smart Navigator, contact APIs, analytics, admin auth
- Production deploy and production CMS flag enablement
- Page redesign; legacy content removal

---

## Next step (blocked on owner approval)

Connect `/skilled-migration` using the same thin-wrapper pattern after explicit sign-off on staging `/student-visa-australia`.
