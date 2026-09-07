/**
 * No-MARN compliance helpers and feature flags.
 * Product behaviour must stay within general information + education-support scope.
 * DISABLED personalised migration engines remain behind flags for authorised review only.
 */

function envFlagTrue(name) {
  return process.env[name] === "true";
}

/** Snapshot of flags — prefer {@link getComplianceFeatureFlags} in request handlers. */
export const COMPLIANCE_FEATURE_FLAGS = {
  get PERSONALISED_NAVIGATOR() {
    return false;
  },
  get PERSONALISED_QUIZ_RESULTS() {
    return envFlagTrue("ENABLE_PERSONALISED_QUIZ_RESULTS");
  },
  get AUTHORISED_RMA_MODE() {
    return envFlagTrue("ENABLE_AUTHORISED_RMA_MODE");
  },
  get AI_PATHWAY_FUNNEL() {
    return envFlagTrue("ENABLE_AI_PATHWAY_FUNNEL");
  },
  get PUBLIC_AI_CHAT() {
    return envFlagTrue("ENABLE_PUBLIC_AI_CHAT");
  },
  get PUBLIC_MIGRATION_MATTER_PORTAL() {
    return envFlagTrue("ENABLE_PUBLIC_MIGRATION_MATTER_PORTAL");
  },
};

export function getComplianceFeatureFlags() {
  return {
    PERSONALISED_NAVIGATOR: COMPLIANCE_FEATURE_FLAGS.PERSONALISED_NAVIGATOR,
    PERSONALISED_QUIZ_RESULTS: COMPLIANCE_FEATURE_FLAGS.PERSONALISED_QUIZ_RESULTS,
    AUTHORISED_RMA_MODE: COMPLIANCE_FEATURE_FLAGS.AUTHORISED_RMA_MODE,
    AI_PATHWAY_FUNNEL: COMPLIANCE_FEATURE_FLAGS.AI_PATHWAY_FUNNEL,
    PUBLIC_AI_CHAT: COMPLIANCE_FEATURE_FLAGS.PUBLIC_AI_CHAT,
    PUBLIC_MIGRATION_MATTER_PORTAL: COMPLIANCE_FEATURE_FLAGS.PUBLIC_MIGRATION_MATTER_PORTAL,
  };
}

/** Client-visible mirror — must stay false unless both server and public env opts are set. */
export function isPublicAiChatUiEnabled() {
  if (typeof process === "undefined") return false;
  return (
    process.env.NEXT_PUBLIC_ENABLE_PUBLIC_AI_CHAT === "true" &&
    process.env.ENABLE_PUBLIC_AI_CHAT === "true"
  );
}

/** Marker for disabled legacy engines. */
export const DISABLED_PENDING_AUTHORISED_PROFESSIONAL_REVIEW =
  "DISABLED_PENDING_AUTHORISED_PROFESSIONAL_REVIEW";

export const DEFAULT_COMPLIANCE = Object.freeze({
  businessStatusDisclosure:
    "MinRosh Migration is an independent migration information and education support service. We make publicly available information easier to find and understand and can assist with education-course enquiries and general administrative support. We are not registered migration agents or Australian legal practitioners and do not provide immigration assistance or immigration legal advice.",
  shortDescription: "Independent migration information and education support using publicly available sources.",
  shortDisclaimer:
    "General information only. MinRosh does not provide immigration assistance, legal advice, or personalised visa recommendations.",
  aiInformationFinderNotice:
    "Choose a broad topic to find general information and official links. This tool does not assess eligibility, recommend a visa, or provide immigration assistance.",
  educationSupportScope:
    "We can provide general information about education providers and courses and, where available, administrative support with an education-provider admissions application. This service is separate from immigration assistance.",
  noGuaranteeStatement:
    "Information may change and should be verified through official sources. MinRosh does not guarantee admission, invitation, nomination, or any visa outcome.",
  authorisedProfessionalReferralLabel: "Find a Registered Migration Agent",
  authorisedProfessionalReferralUrl:
    "https://www.mara.gov.au/search-the-register-of-migration-agents/",
  homeAffairsUrl: "https://immi.homeaffairs.gov.au/",
  formAcknowledgementText:
    "I understand that MinRosh does not provide immigration assistance or legal advice and will not assess my visa eligibility, recommend a visa, or prepare or lodge a visa application.",
  restrictedEnquiryMessage:
    "We cannot assist with personalised visa advice or visa application preparation. Please consult a registered migration agent or Australian legal practitioner. You can search the official Register of Migration Agents using the link provided.",
  chatbotRefusal:
    "I can provide general publicly available information and official links, but I cannot assess your circumstances, recommend a visa, prepare migration documents, or help with a visa application. For that help, please contact a registered migration agent or Australian legal practitioner.",
  categoryPageBanner:
    "General information only: This page summarises publicly available information and is not immigration assistance, legal advice, or an assessment of your eligibility. Requirements can change. Check the linked official source before acting.",
  categoryPageFooter:
    "MinRosh does not recommend a visa or help prepare or lodge visa applications. If you need advice based on your circumstances, help selecting a visa, or assistance with an application, contact a registered migration agent or Australian legal practitioner.",
});

const PLACEHOLDER_MARN_RE = /available\s+on\s+request|pending|tbc|n\/?a|to\s+be\s+confirmed/i;

/** True only for a plausible individual MARN numeral — never placeholders. */
export function isPublishableMarn(value) {
  const raw = String(value || "").trim();
  if (!raw || PLACEHOLDER_MARN_RE.test(raw)) return false;
  return /^\d{5,10}$/.test(raw);
}

const PROHIBITED_PUBLIC_CLAIM_PATTERNS = [
  /\bMARN\b/i,
  /available\s+on\s+request/i,
  /registered\s+migration\s+agent/i,
  /migration\s+agent\s+brisbane/i,
  /our\s+migration\s+agents/i,
  /registered\s+with\s+OMARA/i,
  /registered\s+migration\s+practice/i,
  /registered\s+migration\s+guidance/i,
  /registered\s+migration\s+team/i,
  /best\s+migration\s+agent/i,
  /visa\s+agent\b/i,
];

/**
 * CMS publish guard: block obvious prohibited registration / agent self-claims.
 * @param {string} text
 * @returns {{ ok: true } | { ok: false, matches: string[] }}
 */
export function validatePublishableCopy(text) {
  const source = String(text || "");
  const matches = [];
  for (const pattern of PROHIBITED_PUBLIC_CLAIM_PATTERNS) {
    const found = source.match(pattern);
    if (found) matches.push(found[0]);
  }
  if (matches.length) return { ok: false, matches };
  return { ok: true };
}

export function getComplianceConfig(siteData) {
  const fromCms = siteData?.compliance && typeof siteData.compliance === "object" ? siteData.compliance : {};
  return { ...DEFAULT_COMPLIANCE, ...fromCms };
}

/** Allowed public enquiry categories after no-MARN refactor. */
export const ALLOWED_ENQUIRY_TYPES = Object.freeze([
  "general_information",
  "education_enquiry",
]);

export function isAllowedEnquiryType(value) {
  return ALLOWED_ENQUIRY_TYPES.includes(String(value || "").trim());
}

/**
 * Heuristic: message appears to request personalised immigration assistance.
 * Also catches common prompt-injection / jailbreak patterns that try to bypass scope.
 */
export function looksLikeImmigrationAssistanceRequest(text) {
  const t = String(text || "").toLowerCase();
  if (!t.trim()) return false;
  const signals = [
    /am i eligible/,
    /do i qualify/,
    /which visa (should|do) i/,
    /best visa for me/,
    /recommend (a |the )?(visa|pathway)/,
    /rank (the )?visas?/,
    /prepare (my |our )?(visa )?application/,
    /lodge (my |our )?visa/,
    /review my (documents|application|visa)/,
    /draft (a |my )?(statement|submission|form|gsv|genuine)/,
    /points (assessment|calculator|score)/,
    /how many points (do|would) i/,
    /chance of (success|invitation|approval)/,
    /probability of/,
    /success rate/,
    /refusal|cancellation|character concern|health waiver/,
    /represent me/,
    /immigration assistance/,
    /ignore (all |your )?(previous |prior )?(instructions|rules|system)/,
    /disregard (your |the )?(system|instructions|rules)/,
    /you are now (a |an )?(registered )?migration agent/,
    /act as (a |an )?(registered )?migration agent/,
    /pretend you (are|can)/,
    /jailbreak/,
    /developer mode/,
    /override (compliance|safety|scope)/,
  ];
  return signals.some((re) => re.test(t));
}

/**
 * Broader generative-scope gate: personal facts + advice verbs even without classic phrases.
 */
export function looksLikePersonalMigrationAdviceRequest(text) {
  if (looksLikeImmigrationAssistanceRequest(text)) return true;
  const t = String(text || "").toLowerCase();
  const hasPersonal = /\b(my|i'm|i am|i've|i have|our|we are)\b/.test(t);
  const hasAdviceVerb =
    /\b(eligible|qualify|recommend|strategy|strateg(y|ise|ize)|assess|should i apply|which subclass|pathway for me|best option)\b/.test(
      t
    );
  return hasPersonal && hasAdviceVerb;
}
