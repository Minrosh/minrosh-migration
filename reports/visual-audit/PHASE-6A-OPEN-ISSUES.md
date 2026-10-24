# Phase 6A — open issues

Audit only. No application code was changed in this phase. Status below replaces the shorter labels in `issues.csv` where those labels overstated a fix.

## Release blockers (P1)

| ID | Status | Scope | Why it blocks |
| --- | --- | --- | --- |
| ISS-023 | Still open. Confirmed on the candidate. | Shared CSS, triggered on pages that import `app/home.css` (`/contact`, `/australian-visas-official-sources`; also about, assessment, booking, thank-you, homepage). | At 390px the contact header is fixed and covers 44px of the H1. Official-sources overlap is 22px. Same pattern at 768px. Screenshot: `reports/visual-audit/screenshots/final-qa/390x900/contact.png`. |
| ISS-022 | Partially fixed. | Shared `app/globals.css` header offset. | Service pages that do not load `home.css` no longer show the extra blank band. The same phone rule leaves 10px of padding while `home.css` keeps the header fixed, which is ISS-023. |
| ISS-007 | Still open. Reconfirmed. | Route-specific `app/not-found.js`. | Unknown URL returns 404 with no header and a 16px H1. |
| ISS-004 | Partially fixed. | Shared `lib/seo.js` for `buildMetadata()` callers. Route-specific leftover: `app/newsletter/unsubscribe/page.js`. Long titles are route metadata. | Service titles and the homepage default show the brand once. Unsubscribe still doubles it. 46 measured titles at 1440px exceed 60 characters. |
| ISS-005 | Partially fixed. | Shared homepage sections below the hero. | Phase 3 reduced the hero to one primary button, one secondary button, and a WhatsApp text link. The final QA pass still found each of the two homepage actions four times. |
| ISS-001 | Still open. Not independently re-verified in this pass. | Shared `components/home-deferred-carousels-lazy.jsx`. | No carousel code change is in the candidate diff. The final crawl did not re-measure the lower homepage bands. |
| ISS-011 | Still open. Reconfirmed by E2E. | Shared `app/destinations/loading.js` and `app/immigration-news/loading.js`. | Both files render `<main id="main-content">` and an `<h1>`. Four Playwright failures matched two mains. Three visual-regression failures matched two visible H1s. |

There is no recorded P0.

## P2 still open

| ID | Status | Scope |
| --- | --- | --- |
| ISS-008 | Still open. `/api/stats` returned 429 on the candidate. | Shared footer. |
| ISS-009 | Still open. Not re-measured in this pass. | `/assessment` only. |
| ISS-012 | Still open. Not re-measured in this pass. | Destination section metadata. |
| ISS-013 | Partially fixed on the candidate only. | Shared sitemap list. `/visa-services` is in the candidate sitemap. `/global-pathways` is not. Production sitemap (83 URLs) still lacks `/visa-services`. |
| ISS-014 | Still open. Not re-measured in this pass. | `/education-consultation`. |
| ISS-015 | Still open. The explorer rendered; its second disclaimer and plain links were not restyled. | `/tools/pr-pathway-explorer`. |
| ISS-016 | Still open. Not retested. The candidate was not behind Cloudflare. | Shared CSP plus Cloudflare injection. |
| ISS-017 | Still open. Phase 2 changed footer columns; density was not re-measured here. | Shared footer. |

## P3

| ID | Status | Scope |
| --- | --- | --- |
| ISS-018 | Still open. Label remains `POPULAR ROUTES`. | Shared header nav. |
| ISS-019 | Still open. Not re-measured. | News cards. |
| ISS-020 | Still open. 404 art was not re-screenshot; the 404 shell was reconfirmed. | `app/not-found.js`. |
| ISS-021 | Requires human approval. Copy was not changed. | Shared footer and compliance disclosures, including the register-search strip. |

## Confirmed fixed, with the limit of that confirmation

| ID | Status | Scope |
| --- | --- | --- |
| ISS-002 | Confirmed fixed for the original 167–226px header and 1024px nav overflow. Phase 2 measured it. This crawl did not restore that overflow. | Shared header. |
| ISS-003 | Confirmed fixed. This crawl measured the homepage H1 at 36px (390), 44px (768), and 56px (1440). | Shared homepage hero. |
| ISS-006 | Confirmed fixed in the Phase 3 measurement. Not independently re-measured in this 270-check crawl. | Homepage trust strip. |
| ISS-010 | Confirmed fixed in the Phase 3 booking screenshot. Not independently re-measured here. | `/book-information-session`. |

None of these four fixes are in the September staging commit. They exist only as uncommitted edits on `fix/shared-layout-remediation`.

## Safe implementation order

1. Stay on `fix/shared-layout-remediation`. Do not check out `design/premium-visual-refresh` until the dirty tree is preserved. That branch rewrites `app/globals.css`, `app/home.css`, and `components/home/home-hero-premium.jsx` and does not contain these uncommitted fixes.
2. Fix ISS-023 before any further visual redesign. The phone padding rule and the fixed header from `home.css` have to be one rule.
3. Change the destination and news loading shells so they are not a second `<main id="main-content">` and not a second H1. Re-run the existing Playwright files without editing the assertions.
4. Point the unsubscribe title through one brand suffix. Decide whether that noindex page should use the public shell.
5. Then the remaining P1s: 404 shell, homepage carousel placeholders, and repeated homepage CTAs.
6. Only after that, decide sitemap policy for `/global-pathways` and shorten or accept long titles.
7. Do not merge the design branch, do not deploy, and do not treat production `1455a66` as this candidate.
