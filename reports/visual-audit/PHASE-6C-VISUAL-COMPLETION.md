# Phase 6C — Visual completion

Date: 24 October 2026  
Candidate: `/home/minrosh/releases/qa-phase-6c-20261024`  
Build ID: `2StrOA1KM7Q4RlpQXirfQ`  
Checked at `http://127.0.0.1:3122`  
Production (`:3000`) and staging (`:3001`) were not restarted. Nothing was deployed or merged.

Before measurements for the homepage are from the Phase 6B server on `:3121`. After measurements are from this build.

## Verdict

The open visual defects from the register were rechecked on this candidate. Thirteen of them are verified fixed from rendered evidence. Three stay open because they are outside a visual fix, or they need a human or Cloudflare decision. This phase stops for review.

## Priority 1 — Homepage blank bands

The news block was loaded with `ssr: false`. Its placeholder reserved about 92vh for a feedback carousel and up to 1280px for news. The feedback list is empty, so that first band never became content.

On `:3121`, the first paint had two `.ultra-snap-section` placeholders and no “Immigration news” heading. On `:3122`, the news heading and cards are in the first HTML, and the placeholder count is 0. The empty quote carousel is not rendered. The articles remain.

## Priority 2 — Homepage hierarchy

The heading scale from Phase 3 is unchanged: 36px at 390px wide and 56px at 1440px. All six trust statements remain, at 14px body size, in a wrapping grid.

The trust band now sits on the cream surface under the photograph instead of stretching the river image behind every statement. The heading sits on a cream panel. The river and towers are visible beside that panel on a phone. The H1 starts at 316px, below a 125px header.

The hero still keeps one primary button, one secondary button, and the WhatsApp text link. The quiz and journey sections each keep a single text link. The closing band keeps one button and one text link. The count of the old equal action labels fell from 8 to 3 on first paint.

The photographic section is still tall because the offer itself is tall. The full hero section, including the trust band, measures 1686px at 390×844. That is slightly taller than the 1556px Phase 6B hero, because the trust band is no longer painted on top of the photo.

Screenshots: `reports/visual-audit/screenshots/phase6c/390x844/home.png` and `reports/visual-audit/screenshots/phase6c/1440x900/home.png`. The earlier full-page set is in the same folders. A pre-change capture is in `reports/visual-audit/screenshots/phase6c/before/`.

## Priority 3 — Information Finder

The page hero still carries the compliance notice. The tool under it no longer repeats that notice. It asks the visitor to select a topic. The Smart Navigator flag remains off. Screenshot: `reports/visual-audit/screenshots/phase6c/1440x900/assessment.png`.

## Priority 4 — Other defects

| Item | Result |
| --- | --- |
| Booking column | The Brisbane photograph and caption are beside the form at 1440px. Screenshot: `book-information-session.png`. |
| 404 | Public header and footer. H1 is 30px at 390 and 40px at 1440. The card uses `hero-brisbane-river-cbd-hd.jpg`. |
| Inner heroes | Shared hero images on small screens use a 16:9 frame and `object-position: center 58%`. |
| Footer counts | Enquiry, newsletter, and update counts are not rendered and `/api/stats` is not called from the footer. The newsletter form remains. |
| Footer density | One column on a phone, 44px link targets, disclosures unchanged. |
| Navigation label | “Popular routes”. The pathway menu still opens from that item. |
| News cards | Headline first, then a quieter country and date. |
| Education enquiry | Official study links sit beside the form on a wide screen and above it on a phone. Consent text was not shortened. |
| Pathway explorer | One disclaimer in the hero. Official links are bordered cards. |
| Destination descriptions | Section descriptions that were under about 110 characters now start at 120 characters. The general-information limit is unchanged. |
| Sitemap | The candidate sitemap has 85 URLs, including `/visa-services` and `/global-pathways`. |

## Priority 5 — Route review

The crawl covered 90 public URLs at 390×844 and 1440×900, including sitemap routes, `/global-pathways`, `/thank-you`, `/maintenance`, `/newsletter/unsubscribe`, `/book-consultation`, and an unknown URL. Full-page screenshots are in `reports/visual-audit/screenshots/phase6c/390x844/` and `1440x900/`.

Across those 180 checks: one visible H1, one `#main-content`, no horizontal overflow, no heading covered by the header, no section taller than 480px with almost no text, and no operational counts in the footer. `/maintenance` has no site header, which matches its existing standalone layout. The unknown URL returns 404 inside the public shell.

`reports/visual-audit/route-manifest.csv` now has a `phase6c_visual` column. It has 90 rows after adding the booking redirect.

Keyboard: the first Tab on the homepage focuses “Skip to content”. Playwright against `:3122` passed 163 tests. Unit tests passed 108. The isolated build exited 0. The first font fetch in an earlier attempt failed; the retry compiled.

## Still open

| ID | Why it stays open |
| --- | --- |
| ISS-004 | The brand suffix is no longer doubled. Many titles are still longer than 60 characters. |
| ISS-016 | The Cloudflare analytics beacon was not retested. This candidate is not behind Cloudflare, and the Cloudflare dashboard was not changed. |
| ISS-021 | Compliance wording was not edited. It still needs human sign-off. |

## Stop

No deploy. No merge. No commit.
