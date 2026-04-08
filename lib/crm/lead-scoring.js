/**
 * Rule-based lead scoring (1–100 scale per dimension, total capped).
 * @param {Record<string, unknown>} lead
 */
export function computeLeadScores(lead) {
  const mainNeed = String(lead?.mainNeed || lead?.sourceDetail || "").toLowerCase();
  let intentScore = 40;
  if (/skilled|engineer|visa 189|190|491/.test(mainNeed)) intentScore += 25;
  if (/student|485|graduate/.test(mainNeed)) intentScore += 15;
  if (/partner|family/.test(mainNeed)) intentScore += 10;
  intentScore = Math.min(100, intentScore);

  let budgetFit = 50;
  if (/employer|sponsor|tsmit|salary/.test(mainNeed)) budgetFit += 20;
  budgetFit = Math.min(100, budgetFit);

  let visaUrgency = 35;
  const msg = String(lead?.message || "").toLowerCase();
  if (/urgent|asap|deadline|expire|expiry/.test(msg)) visaUrgency += 40;
  if (/soon|months|weeks/.test(msg)) visaUrgency += 15;
  visaUrgency = Math.min(100, visaUrgency);

  let docReadiness = 45;
  if (/passport|skills assessment|english|pte|ielts/.test(msg)) docReadiness += 25;
  docReadiness = Math.min(100, docReadiness);

  let engagementScore = Number(lead?.engagementScore);
  if (!Number.isFinite(engagementScore)) {
    engagementScore = lead?.customerId || lead?.enquiryId ? 55 : 30;
  }
  engagementScore = Math.min(100, Math.max(0, engagementScore));

  const total = Math.round((intentScore + budgetFit + visaUrgency + docReadiness + engagementScore) / 5);
  return {
    intentScore,
    budgetFit,
    visaUrgency,
    docReadiness,
    engagementScore,
    totalScore: total,
  };
}
