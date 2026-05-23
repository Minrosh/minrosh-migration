# Homepage Content-Safe Redesign Checklist

This rollout adopts a modern visual design without losing existing content, SEO, or route coverage.

## Hero baseline (do not change without an explicit audit)

These artifacts define the **premium Brisbane homepage hero**. Treat regressions as product-risk changes (LCP, contrast, layout, brand):

- **Component:** `components/home/home-hero-premium.jsx` — structure, LCP image usage, CTA class contracts, and hero markup.
- **Styling:** `app/home.css`, especially rules under **`.portal-shell--premium-home`** (premium shell scoping, hero chrome, bottom bar, fog/glass). Do not widen `.portal-shell--premium-home` to other routes without a deliberate design decision; use separate wrappers for non-home pages.
- **Hero image asset:** `public/images/hero-brisbane-river-cbd-hd.jpg` — keep path stable; update SEO/alt in tandem if the file ever changes.

Before altering gradients, viewport-fit behaviour (`home-hero-premium-section--viewport-fit`), or shared `.home-hero-premium__cta` semantics, re-check AA contrast, mobile overflow, and `npm run build`.

## Hard Guards (must pass for every section)

- Do not delete existing copy blocks; keep all text in HTML/SSR output.
- Do not remove internal links, metadata, schema, or route files.
- Keep all current features operational (`/#quiz`, `/assessment`, `/contact`, `/book-consultation`, Smart Navigator, AI chat if enabled).
- Keep legal/trust messaging visible.

## Current homepage structure note

- `/` is now composed from premium homepage sections in `app/page.js` (hero + in-rail blocks), not the legacy tab shell.
- Keep `/#quiz` operational via a stable in-page anchor section (`id="quiz"`).

## Current design lock (do not change without explicit approval)

Keep the following implementation as the active visual baseline unless explicitly requested by product/brand review:

- **Shared section shell pattern (homepage bands):**
  - `relative isolate` wrapper
  - `rounded-[2rem]`, `border border-brand-plum/10`, `shadow-[var(--shadow-lux)]`
  - soft gradient/fade background (`from-[#FBF6F4]/85 via-white to-[#FBF6F4]/75`) with subtle radial overlay
  - applied to destination/services/tools/trust/knowledge/journey sections
- **Homepage hero overlays and spacing:**
  - floating header over hero image
  - tuned hero glass/fog/trust-bar offsets in `app/home.css`
- **Homepage quiz card arrangement:**
  - two-column content/CTA composition with right CTA panel
- **Footer rich layout updates:**
  - wider newsletter column
  - centered stat cards and improved stat distribution
- **Desktop visa mega menu updates:**
  - centered panel positioning and premium glass styling in `app/globals.css`

If any of the above must be changed, run a focused visual regression pass first (desktop + mobile) and document why the lock is being overridden.

## File-by-File Implementation Plan

### Section 1 - Hero hierarchy + primary conversion focus

- [x] `components/home/home-hero-bento.jsx`
  - Keep existing hero content blocks.
  - Set a single dominant primary CTA treatment.
  - Keep secondary actions visible but lower emphasis.
  - Add trust micro-signals near the CTA group.
- [x] `app/globals.css`
  - Update `.home-hero-primary-cta` to logo-matched palette tokens.
  - Keep AA contrast and focus-visible states.

### Section 2 - Instant pathway selector (summary first)

- [x] `components/home/home-tab-server.jsx`
  - Add/refresh icon-forward pathway summary cards near top.
  - Keep all existing pathway detail content below unchanged.
- [x] `app/globals.css`
  - Add pathway tile visual styles using logo palette and neutral surfaces.

### Section 3 - "How it works" (3-step clarity)

- [x] `components/home/home-tab-server.jsx`
  - Introduce a concise 3-step summary block using existing process data.
  - Keep expanded detail content below in current sections.
- [x] `app/globals.css`
  - Add lightweight stepper/card visuals.

### Section 4 - Trust blocks promoted earlier

- [x] `components/home/home-tab-server.jsx`
  - Promote visual trust proof blocks earlier in scan flow.
  - Keep current trust/compliance text and about points intact.
- [x] `app/globals.css`
  - Add trust-proof visual styles matching logo palette.
- [x] `components/home/google-reviews-panel.jsx` (if needed)
  - Keep testimonial inventory; adjust spotlight presentation only. Verified: wired in `home-tab-server.jsx`; `GET /api/reviews` → 200 (2026-05-23); no presentation change required for this pass.

### Section 5 - Services simplified, full content retained

- [x] `components/home/home-tab-server.jsx`
  - Keep summary cards above; preserve long-form service context.
  - Ensure all service links remain unchanged.

### Section 6 - Smart Navigator promotion

- [x] `components/home/home-tab-server.jsx`
  - Elevate Smart Navigator as a clear feature section.
  - Keep existing `SmartNavigator` behavior and routing.

### Section 7 - Closing CTA + footer spacing polish

- [x] `components/home/home-tab-server.jsx`
  - Add closing CTA band without removing existing sections.
- [x] `app/globals.css`
  - Refine closing CTA band and footer readability.

## Validation Commands (run after each section)

- [x] `npm run test:unit`
- [x] `npm run build`
- [x] Confirm route manifest still includes existing pages (no route loss).
- [x] Manual check: `/#quiz`, `/assessment`, `/contact`, `/book-consultation`. Verified localhost HTTP 200 for all (2026-05-23); `npm run test:nav` passed.
