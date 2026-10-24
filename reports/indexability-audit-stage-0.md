# Stage 0 — Indexability audit

Generated: 2026-10-24T12:34:18.120Z
URLs audited: 85

## Root cause hypotheses (automated heuristics)

- No blocking issues from heuristics — still merge **Search Console** export for `gscReason`.

## Live vs repo / deployment

- Re-run with `INDEXABILITY_BASE_URL=http://127.0.0.1:3000` after `npm run build && npm run start` to compare prod vs local.
- Homepage probe: ok=true status=200
- Response hints: `{}`
- **Deployed git SHA:** not in HTTP by default — check hosting/CI.

## robots.txt

- http://127.0.0.1:3128/robots.txt → HTTP 200 ok=true

```
User-Agent: GPTBot
Disallow: /

User-Agent: CCBot
Disallow: /

User-Agent: *
Allow: /
Allow: /api/reviews
Allow: /api/stats
Disallow: /admin
Disallow: /api
Disallow: /upload

Host: https://minroshmigration.com.au
Sitemap: https://minroshmigration.com.au/sitemap.xml

```

## sitemap.xml parity

- http://127.0.0.1:3128/sitemap.xml → HTTP 200 ok=true
- `<loc>` count: 85

## URLs needing attention

- None flagged by heuristics.

## Thin / duplicate destination sections (manual policy)

- Review `/destinations/{slug}/about|contact|faq` in the table above; do **not** add `noindex` without stakeholder business reason (see roadmap guardrails).

## noindex / canonical recommendations

- See the attention table above; no automatic code changes from this report alone.

## Stage 0 scope

- No homepage redesign in this audit artifact.