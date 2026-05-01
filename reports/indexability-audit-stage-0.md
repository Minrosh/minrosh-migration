# Stage 0 — Indexability audit

Generated: 2026-05-01T23:43:18.106Z
URLs audited: 81

## Root cause hypotheses (automated heuristics)

- No blocking issues from heuristics — still merge **Search Console** export for `gscReason`.

## Live vs repo / deployment

- Re-run with `INDEXABILITY_BASE_URL=http://127.0.0.1:3000` after `npm run build && npm run start` to compare prod vs local.
- Homepage probe: ok=true status=200
- Response hints: `{"cf-ray":"9f52a598c859d715-BNE"}`
- **Deployed git SHA:** not in HTTP by default — check hosting/CI.

## robots.txt

- https://minroshmigration.com.au/robots.txt → HTTP 200 ok=true

```
# As a condition of accessing this website, you agree to abide by the following
# content signals:

# (a)  If a Content-Signal = yes, you may collect content for the corresponding
#      use.
# (b)  If a Content-Signal = no, you may not collect content for the
#      corresponding use.
# (c)  If the website operator does not include a Content-Signal for a
#      corresponding use, the website operator neither grants nor restricts
#      permission via Content-Signal with respect to the corresponding use.

# The content signals and their meanings are:

# search:   building a search index and providing search results (e.g., returning
#           hyperlinks and short excerpts from your website's contents). Search does not
#           include providing AI-generated search summaries.
# ai-input: inputting content into one or more AI models (e.g., retrieval
#           augmented generation, grounding, or other real-time taking of content for
#           generative AI search answers).
# ai-train: training or fine-tuning AI models.

# ANY RESTRICTIONS EXPRESSED VIA CONTENT SIGNALS ARE EXPRESS RESERVATIONS OF
# RIGHTS UNDER ARTICLE 4 OF THE EUROPEAN UNION DIRECTIVE 2019/790 ON COPYRIGHT
# A
```

## sitemap.xml parity

- https://minroshmigration.com.au/sitemap.xml → HTTP 200 ok=true
- `<loc>` count: 81

## Thin / duplicate destination sections (manual policy)

- Review `/destinations/{slug}/about|contact|faq` in CSV; do **not** add `noindex` without stakeholder business reason (see roadmap guardrails).

## noindex / canonical recommendations

- See CSV; no automatic code changes from this report alone.

## Stage 0 scope

- No homepage redesign in this audit artifact.