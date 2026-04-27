/**
 * Phrases matched in long-form guide copy (longest wins). Definitions are plain-language hints, not legal advice.
 * @typedef {{ phrase: string, definition: string, word?: boolean }} GlossaryEntry
 */

/** @type {GlossaryEntry[]} */
export const MIGRATION_GLOSSARY = [
  {
    phrase: "Expression of Interest",
    definition:
      "A preliminary step in SkillSelect where you register interest in a points-tested skilled visa. It is not a visa application until you are invited.",
  },
  {
    phrase: "Department of Home Affairs",
    definition: "The Australian government department that publishes visa rules, lists, and the official visa finder.",
  },
  {
    phrase: "Temporary Skilled Migration Income Threshold",
    definition:
      "A minimum income threshold that applies to many employer-sponsored nominations. It is updated over time — always confirm the current figure on Home Affairs.",
  },
  { phrase: "SkillSelect", definition: "The online system used to lodge an Expression of Interest (EOI) for some skilled visas." },
  { phrase: "Skills in Demand", definition: "Australia’s employer-sponsored skilled visa framework (often discussed alongside income thresholds and occupation lists)." },
  { phrase: "Confirmation of Enrolment", definition: "A document from your education provider required for most student visa (subclass 500) applications." },
  { phrase: "visa application charge", definition: "The government fee paid when you lodge a visa application (separate from agents, tests, or health checks)." },
  { phrase: "state nomination", definition: "When an Australian state or territory supports your skilled visa pathway, often for subclasses 190 or 491." },
  { phrase: "regional nomination", definition: "Nomination linked to living and working in regional Australia for pathways such as subclass 491." },
  { phrase: "skills assessment", definition: "A positive assessment from the relevant authority showing your qualifications and work fit your nominated skilled occupation." },
  { phrase: "ANZSCO", definition: "The Australian and New Zealand Standard Classification of Occupations — used to describe skilled occupations for migration purposes." },
  { phrase: "OMARA", definition: "The Office of the Migration Agents Registration Authority — the regulator for registered migration agents in Australia." },
  { phrase: "MARA", definition: "Migration Agents Registration Authority (often used informally to mean the migration agent register and regulatory framework)." },
  { phrase: "Genuine Student", definition: "A requirement to show that study in Australia is your primary purpose and that you intend to comply with visa conditions." },
  { phrase: "TSMIT", definition: "Temporary Skilled Migration Income Threshold — confirm the current amount on Department of Home Affairs pages before relying on any figure.", word: true },
  { phrase: "CoE", definition: "Confirmation of Enrolment from your institution.", word: true },
  { phrase: "EOI", definition: "Expression of Interest lodged in SkillSelect for relevant skilled pathways.", word: true },
  { phrase: "VAC", definition: "Visa Application Charge — the main government lodgement fee for the visa subclass.", word: true },
  { phrase: "GTE", definition: "Genuine Temporary Entrant — relevant to some visa types; student routes often focus on Genuine Student requirements instead.", word: true },
  { phrase: "PR", definition: "Permanent residence — status after meeting requirements of a permanent visa pathway.", word: true },
  { phrase: "491", definition: "Skilled Work Regional (Provisional) visa (subclass 491) — a regional skilled pathway with residence obligations.", word: true },
  { phrase: "190", definition: "Skilled Nominated visa (subclass 190) — includes state or territory nomination.", word: true },
  { phrase: "189", definition: "Skilled Independent visa (subclass 189) — points-tested without state nomination.", word: true },
  { phrase: "500", definition: "Student visa (subclass 500) — study in Australia with strict compliance conditions.", word: true },
  { phrase: "482", definition: "Commonly used label for employer-sponsored temporary skilled work — confirm the current visa name and rules on Home Affairs.", word: true },
  { phrase: "820", definition: "Partner visa temporary stage for many onshore partner applications.", word: true },
  { phrase: "801", definition: "Partner visa permanent stage after eligibility is met on the 820/801 pathway.", word: true },
  { phrase: "309", definition: "Partner visa temporary stage for many offshore partner applications.", word: true },
  { phrase: "skilled migration", definition: "A points-tested pathway for professionals and workers with occupations on Australia's skilled lists." },
  { phrase: "student pathway", definition: "A strategy focusing on Australian education first, often leading to graduate or skilled visa options later." },
  { phrase: "family/complex case", definition: "Applications involving family members, relationship evidence, or complicated backgrounds requiring extra preparation." },
  { phrase: "hybrid pathway", definition: "A strategy combining two visa types, such as starting on a student visa and transitioning to a skilled or employer-sponsored route." },
  { phrase: "100", definition: "Partner visa permanent stage after eligibility is met on the 309/100 pathway.", word: true },
];
