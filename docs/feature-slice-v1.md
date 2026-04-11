# Feature slice v1: `/tools` (novel work without touching core SEO pages)

## Goal

Ship **new, differentiated capabilities** on a dedicated surface so we do not rewrite high-traffic marketing pages (`/skilled-migration`, `/contact`, destination hubs, etc.) in v1.

## v1 scope

- **Public route:** [`/tools`](../app/tools/page.js) — lightweight landing that points visitors to existing flows (assessment, contact) until a concrete tool ships.
- **Future work (same slice):** add child routes under `app/tools/...` and matching `app/api/...` handlers; keep marketing URLs unchanged.

## Out of scope for v1

- Replacing homepage or destination hub layouts.
- Changing URL slugs for existing guides without redirects (see [`content-contract.md`](content-contract.md)).

## Integration checklist when adding a real tool

1. Add route under `app/tools/<name>/page.js`.
2. If indexable, append path to `STATIC_SITEMAP_ROUTES` (or document why it stays `noindex`).
3. Add env-driven feature flag if the tool calls external APIs.
4. Run [`pre-release-checklist.md`](pre-release-checklist.md).
