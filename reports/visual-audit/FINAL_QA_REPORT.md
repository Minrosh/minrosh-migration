# Final QA report — MinRosh Migration

Date: 24 October 2026. Auditor role: independent check of the remediation branch. The changes were not assumed to be correct.

**Recommendation: NO-GO.**

This is not a production deployment. Nothing was merged. The live site and the existing private staging process were not updated.

## What was audited

The candidate is the uncommitted working tree on `fix/shared-layout-remediation` (`0941a76` plus local edits). It was built and served only from `/home/minrosh/releases/qa-final-20261024` at `http://127.0.0.1:3120`.

That path was used because `DO_NOT_BUILD_HERE.md` forbids `npm run build` inside `/home/minrosh/minrosh-migration` while production is in the split-runtime incident state. The in-place command was not run. The same `npm run build` script was run in the isolated directory and exited 0. `verify-robots-build-artifact` skipped a missing `robots.txt.body`; `robots.txt` from the running candidate was still HTTP 200 and is quoted below.

Production (`minrosh-next`, pid 1875, port 3000) is the September release `1455a66` under `/home/minrosh/releases/1455a66a319e29fe968ca6d74e086cdebaf3c049-20260908/.next/standalone`. Private staging (port 3001) is the same commit in `/home/minrosh/minrosh-staging-no-marn`. Neither host is this candidate.

## Pages discovered, audited, and verified

| Set | Count | How it was checked |
| --- | ---: | --- |
| Sitemap URLs on the candidate | 84 | `GET /sitemap.xml` |
| Public routes measured | 90 | Those 84, plus `/global-pathways`, `/thank-you`, `/maintenance`, `/newsletter/unsubscribe`, `/book-consultation`, and one unknown URL |
| Measurements | 270 | Every route at 390, 768, and 1440 wide, height 900, after `domcontentloaded` |
| Routes with a full design pass of every section | 0 | Not claimed |

`/global-pathways` returns 200 and is still absent from the sitemap. `/book-consultation` returns **308** to `/book-information-session`. The unknown URL returns **404**.

Internal links collected from the 1440px pass did not point at any extra same-origin path outside that route list, admin, API, or upload URLs. That is not a crawl of every hash link, external site, or logged-in page.

Screenshots for the sample and for failing routes are in `reports/visual-audit/screenshots/final-qa/`. Earlier before/after sets remain in `reports/visual-audit/screenshots/before/`, `phase2/`, `phase3/`, and `phase4/batch1/`. The machine-readable crawl is `reports/visual-audit/final-qa-crawl.json`.

## Command results

| Command | Result |
| --- | --- |
| Isolated `npm run build` | Exit 0. In-place build was not run. |
| `npm run test:unit` | Exit 0. 20 files, 107 tests. The contact dual-write test still logs `contact_supabase_dual_write_failed_pre_email`; that test expects the failure. |
| `npm run test:e2e` | Exit 1. **24 failed, 139 passed** in 1.5 minutes, `--workers=1`, `PLAYWRIGHT_LIVE_URL=http://127.0.0.1:3120`. Default `npm run test:e2e` would have built inside this tree, so it was pointed at the isolated server instead. |
| `npm run test:nav` | Exit 1. Public smoke routes loaded. One failure: after the homepage assessment CTA, the text “Smart Navigator” or “Visa Decision Engine” was not on `/assessment`. Admin checks were skipped because no admin password, cookie, or storage state was supplied. |
| `npm run routes:verify` | Exit 0 against `http://127.0.0.1:3120` and against `https://minroshmigration.com.au`. Each check is only HEAD of `/`, `/sitemap.xml`, and `/robots.txt`. |
| `npm run audit:indexability` | Candidate (`INDEXABILITY_BASE_URL=http://127.0.0.1:3120`): exit 0, 84 URLs, no heuristic flags. Copy: `reports/visual-audit/indexability-candidate.md`. Production default: exit 2. Live sitemap has 83 URLs and is missing `/visa-services`. Copy: `reports/visual-audit/indexability-production.md`. No Search Console export was supplied. |

### Playwright failures

Three visual-regression tests failed for real content defects:

- 390px: `/destinations/australia/skilled` and one news article had two visible H1s at check time; `/newsletter/unsubscribe` has a doubled title and no header.
- 768px: unsubscribe title and missing header.
- 1440px: two visible H1s on `/immigration-news`, several destination sections, and three news articles, plus the unsubscribe title and missing header.

Twenty-one mobile-layout failures were `Execution context was destroyed` during navigation, or two elements with `#main-content` (the destination loading shell plus the real main). Those duplicate-main failures match ISS-011. The destroyed-context failures were not re-run serially as a separate proof, so they are not all scored as layout bugs. They do mean the suite is not green.

## Defects rechecked

### Fixed on the candidate, with a rendered check

- **Sitemap dates.** `app/sitemap.js` no longer sets `lastModified` to `new Date()` for static routes. The candidate sitemap has 84 URLs and **7** `<lastmod>` values, matching the news items that have a real date. A static URL such as `/skilled-migration` has no `<lastmod>`. Unit tests cover the helper. Production has not received this change.
- **Brand suffix on pages that use `buildMetadata()`.** Service routes measured here, `/disclaimer` in the previous batch, and the homepage default show the brand once. This is not true of every route. See ISS-004 below.
- **Homepage hero scale, from this crawl.** H1 is 36px at 390, 44px at 768, and 56px at 1440. It was not covered by the header. No horizontal overflow on the homepage.
- **Service-page phone header, for pages that do not load `home.css`.** At 390px the header is static and the heading is not covered. Example: `/skilled-migration`.
- **No missing image alt** on images taller than 8px in the 270 measurements.
- **No horizontal overflow** on the 270 measurements.

### Still open, confirmed again

- **ISS-023 / contact and official-sources overlap (P1).** At 390px, `/contact` header is `position: fixed`, bottom 125px, H1 top 81px, overlap **44px**, H1 30px. `/australian-visas-official-sources` overlap is **22px**. Both are also covered at 768px. At 1440px they are not covered. The 390px contact screenshot shows the first line of the heading clipped under Destinations and the icon buttons: `reports/visual-audit/screenshots/final-qa/390x900/contact.png`. Pages that import `home.css` keep the header fixed, while the phone rule sets main padding to 10px.
- **ISS-004 (P1), not fully fixed.** `/newsletter/unsubscribe` title is `Unsubscribe | MinRosh Migration | MinRosh Migration` at all three widths. The page sets that suffix itself and does not go through the strip in `buildMetadata()`. It also has no site header or footer. **46** document titles at 1440px are longer than 60 characters. The longest measured is `/destinations/australia/education` at 89 characters.
- **ISS-005 (P1).** The homepage still shows “Explore General Information” and “Education Course Enquiry” four times each.
- **ISS-007 (P1).** `/this-route-should-404-qa` is HTTP 404, has no header, and the H1 “Page not found” computes at **16px**. The document title is the homepage default.
- **ISS-011 (P2).** Destination and news HTML can expose two visible H1s and two `#main-content` nodes while the loading shell is present. The expanded test failed on this.
- **ISS-013 (P2).** Candidate sitemap includes `/visa-services` and still omits `/global-pathways`. Production sitemap omits `/visa-services` because production is the older release.
- **ISS-001, ISS-008, ISS-009, ISS-012, ISS-014, ISS-015, ISS-016, ISS-017, ISS-018, ISS-019, ISS-020** remain open. ISS-001 was not re-measured section by section in this pass; the carousel code was not part of the candidate diff that this audit re-rendered in detail. ISS-008 is still active: the candidate returned **429** from `/api/stats` on three 1440px pages. ISS-016 was not retested against Cloudflare. ISS-021 wording was not rewritten.

The issue register is `reports/visual-audit/issues.csv`. ISS-004 and ISS-022 were put back to **open** after this recheck. ISS-023 was added.

### Registration wording — flagged, not changed

`components/agent-registration-strip.jsx` does not print a MARN. `data/site.json` has a register-search URL and no MARN field. On `/book-information-session` the rendered strip says:

> MinRosh Migration provides general information and education support only — not immigration assistance. For personalised visa advice or application help, Find a Registered Migration Agent.

The link label is registration wording shown when MinRosh has no published MARN. It points at the public register search, not a named agent. It was left in place. It needs professional approval before anyone treats it as cleared, and it must not be deleted as part of a visual tidy-up. No partner name, referral fee, or commission was added.

No public copy of the form “we are a registered migration agent”, “our MARN”, or a guaranteed-visa claim was found in the application source search used for this pass. That search is not a legal opinion.

## Functional flows

No staging test account was available. No enquiry, booking, newsletter, payment, or CRM record was submitted. POSTs to `/api/**` were aborted during the contact check.

- `/contact`: six required fields. Acknowledgement and privacy checkboxes were unchecked. Empty submit stayed on `/contact` with `firstName` invalid. No POST was sent.
- `/book-information-session`: three checkboxes, all unchecked. The registration strip above was read from the page.
- `/assessment`: H1 is “Official Information Finder”. The strings “Smart Navigator” and “Visa Decision Engine” are not in the body. The homepage CTA does open `/assessment`. The nav audit fails because it still expects the disabled product name.
- `/tools/student-country-cost-planner`: five selects. On load it showed “Estimated first-year cost ~60,176 AUD”. Changing the first select did not change that figure in this check. The figures were not compared with an official source.
- `/tools/pr-pathway-explorer`: the page rendered, with 11 external links and 74 local links. Every link was not opened. The repeated-disclaimer issue (ISS-015) was not restyled.

Booking was not completed through to a confirmation. Payment and CRM were not exercised.

## Accessibility and keyboard

This is **not** a WCAG 2.2 AA conformance claim.

- First Tab on `/assessment` focused “Skip to content”.
- Lighthouse accessibility was 100 for the homepage on mobile and desktop lab runs. The same mobile run still reported `label-content-name-mismatch` for controls whose `aria-label` does not match the visible text, including the brand link and several “Official Information Finder” links. A category score of 100 is not a clean bill against that audit.
- The contact heading covered by the header fails a basic visible-name check on a phone.
- The 404 heading at 16px is below a reasonable display size.
- No full keyboard pass of every page, no screen-reader pass, and no contrast measurement of every text node was done.

## Performance and images

Lab only, on the isolated server, not field CrUX and not the production CDN.

| Run | Performance | Accessibility | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | --- | --- | --- |
| Homepage mobile | 59 | 100 | 92 | 4.7 s | 0 | 1,210 ms |
| Homepage desktop | 98 | 100 | 92 | 1.1 s | 0 | 0 ms |
| `/contact` mobile | Not produced |  |  |  |  |  |

Contact mobile Lighthouse exited 1 with `NO_LCP` and then `NO_FCP` (“page did not paint any content”). That run is not a score.

Homepage mobile Lighthouse scored modern-image-formats, optimized images, responsive images, offscreen images, and image alt at 1. The source file `public/images/hero-brisbane-river-cbd-hd.jpg` is 303KB. The SEO audit “document does not have a meta description” scored 0, but the HTML source and the hydrated DOM both contain the homepage description. That Lighthouse SEO result is not treated as a missing tag.

Mobile LCP 4.7s and TBT 1,210ms would not be accepted as a Core Web Vitals pass even as a lab signal.

## SEO, sitemap, and robots

Candidate `robots.txt` allows `/` for `*`, disallows `/admin`, `/api`, and `/upload`, and disallows GPTBot and CCBot. Sitemap URL in the file is `https://minroshmigration.com.au/sitemap.xml`.

Canonicals on the measured 200 pages pointed at `https://minroshmigration.com.au/...`. `/thank-you` and `/maintenance` are noindex in source. `/newsletter/unsubscribe` is noindex and still has a doubled title.

Structured data (`application/ld+json`) is present on the homepage HTML. It was not validated line by line against every template.

## CMS and integrations

- Public news is `data/news.json` (7 items in this workspace). Pending drafts live in a separate store and are copied to news only from the admin approve action after `sourcesVerified` and a grounding check.
- The workspace draft file had 0 drafts, so draft-versus-public isolation was not exercised with a real pending draft.
- The approve handler writes `status: "approved"` before the grounding check. If grounding then fails, the draft can be marked approved without a public news row. That is an admin integrity risk, not a public leak observed in this pass. Admin auth was not logged in.
- `/api/stats` returned 429. Footer counts can fail or expose volumes (ISS-008).
- The candidate was booted with `SKIP_ENV_VALIDATION=1` and without the production `.env`, so mail, payments, and CRM were not connected. A green page render here does not prove those integrations.

## Outstanding issues

**P0:** none recorded.

**P1 open:** ISS-001, ISS-004, ISS-005, ISS-007, ISS-022, ISS-023.

**P2 open:** ISS-008, ISS-009, ISS-011, ISS-012, ISS-013, ISS-014, ISS-015, ISS-016, ISS-017.

**P3 open:** ISS-018, ISS-019, ISS-020. ISS-021 stays under human sign-off and was not edited.

Verified-fixed rows that this pass did not overturn: ISS-002, ISS-003, ISS-006, ISS-010. Those rest on the earlier phase measurements plus, for the header and hero scale, the spot checks in this crawl. They are not a new full-site sign-off.

## Production readiness

**NO-GO.**

The candidate still hides the contact heading on a phone, still fails its own expanded route test, still has a doubled title, still leaves the 404 outside the site shell, and was not proven with a submitted staging form. Production is a different commit and does not contain `/visa-services` in the sitemap. Shipping this tree would also require a cutover plan that does not rebuild over the frozen production checkout.

### Conditions before a later GO

1. Fix the fixed-header overlap on `/contact` and `/australian-visas-official-sources` at 390 and 768, and show new screenshots where the full H1 is below the header.
2. Give `/newsletter/unsubscribe` a single brand suffix. Decide explicitly whether that page and `/maintenance` stay outside the public shell.
3. Remove the second H1 and the second `#main-content` from destination and news loading shells, then re-run the visual regression spec to a green result that is not explained away as a navigation race.
4. Accept or fix the remaining P1s (homepage carousels, repeated CTAs, 404 shell and type).
5. Shorten titles that are over 60 characters, or record a written exception.
6. Obtain professional approval for the register-search strip. Do not remove the “not immigration assistance” disclosure to make the footer shorter.
7. Run one staging enquiry and one booking with a test account against a host that is not production, and confirm no production CRM row is written.
8. Re-run Lighthouse against the host that will actually be released. Do not treat the mobile lab LCP of 4.7s as acceptable without a follow-up.
9. Deploy only through an approved release directory. Do not run `npm run build` in `/home/minrosh/minrosh-migration` until the operational freeze is lifted.

## Rollback

Production does not need a rollback from this audit. It is still `1455a66` on port 3000. Do not stop or restart pid 1875 or the staging process on port 3001.

The candidate server is a separate process on port 3120, started from `/home/minrosh/releases/qa-final-20261024`. Stopping that process, and deleting that release directory, leaves production and the September staging checkout unchanged.

The code changes are uncommitted. To drop them later, restore the modified tracked files (`app/globals.css`, `app/home.css`, `app/sitemap.js`, `lib/seo.js`, `lib/public-indexable-routes.js`, the hero and content-page files, and the guide pages) and remove the untracked audit files only if the team wants the reports gone. Do not use a hard reset unless that is a separate, explicit request. Do not copy this candidate’s `.next` onto the production release path.
