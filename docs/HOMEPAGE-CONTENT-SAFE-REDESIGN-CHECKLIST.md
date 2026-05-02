# Homepage Content-Safe Redesign Checklist

> **Archive:** The old editable surface under `components/home/**` and `components/home-page-content.jsx` was **removed** as dead code. Homepage work now lives in `app/page.js`, deferred motion/carousel components, flowchart, and navigator island—see [`COMPONENT_MAP.md`](../COMPONENT_MAP.md).

This checklist historically tracked a prior rollout; keep **Hard Guards** in mind for any future homepage edits.

## Hard Guards (must pass for every section)

- Do not delete existing copy blocks; keep all text in HTML/SSR output.
- Do not remove internal links, metadata, schema, or route files.
- Keep all current features operational (`/assessment`, `/contact`, `/book-consultation`, `/tools/*`, Smart Navigator, AI chat if enabled). Do not rely on removed hash routes like `/#quiz`.
- Keep legal/trust messaging visible.

## Current homepage surface (post–legacy removal)

Edits land in **`app/page.js`**, **`components/ultra-maximum-layout.jsx`**, deferred islands (`home-deferred-*`, `home-smart-navigator-island`, `home-visa-comparison-flowchart`), and shared styles in **`app/home.css`** / **`app/globals.css`** (avoid changing `.admin-root` rules). See [`COMPONENT_MAP.md`](../COMPONENT_MAP.md).

## Validation Commands (run after material homepage edits)

- [ ] `npm run test:unit`
- [ ] `npm run build`
- [ ] Confirm route manifest still includes existing pages (no route loss).
- [ ] Manual check: `/assessment`, `/contact`, `/book-consultation`, `/tools`, `/tools/pr-pathway-explorer`, homepage hero + navigator.
