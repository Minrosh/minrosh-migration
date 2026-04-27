# COMPONENT_MAP

## Scope Lock
- Editable allowlist:
  - `/components/home/**`
  - `app/page.js`
  - `components/home-deferred-motion-sections.jsx`
  - `components/home-deferred-carousels.jsx`
- Read-only (do not edit): `app/globals.css`, `tailwind.config.js`, `app/admin/**`, `components/ui/**`, `components/site-shell.js`
- Allowed palette only: plum `#3d2432`, rose `#9b4a6c`, gold `#caa64d`, cream `#fbf8f4`
- Mandatory prompt contract:
  - "Only edit files inside /components/home/. Do not touch globals.css, tailwind.config.js, or any admin files. Use only existing brand colors: plum #3d2432, rose #9b4a6c, gold #caa64d, cream #fbf8f4."

## Homepage Assembly (Current)
- Route entry: `/app/page.js`
- Global shell wrapper (read-only): `/components/site-shell.js`
- Deferred motion bundle entry (read-only): `/components/home-deferred-motion-sections-lazy.jsx`
- Deferred carousels bundle entry (read-only): `/components/home-deferred-carousels-lazy.jsx`

## Section Ownership

### 1) Hero
- Section key: `home.hero`
- Primary file: `/app/page.js` (inline hero section)
- Editable now: yes (allowlisted)

### 2) Visa Comparison Flow
- Section key: `home.visaComparison`
- Primary file: `/components/home-visa-comparison-flowchart` (dynamic import target from `/app/page.js`)
- Editable now: no (outside `/components/home` unless file physically resides under `/components/home`)

### 3) Smart Navigator Island
- Section key: `home.navigatorIsland`
- Primary file: `/components/home-smart-navigator-island` (dynamic import target from `/app/page.js`)
- Editable now: no (outside `/components/home` unless file physically resides under `/components/home`)

### 4) Why MinRosh / Pillars
- Section key: `home.whyMinrosh`
- Primary file: `/components/home-deferred-motion-sections.jsx`
- Editable now: yes (allowlisted)
- Style intent to preserve when scope allows:
  - deep plum base, cream text, rose/gold accents

### 5) Core Visa Engines (Services-style cards)
- Section key: `home.coreVisaEngines`
- Primary file: `/components/home-deferred-motion-sections.jsx`
- Editable now: yes (allowlisted)
- Validation checks when editing becomes allowed:
  - cards keep responsive grid rhythm
  - accents remain on approved palette

### 6) Residency CTA Band
- Section key: `home.residencyCta`
- Primary file: `/components/home-deferred-motion-sections.jsx`
- Editable now: yes (allowlisted)

### 7) Testimonials / Success Stories
- Section key: `home.testimonials`
- Primary file: `/components/home-deferred-carousels.jsx`
- Editable now: yes (allowlisted)
- Validation checks when editing becomes allowed:
  - readable contrast
  - mobile swipe behavior preserved

### 8) Immigration Insights Carousel
- Section key: `home.insights`
- Primary file: `/components/home-deferred-carousels.jsx`
- Data source: `/data/news.json` via `/app/page.js`
- Editable now: yes for component presentation; no for data source file unless separately approved

## Components Under `/components/home` (Editable Surface)
- `/components/home/home-hero-bento.jsx`
- `/components/home/trust-proof-strip.jsx`
- `/components/home/trust-signals-grid.jsx`
- `/components/home/home-our-services-tabs.jsx`
- `/components/home/service-decision-engine.jsx`
- `/components/home/stories-carousel-panel.jsx`
- `/components/home/google-reviews-panel.jsx`
- `/components/home/home-eligibility-wizard.jsx`
- `/components/home/quiz-wizard-panel.jsx`
- `/components/home/quiz-result-skeleton.jsx`
- `/components/home/pathway-map-panel.jsx`
- `/components/home/pathway-sequence-animated.jsx`
- `/components/home/pathway-map-disclosure.jsx`
- `/components/home/client-journey-map.jsx`
- `/components/home/future-pacing-lab.jsx`
- `/components/home/contact-chat-panel.jsx`
- `/components/home/brisbane-parallax.jsx`
- `/components/home/home-discover-strip.jsx`
- `/components/home/home-tab-server.jsx`
- `/components/home/story-proof-wall.jsx`

## Legacy/Alternate Home Container (Currently Unwired)
- File: `/components/home-page-content.jsx`
- Status: appears not imported by route entry (`/app/page.js`)
- Purpose: tab-driven home/quiz/pathways/services/stories composition
- Rule: treat as legacy until routing decision explicitly confirms activation

## Verification Checklist (Per Change)
- Touched files remain inside `/components/home/**` only.
- Palette remains constrained to plum/rose/gold/cream.
- Container rhythm present where relevant: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Interactive controls meet touch target baseline: `min-h-[48px]` (and `min-w-[48px]` where needed).
- `"use client";` remains at top of interactive/motion components.
- No edits to `app/globals.css`, `tailwind.config.js`, or `app/admin/**`.

## Change Log
- Date:
- Section key:
- Files changed:
- What changed:
- Verification done (mobile + palette + touch target + use client):
- Checkpoint commit:
