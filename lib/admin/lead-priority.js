/**
 * Heuristic lead priority for CRM triage (1–100). Not a prediction of visa outcome.
 * Uses enquiry fields and optional quizSummary / message text from the contact flow.
 */

const NEED_WEIGHT = {
  "Skilled Migration": 28,
  "Employer-Sponsored": 22,
  "Student Pathway": 10,
  "Student Visa": 10,
  "Partner Visa": 14,
  "Family / Complex Case": 12,
};

const OCCUPATION_DEMAND_HINTS = [
  { re: /\b(nurse|nursing|ahpra|doctor|physio|midwife|healthcare|allied health)\b/i, add: 14 },
  { re: /\b(trade|electrician|carpenter|plumber|welder|construction)\b/i, add: 14 },
  { re: /\b(teacher|teaching|education)\b/i, add: 10 },
  { re: /\b(cyber|security engineer|infosec|penetration)\b/i, add: 10 },
  { re: /\b(engineer|developer|software|it\b|ict)\b/i, add: 6 },
];

const ENGLISH_HINTS = [
  { re: /\bsuperior\b/i, add: 12 },
  { re: /\bproficient\b/i, add: 7 },
  { re: /\bcompetent\b/i, add: 3 },
];

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

export function extractIndicativePoints(text) {
  if (!text) return null;
  const m = String(text).match(/estimated\s+points?\s*:?\s*(\d+)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

/** Aligns with quiz GREEN_PRIORITY_SECTORS (healthcare, trades, education) — not digital/IT. */
const GREEN_PRIORITY_TEXT_PATTERNS = [
  /\b(nurse|nursing|ahpra|doctor|physio|midwife|healthcare|allied health)\b/i,
  /\b(teacher|teaching|education)\b/i,
  /\b(trade|electrician|carpenter|plumber|welder|construction)\b/i,
];

/**
 * “Green” priority occupation signals from free text (healthcare, trades, education).
 */
export function isGreenPriorityOccupationText(blob) {
  const t = String(blob || "");
  return GREEN_PRIORITY_TEXT_PATTERNS.some((re) => re.test(t));
}

/**
 * Hot CRM lead: indicative quiz points > 90 and Green-sector keywords in message/summary.
 */
export function isHotGreenSkilledLead(enquiry) {
  const blob = [enquiry?.message, enquiry?.quizSummary].filter(Boolean).join("\n");
  const pts = extractIndicativePoints(blob);
  if (pts == null || pts <= 90) return false;
  return isGreenPriorityOccupationText(blob);
}

/**
 * @param {{ mainNeed?: string, message?: string, quizSummary?: string }} enquiry
 * @returns {{ score: number, band: 'hot' | 'warm' | 'cool', hint: string }}
 * Combines indicative points (from text) with stacked occupation-demand keyword bonuses (capped).
 */
export function scoreLeadPriority(enquiry) {
  const mainNeed = String(enquiry?.mainNeed || "");
  const blob = [enquiry?.message, enquiry?.quizSummary].filter(Boolean).join("\n");

  let score = 18;
  score += NEED_WEIGHT[mainNeed] ?? 8;

  const pts = extractIndicativePoints(blob);
  if (pts != null) {
    score += clamp(Math.round((pts / 100) * 34), 0, 34);
  }

  let occupationDemand = 0;
  for (const { re, add } of OCCUPATION_DEMAND_HINTS) {
    if (re.test(blob)) occupationDemand += add;
  }
  score += clamp(occupationDemand, 0, 26);

  for (const { re, add } of ENGLISH_HINTS) {
    if (re.test(blob)) {
      score += add;
      break;
    }
  }

  if (/\b491\b|\b190\b|\b189\b|\bregional\b/i.test(blob)) score += 4;
  if (/\burgent\b|\basap\b|\bimmediately\b/i.test(blob)) score += 5;

  score = Math.round(clamp(score, 1, 100));

  let band = "cool";
  let hint = "Standard follow-up queue.";
  if (score >= 72) {
    band = "hot";
    hint = "Strong skilled signals or high indicative points — prioritise a timely response.";
  } else if (score >= 48) {
    band = "warm";
    hint = "Worth a structured callback; confirm pathway and documents early.";
  }

  return { score, band, hint };
}
