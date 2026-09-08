/**
 * CMS / public-copy compliance guard for no-MARN mode.
 * Blocks self-claims and high-risk immigration-assistance advertising.
 * Allows referral language that directs users to independent RMAs / lawyers.
 */

/** Referral phrases that must not be treated as MinRosh self-claims. */
const REFERRAL_SAFE_SNIPPETS = [
  /find a registered migration agent/i,
  /contact a registered migration agent/i,
  /consult a registered migration agent/i,
  /speak with a registered migration agent/i,
  /search the (official )?register of migration agents/i,
  /independent registered migration agent/i,
  /australian legal practitioner/i,
  /we are not (a |an )?(registered )?migration agent/i,
  /minrosh is not (a |an )?(registered )?migration agent/i,
  /do not provide (personalised )?visa recommendations/i,
  /does not provide (personalised )?visa recommendations/i,
  /do not provide immigration assistance/i,
  /does not provide immigration assistance/i,
];

/**
 * Hard-block patterns (self-claims / assistance advertising).
 * Applied after masking known-safe referral snippets.
 */
const BLOCK_PATTERNS = [
  { id: "marn_claim", re: /\bMARN\b/i },
  { id: "marn_placeholder", re: /available\s+on\s+request/i },
  { id: "migration_agent_brisbane", re: /migration\s+agent\s+brisbane/i },
  { id: "our_migration_agents", re: /our\s+migration\s+agents/i },
  { id: "we_are_rma", re: /\bwe\s+are\s+(a\s+|an\s+)?registered\s+migration\s+agents?\b/i },
  { id: "registered_with_omara", re: /registered\s+with\s+OMARA/i },
  { id: "registered_practice", re: /registered\s+migration\s+(practice|team|guidance)\b/i },
  { id: "best_migration_agent", re: /best\s+migration\s+agent/i },
  { id: "visa_agent_self", re: /\b(your|our|minrosh)\s+visa\s+agent\b/i },
  { id: "migration_agent_style", re: /migration[- ]agent[- ]style/i },
  { id: "we_assess_eligibility", re: /\bwe\s+assess\s+(your\s+)?(visa\s+)?eligibility\b/i },
  { id: "assess_your_eligibility", re: /\bassess(es|ing)?\s+your\s+(visa\s+)?eligibility\b/i },
  { id: "we_lodge", re: /\bwe\s+lodge\s+(your\s+)?(visa\s+)?application\b/i },
  { id: "lodge_your_visa", re: /\blodge\s+your\s+visa\s+application\b/i },
  { id: "prepare_your_visa", re: /\b(we\s+)?prepare\s+your\s+visa\s+application\b/i },
  { id: "recommend_a_visa_service", re: /\bwe\s+recommend\s+(a\s+|the\s+|your\s+)?visa\b/i },
  { id: "guaranteed_visa", re: /\b(guarantee|guaranteed)\s+(visa|pr|permanent\s+residence|approval)\b/i },
  { id: "won_your_visa", re: /\b(we\s+)?(won|secured|obtained)\s+(your\s+)?(visa|pr)\b/i },
  { id: "free_eligibility_assessment", re: /free\s+eligibility\s+assessment/i },
  { id: "personalised_pathway_service", re: /personalised\s+(ai\s+)?pathway\s+(analysis|results?|recommendation)/i },
  { id: "mara_agent_keyword", re: /\bMARA\s+agent\b/i },
];

/**
 * Soft warnings — do not block alone, but surface for manual review.
 */
const WARNING_PATTERNS = [
  { id: "your_pathway", re: /\byour\s+pathway\b/i },
  { id: "find_your_pathway", re: /\bfind\s+your\s+pathway\b/i },
  { id: "best_pathway", re: /\bbest\s+pathway\b/i },
  { id: "recommended_pathway", re: /\brecommended\s+pathway\b/i },
  { id: "pathway_strategy", re: /\bpathway\s+strategy\b/i },
  { id: "lodgement_strategy", re: /\blodgement\s+strategy\b/i },
  { id: "we_help_you_lodge", re: /\bhelp\s+you\s+(lodge|prepare)\b/i },
  { id: "case_management", re: /\b(manage|managing)\s+(your\s+)?(migration\s+)?case\b/i },
  { id: "document_review_service", re: /\bdocument\s+review\b/i },
  { id: "application_support", re: /\bapplication\s+support\b/i },
  { id: "visa_support", re: /\bvisa\s+support\b/i },
];

/**
 * Mask safe referral / prohibition snippets before block matching.
 * @param {string} text
 */
function maskSafeReferralSnippets(text) {
  let out = String(text || "");
  for (const re of REFERRAL_SAFE_SNIPPETS) {
    out = out.replace(re, " __SAFE_REFERRAL__ ");
  }
  return out;
}

/**
 * @param {string} text
 * @returns {{ ok: true, matches: string[], warnings: string[] } | { ok: false, matches: string[], warnings: string[] }}
 */
export function validatePublishableCopy(text) {
  const source = String(text || "");
  const masked = maskSafeReferralSnippets(source);
  /** @type {string[]} */
  const matches = [];
  /** @type {string[]} */
  const warnings = [];

  for (const { id, re } of BLOCK_PATTERNS) {
    const found = masked.match(re);
    if (found) matches.push(`${id}:${found[0]}`);
  }

  // Residual bare self-claim: "registered migration agent" not in a safe referral context
  if (/\bregistered\s+migration\s+agent/i.test(masked)) {
    matches.push("registered_migration_agent:registered migration agent");
  }
  if (/\bvisa\s+agent\b/i.test(masked) && !/\b(not\s+a\s+)?visa\s+agent\b/i.test(masked)) {
    // already partially covered; keep visa agent as block when not negated
    if (!matches.some((m) => m.startsWith("visa_agent"))) {
      matches.push("visa_agent:visa agent");
    }
  }

  for (const { id, re } of WARNING_PATTERNS) {
    const found = masked.match(re);
    if (found) warnings.push(`${id}:${found[0]}`);
  }

  if (matches.length) return { ok: false, matches, warnings };
  return { ok: true, matches: [], warnings };
}

/**
 * True when copy is safe to publish publicly under current no-MARN rules.
 * @param {string} text
 */
export function isPublishablePublicCopy(text) {
  return validatePublishableCopy(text).ok;
}
