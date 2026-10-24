# Page-by-page audit

**Live site:** https://minroshmigration.com.au
**Routes discovered:** 89
**Routes visually reviewed:** 89 (full-page screenshots at 390×844 and 1440×900)
**Repository checkout used for file references:** `compliance/no-marn-update` at `0941a76`. The audit target is the live site, not a local redesign branch.

Screenshots: `reports/visual-audit/screenshots/before/desktop-1440/` and `mobile-390/`.

## Method

Routes came from the live sitemap (83 URLs) plus app routes that answer in public: `/visa-services`, `/global-pathways`, `/thank-you`, `/maintenance`, `/newsletter/unsubscribe`, and one unknown URL for the 404. Admin, upload tokens, and form posts were not exercised. State-changing workflows were not submitted on production.

Every URL was opened in a headless browser. Full-page screenshots were saved. Representative screenshots were inspected (home, about, contact, education, assessment, tools, pathway explorer, booking, skilled migration, Australia hub, news index, 404). The remaining URLs were checked with the same capture for status, heading, header size, overflow, images, and console errors, then grouped by template when the screen matched the shared shell.

Additional widths measured on home, contact, Australia hub, skilled, tools, assessment, booking, news, and partner: 320, 360, 430, 768, 1024, 1440, 1920, plus 390×640, 1024×600, and 844×390. No horizontal overflow was found. Header height and nav overflow are in ISS-002.

## Template findings

### Shared shell (almost every 200 page)

- Header about 103–104px on desktop and 167–226px below 768px (ISS-002).
- Nav overflows at 1024px (ISS-002).
- Title often ends with `| MinRosh Migration | MinRosh Migration` (ISS-004).
- Footer stats and a dense mobile link stack (ISS-008, ISS-017).
- CSP console error for the Cloudflare beacon (ISS-016).
- Skip link and `main` present. No missing image alts and no broken images in the DOM sample. No pre-checked consent boxes on the forms that were rendered.

### Destination hubs and sections (36 URLs)

Australia, Canada, New Zealand, and the United Kingdom, each with skilled, partner, student, education, updates, FAQ, about, and contact. Visible H1 after load is the section title. Raw HTML also contains the loading H1 “Preparing destination guidance” (ISS-011). Some UK and Canada section descriptions are very short (ISS-012). Layout follows one hub template. No page-specific overflow.

### Guides and visa information pages

Skilled, student, partner, visitor, employer-sponsored, and the long guide URLs use the content-page hero. Headings wrap. They inherit the shared chrome issues. Skilled migration’s H1 is long and becomes a tall stack on a phone. That is readable, not clipped.

### News

The index is ISS-019. Each of the seven articles uses the article template. Titles are long because of the doubled brand suffix (ISS-004). No broken article images were recorded.

## Route register

| Path | Status | Template | Visible H1 | Notes |
| --- | --- | --- | --- | --- |
| `/` | 200 | homepage | Explore Australian Migration Information with Greater Clarity | See HOMEPAGE_AUDIT.md. ISS-001, ISS-003, ISS-005, ISS-006. |
| `/about` | 200 | content-page | Making public migration and education information easier to navigate | Editorial layout is one of the stronger pages. Brisbane image and compliance statement are clear. Shared header, title suffix, and footer stats still apply. |
| `/assessment` | 200 | information-finder | Official Information Finder | Repeated introduction and a large gap before the footer (ISS-009). |
| `/australia-visa-document-checklist-guide` | 200 | content-page | Australia Visa Document Checklist Guide (2026) | Shared shell. Screenshot pair saved. |
| `/australia-visa-fees-and-costs-guide` | 200 | content-page | Australia Visa Fees and Costs Guide (2026) | Shared shell. Screenshot pair saved. |
| `/australia-visa-processing-times-guide` | 200 | content-page | Australia Visa Processing Times Guide (2026) | Shared shell. Screenshot pair saved. |
| `/australia-vs-canada-migration-guide` | 200 | content-page | Australia vs Canada Migration Guide (2026) | Shared shell. Screenshot pair saved. |
| `/australian-visas-official-sources` | 200 | content-page | Australian visas: official sources, Visa Finder, and how MinRosh pages fit toget | Shared shell. Screenshot pair saved. |
| `/book-information-session` | 200 | enquiry-form | Book a General Information or Education Course session | Empty left panel beside the form (ISS-010). Consent unchecked. Do not submit on production. |
| `/code-of-conduct` | 200 | legal | OMARA Code of Conduct | Shared shell. Screenshot pair saved. |
| `/complaints` | 200 | legal | Complaints Process | Shared shell. Screenshot pair saved. |
| `/contact` | 200 | enquiry-form | General information or education-course enquiry | Two-column enquiry layout works. Checkboxes were unchecked. Mobile stacks cleanly. Footer is dense (ISS-017). |
| `/destinations/australia` | 200 | destination-hub | Australia migration hub | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/australia/about` | 200 | destination-section | MinRosh and Australian migration information | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/australia/contact` | 200 | destination-section | Contact MinRosh about Australia visas | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/australia/education` | 200 | destination-section | Education planning for Australia | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/australia/faq` | 200 | destination-section | Australia migration frequently asked questions | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/australia/partner` | 200 | destination-section | Australia partner and family pathways | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/australia/skilled` | 200 | destination-section | Australia skilled migration categories | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/australia/student` | 200 | destination-section | Australia student visa and study planning | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/australia/updates` | 200 | destination-section | Keeping up with Australian immigration changes | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/canada` | 200 | destination-hub | Canada migration hub | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/canada/about` | 200 | destination-section | MinRosh and Canadian migration | Destination template. ISS-002, ISS-004, ISS-011. Short meta description (ISS-012). |
| `/destinations/canada/contact` | 200 | destination-section | Contact us about Canada | Destination template. ISS-002, ISS-004, ISS-011. Short meta description (ISS-012). |
| `/destinations/canada/education` | 200 | destination-section | Education planning for Canada | Destination template. ISS-002, ISS-004, ISS-011. Short meta description (ISS-012). |
| `/destinations/canada/faq` | 200 | destination-section | Canada immigration questions | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/canada/partner` | 200 | destination-section | Canada partner and family routes | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/canada/skilled` | 200 | destination-section | Canada skilled immigration planning | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/canada/student` | 200 | destination-section | Study in Canada — study permits | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/canada/updates` | 200 | destination-section | Canada immigration updates | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/new-zealand` | 200 | destination-hub | New Zealand migration hub | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/new-zealand/about` | 200 | destination-section | MinRosh and New Zealand migration | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/new-zealand/contact` | 200 | destination-section | Contact us about New Zealand | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/new-zealand/education` | 200 | destination-section | Education planning for New Zealand | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/new-zealand/faq` | 200 | destination-section | New Zealand visa questions | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/new-zealand/partner` | 200 | destination-section | New Zealand partner and family visas | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/new-zealand/skilled` | 200 | destination-section | New Zealand skilled work and residence planning | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/new-zealand/student` | 200 | destination-section | — | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/new-zealand/updates` | 200 | destination-section | New Zealand immigration updates | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/united-kingdom` | 200 | destination-hub | United Kingdom migration hub | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/united-kingdom/about` | 200 | destination-section | MinRosh and United Kingdom visas | Destination template. ISS-002, ISS-004, ISS-011. Short meta description (ISS-012). |
| `/destinations/united-kingdom/contact` | 200 | destination-section | Contact us about the United Kingdom | Destination template. ISS-002, ISS-004, ISS-011. Short meta description (ISS-012). |
| `/destinations/united-kingdom/education` | 200 | destination-section | Education planning for the United Kingdom | Destination template. ISS-002, ISS-004, ISS-011. Short meta description (ISS-012). |
| `/destinations/united-kingdom/faq` | 200 | destination-section | United Kingdom visa questions | Destination template. ISS-002, ISS-004, ISS-011. Short meta description (ISS-012). |
| `/destinations/united-kingdom/partner` | 200 | destination-section | United Kingdom partner and family visas | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/united-kingdom/skilled` | 200 | destination-section | United Kingdom skilled work routes | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/united-kingdom/student` | 200 | destination-section | Study in the United Kingdom | Destination template. ISS-002, ISS-004, ISS-011. |
| `/destinations/united-kingdom/updates` | 200 | destination-section | United Kingdom immigration updates | Destination template. ISS-002, ISS-004, ISS-011. |
| `/disclaimer` | 200 | legal | General Information Disclaimer | Shared shell. Screenshot pair saved. |
| `/education-consultation` | 200 | enquiry-form | Education course enquiry and admissions administration support | Form is visually heavier than the official-link column (ISS-014). Consent checkboxes present and unchecked. |
| `/employer-sponsored-visas` | 200 | content-page | Employer-sponsored visas: general information for worker-side research | Shared shell. Screenshot pair saved. |
| `/faq` | 200 | content-page | Frequently asked questions about migration information and next steps | Shared shell. Screenshot pair saved. |
| `/immigration-lawyer-australia-vs-registered-migration-agent-guide` | 200 | content-page | Immigration lawyer Australia vs registered migration agent: how to choose | Shared shell. Screenshot pair saved. |
| `/immigration-news` | 200 | news-index | Latest insights & migration updates | Card grid is even. Dates and tags compete with headlines (ISS-019). |
| `/immigration-news/canada-border-system-2026` | 200 | news-article | Canada border security and immigration-system integrity changes | Article template. Long title (ISS-004). |
| `/immigration-news/canada-integrity-fraud-prevention-2026` | 200 | news-article | Canada immigration integrity and fraud-prevention measures | Article template. Long title (ISS-004). |
| `/immigration-news/nz-visa-fraud-partnerships-2025` | 200 | news-article | New Zealand joins international partners to fight visa fraud | Article template. Long title (ISS-004). |
| `/immigration-news/partner-visa-australia-2026-guide` | 200 | news-article | Partner visa topics on official Home Affairs pages (2026 note) | Article template. Long title (ISS-004). |
| `/immigration-news/skilled-migration-australia-points-2026` | 200 | news-article | Skilled migration points themes and invitation context (2026 note) | Article template. Long title (ISS-004). |
| `/immigration-news/student-visa-australia-requirements-2026` | 200 | news-article | Student visa topics explained with official sources (2026 note) | Article template. Long title (ISS-004). |
| `/immigration-news/uk-eta-travel-permission-2025` | 200 | news-article | UK ETA enforcement and travel permission updates | Article template. Long title (ISS-004). |
| `/meet-the-team` | 200 | content-page | Meet the people behind MinRosh information support | Shared shell. Screenshot pair saved. |
| `/migration-for-healthcare-workers-australia` | 200 | other | Migration for healthcare workers in Australia | Shared shell. Screenshot pair saved. |
| `/migration-sri-lanka-to-australia` | 200 | other | — | Shared shell. Screenshot pair saved. |
| `/partner-visa-309-100-guide` | 200 | content-page | 309/100 Partner Visa Guide (Offshore): practical preparation before any applicat | Shared shell. Screenshot pair saved. |
| `/partner-visa-820-801-guide` | 200 | content-page | 820/801 Partner Visa Guide (Onshore): evidence and application sequence | Shared shell. Screenshot pair saved. |
| `/partner-visa-australia` | 200 | content-page | Partner Visa Australia: general information on evidence themes | Shared shell. Screenshot pair saved. |
| `/partner-visa-australia-guide` | 200 | content-page | How to Apply for a Partner Visa in Australia (2026 Guide) | Shared shell. Screenshot pair saved. |
| `/popular-routes` | 200 | content-page | Categories enquirers compare most often | Shared shell. Screenshot pair saved. |
| `/privacy-policy` | 200 | legal | Privacy Policy | Shared shell. Screenshot pair saved. |
| `/referral-program` | 200 | content-page | Referral program for agents, employers, and community leaders | Shared shell. Screenshot pair saved. |
| `/skilled-migration` | 200 | content-page | Skilled Migration Australia (189/190/491): general information before you plan f | Shared shell. Screenshot pair saved. |
| `/skilled-migration-australia-points-guide` | 200 | content-page | Skilled Migration Australia Points Guide (2026) | Shared shell. Screenshot pair saved. |
| `/student-migration-over-25-australia` | 200 | other | Student visa topics for applicants over 25 | Shared shell. Screenshot pair saved. |
| `/student-visa-australia` | 200 | content-page | Student Visa Australia: general information and education support | Shared shell. Screenshot pair saved. |
| `/student-visa-australia-requirements` | 200 | other | Student Visa Australia Requirements Explained (2026) | Shared shell. Screenshot pair saved. |
| `/terms-of-use` | 200 | legal | Terms of Use | Shared shell. Screenshot pair saved. |
| `/tools` | 200 | other | General Information Tools | Clearest tools index. Cards align. Hero uses the Brisbane image. Shared chrome issues only. |
| `/tools/pr-pathway-explorer` | 200 | tool | Permanent Migration Information Explorer | Repeated disclaimer and plain link list (ISS-015). |
| `/tools/student-country-cost-planner` | 200 | tool | Student country & cost planner | Same tool template family as the explorer. No extra overflow. Treat cost output as indicative only. |
| `/updates` | 200 | content-page | Official immigration news board for the destination systems MinRosh tracks | Shared shell. Screenshot pair saved. |
| `/visa-refusal-help-australia-and-aat-migration-appeal-guide` | 200 | content-page | Visa refusal help Australia: practical next steps and AAT migration appeal conte | Shared shell. Screenshot pair saved. |
| `/visitor-visas` | 200 | content-page | Visitor visas: general information on travel purpose and evidence themes | Shared shell. Screenshot pair saved. |
| `/visa-services` | 200 | content-page | Information and Education Support | Public 200 but absent from the sitemap (ISS-013). |
| `/global-pathways` | 200 | content-page | Destination strategy beyond the homepage quick view | Public 200 but absent from the sitemap (ISS-013). |
| `/thank-you` | 200 | other | Thank you | noindex, follow. Small 32px H1. Not in the sitemap. |
| `/maintenance` | 200 | other | Upgrading for a better experience | noindex, nofollow. Public 200. Confirm it should remain reachable. |
| `/newsletter/unsubscribe` | 200 | other | Marketing emails | noindex. H1 is 24px. Canonical points at the homepage. |
| `/this-route-should-404-audit` | 404 | not-found | Page not found | 404 without site header or footer. H1 is 16px (ISS-007). |

## Functional checks

- Internal navigation targets used by the header and footer resolve. `/book-consultation` permanently redirects to `/book-information-session`.
- Contact, education, and booking forms render required acknowledgement checkboxes unchecked. They were not submitted.
- Calculators (`/tools/student-country-cost-planner`, `/tools/pr-pathway-explorer`) render. They were not used to store data.
- Structured data scripts are present on marketing pages. Invalid JSON-LD was not flagged by the parser used in the crawl.
- No P0 broken route, missing image, or horizontal overflow was confirmed.

## Regulatory

A text scan of all 88 HTML documents found “migration agent” in the footer guide label and in sentences that say MinRosh is **not** a registered migration agent, or that tell the reader to contact one. No public MARN, referral fee, or commission string was found. ISS-021 is a sign-off note, not a defect to “fix” by deleting the disclosure.
