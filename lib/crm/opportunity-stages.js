export const OPPORTUNITY_STAGES = [
  "new",
  "qualified",
  "consult_booked",
  "docs_pending",
  "submitted",
  "won",
  "lost",
];

export function normalizeOpportunityStage(s) {
  const v = String(s || "").trim();
  return OPPORTUNITY_STAGES.includes(v) ? v : "new";
}
