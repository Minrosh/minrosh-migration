# Homepage Content-Safe Redesign Checklist

This rollout adopts a modern visual design without losing existing content, SEO, or route coverage.

## Hard Guards (must pass for every section)

- Do not delete existing copy blocks; keep all text in HTML/SSR output.
- Do not remove internal links, metadata, schema, or route files.
- Keep all current features operational (`/#quiz`, `/assessment`, `/contact`, `/book-consultation`, Smart Navigator, AI chat if enabled).
- Keep legal/trust messaging visible.

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
- [ ] `components/home/google-reviews-panel.jsx` (if needed)
  - Keep testimonial inventory; adjust spotlight presentation only.

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
- [ ] Manual check: `/#quiz`, `/assessment`, `/contact`, `/book-consultation`.
