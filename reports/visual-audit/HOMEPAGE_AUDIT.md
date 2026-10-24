# Homepage audit

**URL:** https://minroshmigration.com.au/  
**Reviewed:** 24 October 2026  
**Evidence:** `reports/visual-audit/screenshots/before/desktop-1440/home.png` and `mobile-390/home.png`  
**Viewports also measured:** 320, 360, 430, 768, 1024, 1440, 1920, 390×640, 1024×600, 844×390  

No horizontal overflow was measured. No application code was changed.

## What the page is doing

The hero uses the Brisbane river and CBD photograph, the plum wordmark, and a compliant explanation: MinRosh organises public information and does not provide immigration assistance. Primary actions are Explore General Information and Education Course Enquiry, with a smaller note pointing people who need advice to a registered migration agent or legal practitioner.

Below the hero the page repeats that choice: an Official Information Finder card, a four-step “How MinRosh works” row, destination cards, five visa-category cards, a tools pair, a trust row, a large empty band, a plum final CTA, and the shared footer.

## Confirmed visual defects

| ID | Priority | Finding |
| --- | --- | --- |
| ISS-001 | P1 | Large blank bands where deferred carousels should be. The placeholder in `components/home-deferred-carousels-lazy.jsx` is client-only and reserves up to a full viewport of empty surface. |
| ISS-003 | P1 | Hero H1 is about 36px at 390px and about 31px at 768px. Tablet type is smaller than phone type because the heading tracks viewport width. |
| ISS-005 | P1 | The same two CTAs and the same “not eligibility / not advice” explanation appear in the hero, the finder card, the journey, and the final band. |
| ISS-006 | P1 | On a phone the six trust items are a horizontal scroller. Supporting lines are clamped and too small to read. |
| ISS-002 | P1 | Header box is about 104px at 1440px and about 225px at 390px. At 1024px the nav row overflows. |
| ISS-008 | P2 | Footer shows Enquiry count 3, Newsletter signups 4, Updates tracked 7. |

## Hierarchy

The first screen answers what the site is. It does not give one clear next step. Three controls in the hero plus the trust scroller compete with the heading. Destination photography is the strongest imagery on the page. Later sections return to similar white rounded cards, so the page feels longer than the amount of new information.

## Responsive

- 320–430px: no sideways scroll. Header is tall. Hero and sections stack. Trust items truncate.
- 768px: header still about 167px. Hero type dips.
- 1024px and 1024×600: nav overflows its track (`navWrap` true).
- 1440 and 1920: no overflow. Header stays about 104px. Content is centred with wide side margins.

## Accessibility and performance notes

Skip link and `main` are present. Visible H1 is a single heading. Images in the captured DOM had alt text. Consent is not on this page. The Cloudflare beacon is blocked by CSP on this URL (ISS-016). The carousel placeholder is hidden from the accessibility tree (`aria-hidden`) while still taking space, so keyboard users skip a hole rather than hearing a loading state.

## Regulatory

Homepage copy reviewed in the screenshot does not claim MinRosh is a migration agent, does not show a MARN, and does not mention referral fees. The footer register link is the public “Find a Registered Migration Agent” label. Leave that wording for human sign-off (ISS-021). Do not shorten it for layout.
