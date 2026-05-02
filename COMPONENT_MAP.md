# COMPONENT_MAP

## Scope Lock (homepage marketing)

- Editable allowlist (typical homepage work):
  - `app/page.js`
  - `components/home-deferred-motion-sections.jsx`
  - `components/home-deferred-carousels.jsx`
  - `components/home-deferred-motion-sections-lazy.jsx`
  - `components/home-deferred-carousels-lazy.jsx`
  - `components/home-visa-comparison-flowchart.jsx`
  - `components/home-smart-navigator-island.jsx`
  - `app/home.css`
- Read-only unless separately approved: `app/globals.css`, `tailwind.config.js`, `app/admin/**`, `components/ui/**`, `components/site-shell.js`
- Allowed palette: plum `#3d2432`, rose `#9b4a6c`, gold `#caa64d`, cream `#fbf8f4`

## Homepage Assembly (Current)

- Route entry: `/app/page.js` (`UltraMaximumLayout`, hero, dynamic flowchart + Smart Navigator island, deferred motion + carousels).
- Global shell: `/components/site-shell.js`
- Legacy tab-driven container **`/components/home-page-content.jsx`** and **`/components/home/**`** were **removed** (dead code); do not reintroduce without an explicit routing decision.

## Section Ownership

### Hero

- Primary file: `/app/page.js`
- Editable: yes (within scope lock).

### Visa comparison flow

- Primary file: `/components/home-visa-comparison-flowchart.jsx` (dynamic import from `app/page.js`).

### Smart Navigator island

- Primary file: `/components/home-smart-navigator-island.jsx` (dynamic import from `app/page.js`).

### Why MinRosh / pillars / core engines / residency CTA

- Primary file: `/components/home-deferred-motion-sections.jsx` (via lazy wrapper).

### Testimonials + news carousel

- Primary file: `/components/home-deferred-carousels.jsx` (via lazy wrapper); news via `/data/news.json` from `app/page.js`.

## Verification Checklist (Per Change)

- Palette: plum / rose / gold / cream only for marketing surfaces.
- Touch targets: `min-h-[48px]` where interactive.
- `"use client";` on interactive client components.
- No unintended edits under `app/admin/**` or scoped admin CSS overrides.

## Change Log

- Date:
- Section key:
- Files changed:
- What changed:
- Verification done:
- Checkpoint commit:
