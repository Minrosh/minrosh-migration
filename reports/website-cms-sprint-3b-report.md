# Website CMS — Sprint 3b Report (`/contact` only)

**Branch:** `feature/website-cms`  
**Date:** 2026-06-27  
**Scope:** Connect public `/contact` to Website Manager CMS on **staging only**. No other public routes. **No production deploy.**

**Prerequisite:** Sprint 3a (`/about`) approved after staging review.

---

## Summary

Sprint 3b adds a thin CMS wrapper to `/contact`:

1. `getPageForRenderOnRoute("/contact")` loads published CMS sections when `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true`.
2. CMS blocks replace the **left marketing panel** only; `ContactLeadForm` is **always rendered unchanged** in the right column.
3. If CMS is off, empty, unpublished, corrupt, or unreadable → **legacy `/contact` renders unchanged** (including form, WhatsApp panel, trust signals).
4. SEO defaults from `data/seo-pages.json` remain intact; optional CMS SEO overrides merge only when published SEO fields are non-empty.
5. **No changes** to `/api/contact`, form submission logic, CRM, or lead handling.

**Stopped after `/contact`.** Await owner approval before `/student-visa-australia` or any other page.

---

## Changed files (Sprint 3b — public wiring)

| File | Change |
|------|--------|
| `app/contact/page.js` | Thin wrapper: metadata + CMS vs legacy branch |
| `components/contact/contact-legacy-page.jsx` | **New** — original `/contact` content extracted unchanged |
| `components/contact/contact-cms-page.jsx` | **New** — `PageRenderer` (left) + `ContactLeadForm` (right) |
| `lib/website/contact-metadata.js` | **New** — default SEO from `seo-pages.json` + CMS merge |
| `lib/zone-manifest.mjs` | Classify `components/contact/` as public |
| `tests/website-cms-contact-fallback.test.mjs` | **New** — flag off, publish path, corrupt JSON |

**Not changed:** `app/api/contact/route.js`, `components/contact-lead-form.js`, homepage, header, footer, other public routes.

---

## Implementation

### Route wrapper (`app/contact/page.js`)

```js
const cmsContent = await getPageForRenderOnRoute("/contact");
if (cmsContent?.sections?.length) return <ContactCmsPage content={cmsContent} />;
return <ContactLegacyPage />;
```

### CMS layout (`ContactCmsPage`)

- Same `SiteShell`, breadcrumb JSON-LD, and contact page CSS classes as legacy.
- Two-column grid preserved: CMS blocks in left `glass-card`, `#contact-enquiry-form` + `ContactLeadForm` on the right — identical markup/classes to legacy.

### Fallback conditions (returns legacy)

- `NEXT_PUBLIC_WEBSITE_CMS_ENABLED !== "true"`
- No published sections
- `data/website-pages.json` missing, empty, or corrupt (logged, no crash)

---

## Verification

### Automated

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass (with `ACKNOWLEDGE_SHARED_RISK=1 ACKNOWLEDGE_UNKNOWN_RISK=1`) |
| `tests/website-cms-contact-fallback.test.mjs` | 3/3 pass |
| All CMS tests (`website-cms-*.test.mjs`) | 11/11 pass |

### Manual (local staging simulation)

| Scenario | Flag | HTTP | Content marker |
|----------|------|------|----------------|
| Legacy fallback | OFF | 200 | `Clear next-step guidance from real humans`, `#contact-enquiry-form` |
| CMS published | ON | 200 | `CMS Contact — Staging Preview`, form present |
| Corrupt `website-pages.json` | ON | 200 | Legacy markers (no crash) |
| Contact API POST | ON | 200/422* | Validation passes; enquiry ID assigned |

\* Local POST reached save step; upstream email/Supabase may fail in dev (`supabase_not_configured`) — **API route and validation unchanged** from pre-Sprint 3b behaviour.

**Admin → publish → public update:** Saved + published via `/api/admin/website/pages/contact`; public `/contact` on CMS-enabled port reflected hero + text blocks while form remained interactive.

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

### Test matrix on staging

1. **Flag OFF** → full legacy contact page (copy, trust stats, WhatsApp, form).
2. **Flag ON, no published content** → legacy fallback.
3. **Flag ON, publish hero + text in admin** → CMS blocks left, form right.
4. **Submit contact form** → success/thank-you or expected validation (unchanged API).
5. **Corrupt `data/website-pages.json`** → legacy fallback, HTTP 200.
6. Desktop + mobile views.

---

## Screenshots

Captured during local verification. See `reports/website-cms-sprint-3b-screenshots/README.md` for filenames:

| File | Description |
|------|-------------|
| `contact-legacy-desktop-cms-off.png` | Legacy `/contact` — CMS flag off |
| `contact-cms-desktop-cms-on.png` | CMS hero + text + form — flag on |
| `contact-cms-mobile-cms-on.png` | CMS content — mobile viewport |
| `admin-contact-edit-publish.png` | Admin editor with Publish |

---

## Out of scope (unchanged)

- Homepage, header, footer, `/about` (already wired in 3a), other public routes
- Contact form API and submission logic
- CRM, leads, invoices, Smart Navigator, analytics, admin auth
- Production deploy and production CMS flag enablement
- Removal of legacy `/contact` content

---

## Next step (blocked on owner approval)

Connect `/student-visa-australia` (or next approved page) using the same thin-wrapper pattern after explicit sign-off on staging `/contact`.
