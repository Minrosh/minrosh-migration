# Prioritised remediation

Audit only. Do not treat this file as permission to deploy.

## Counts

| Priority | Issues |
| --- | --- |
| P0 Critical | 0 |
| P1 High | 7 (ISS-001–ISS-007) |
| P2 Medium | 10 (ISS-008–ISS-017) |
| P3 Low | 4 (ISS-018–ISS-021, of which ISS-021 is a human-review note, not a defect) |

## Shared-component defects

- Header height and nav overflow (ISS-002) on every `SiteShell` page.
- Doubled title suffix (ISS-004) from `app/layout.js`.
- Footer density and public stats (ISS-008, ISS-017).
- CSP console error (ISS-016).
- Destination and news loading H1s in HTML (ISS-011).

## Page-specific defects

- Homepage carousels, CTA repetition, trust truncation, tablet hero type (ISS-001, ISS-003, ISS-005, ISS-006).
- 404 shell (ISS-007, ISS-020).
- Assessment gap (ISS-009).
- Booking empty column (ISS-010).
- Thin destination meta descriptions (ISS-012).
- Unlisted public routes (ISS-013).
- Education form balance (ISS-014).
- Pathway explorer styling (ISS-015).

## Top 10

1. Remove the blank homepage carousel reservation and show news on the server (ISS-001).
2. Shorten the mobile header and stop nav overflow at 1024px (ISS-002).
3. Fix the hero type scale so tablet is not smaller than mobile (ISS-003).
4. Stop appending the brand name twice in `<title>` (ISS-004).
5. Give the homepage one primary CTA and stop repeating it (ISS-005).
6. Replace the six-item trust scroller with three readable lines (ISS-006).
7. Put the 404 page back inside the public header and footer (ISS-007).
8. Remove public enquiry and newsletter counts (ISS-008).
9. Fill or remove the empty booking column and the assessment gap (ISS-010, ISS-009).
10. Repair short destination descriptions and sitemap gaps (ISS-012, ISS-013).

## Recommended implementation order

1. Shared chrome: header, title template, footer stats. One change improves every URL.
2. Homepage only: hero scale, trust strip, section order, carousels.
3. Templates: 404, enquiry pages, destination loading UI, tools explorer.
4. SEO copy: destination descriptions and sitemap decisions.
5. CSP / Cloudflare beacon after the visual work, because it needs a config decision outside the page components.

Do not submit live forms while fixing. Do not publish partner identities or MARNs. Do not deploy from this audit.
