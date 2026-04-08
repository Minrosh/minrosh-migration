# Algorithm Rollout Notes

## Implemented in this phase

- **Recommendation engine (rule-based):**
  - File: `lib/content-personalization.js`
  - Inputs: current page path cluster (`student`, `partner`, `skilled`, `destinations`, default)
  - Output: recommended internal links used by `components/content-page.js`

- **CTA personalization:**
  - File: `lib/content-personalization.js`
  - Inputs: current page path
  - Output: next-step CTA title/body tuned by intent cluster

- **Lead scoring v2 behavior signals:**
  - Files: `lib/crm/lead-scoring.js`, `lib/crm/leads-service.js`, `app/api/contact/route.js`
  - Added signals: `quizCompleted`, `quizCompletionDepth`, `returnVisitCount`, `consultationRequested`
  - Uses both textual readiness markers and behavior signals

## Next rollout phase (recommended)

1. Persist page engagement metrics (e.g. return visits, guide completion) per lead ID.
2. Add recommendation feedback loop (clicked recommendation -> boost future ranking).
3. Add admin controls for recommendation weights by cluster.
4. A/B test CTA variants by page cluster with event-level reporting.
