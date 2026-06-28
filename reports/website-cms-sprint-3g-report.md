# Website CMS — Sprint 3g Report (Header/Footer only)

**Branch:** `feature/website-cms`  
**Date:** 2026-06-28  
**Scope:** Header + footer CMS wiring on **staging only**  
**Production deploy:** **No**  
**Production CMS flag:** **OFF**

---

## Summary

Sprint 3g wires **editable text/links/settings** for site chrome into Website Manager stores, with mandatory legacy fallback:

1. `getResolvedSiteChrome()` merges `website-navigation.json`, `website-footer.json`, and `website-compliance.json` when `NEXT_PUBLIC_WEBSITE_CMS_ENABLED=true`.
2. If CMS is off, empty, corrupt, or unreadable → **existing header/footer render unchanged**.
3. `SiteShell` is now async and passes resolved chrome to header/footer components.
4. Destination hub pages still use `getDestinationNavLinks()` (unchanged).

**Stopped after header/footer.** Homepage, country pages, and production CMS enablement remain out of scope.

---

## CMS-editable fields

| Area | Fields |
|------|--------|
| Header nav | `primaryLinks[]` (label, href) |
| Header CTA | `headerCtaLabel`, `headerCtaHref` |
| Footer columns | `linkGroups[]` (title, links) |
| Footer contact | `contactPhone`, `contactEmailLabel` |
| Footer copy | `footerTagline`, `footerSummary`, `complianceLine` |
| Social | `social.{facebook,instagram,linkedin,youtube,x,tiktok}` overrides |
| Compliance | `showMarn`, `marnText`, `disclaimerText`, `footerComplianceWording` |

No drag-and-drop navigation editor. Structure and CSS unchanged.

---

## Changed files

| File | Change |
|------|--------|
| `lib/website/site-chrome-defaults.js` | **New** — legacy nav/footer/CTA defaults |
| `lib/website/site-chrome-loader.js` | **New** — CMS merge + fallback |
| `lib/website/navigation-store.js` | Header CTA fields |
| `lib/website/footer-store.js` | Footer contact, social, copy fields |
| `components/site-shell.js` | Async; loads chrome |
| `components/site-header-nav.jsx` | `headerCta` prop |
| `components/site-footer.jsx` | Dynamic link groups + notices |
| `components/site-footer-interactive.jsx` | Tagline/summary/contact overrides |
| `components/site-header-mobile-utilities.jsx` | Dynamic phone from brand |
| `app/api/admin/website/navigation/route.js` | Accept header CTA fields |
| `app/api/admin/website/footer/route.js` | Accept extended footer fields |
| `tests/website-cms-header-footer-fallback.test.mjs` | **New** — 4 tests |
| `scripts/seed-staging-chrome.mjs` | Staging verification seed |

**Not changed:** homepage content, CRM, leads, invoices, Smart Navigator, contact APIs, analytics, admin auth, page-level CMS routes.

---

## Staging verification (port 3001)

| Check | Result |
|-------|--------|
| CMS ON — CMS nav labels + CTA | Pass (`CMS Home`, `CMS Book consult`) |
| CMS ON — footer notice/tagline | Pass |
| CMS OFF — legacy nav + notice | Pass (`Australian visas`, `Book consultation`, `General information only`) |
| Corrupt JSON fallback | Pass (vitest) |
| Homepage unchanged | Pass (not CMS-wired) |
| `X-Robots-Tag: noindex` on staging | Pass |
| Production CMS flag | **OFF** |
| Production PM2 not redeployed | Confirmed |

Screenshots: `reports/website-cms-sprint-3g-screenshots/`

---

## Automated gates

| Command | Result |
|---------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass |
| `npm run test:unit` | **84/84** pass |

---

## Owner approval checklist

Before production code deploy (CMS still OFF):

- [ ] Review staging header desktop + mobile menu
- [ ] Confirm all nav links work (including mega menu for visa hubs when legacy labels used)
- [ ] Confirm footer phone, email label, WhatsApp, social icons
- [ ] Toggle CMS OFF on staging → legacy header/footer returns
- [ ] Confirm homepage hero unchanged

---

## Next step (blocked on owner approval)

**Sprint 3h** — Country pages on staging only. **Homepage remains last.**
