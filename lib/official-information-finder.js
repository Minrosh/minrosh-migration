/**
 * Deterministic Official Information Finder topics → public sources.
 * No eligibility, ranking, confidence, or personalised recommendations.
 */

export const INFORMATION_FINDER_TOPICS = [
  {
    id: "skilled",
    label: "Skilled / points-tested visas (general)",
    summary:
      "Public pages about Australia’s skilled visa framework, SkillSelect, and related official listings.",
    sources: [
      {
        name: "Department of Home Affairs — Visa listing",
        url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",
        lastChecked: "2026-09-07",
      },
      {
        name: "Department of Home Affairs — SkillSelect",
        url: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect",
        lastChecked: "2026-09-07",
      },
      {
        name: "MinRosh — Skilled migration information",
        url: "/skilled-migration",
        lastChecked: "2026-09-07",
        isOfficial: false,
      },
    ],
  },
  {
    id: "student",
    label: "Student visas and study information",
    summary: "Official student visa information and education-related public pages.",
    sources: [
      {
        name: "Department of Home Affairs — Student visa (subclass 500)",
        url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
        lastChecked: "2026-09-07",
      },
      {
        name: "Study Australia",
        url: "https://www.studyaustralia.gov.au/",
        lastChecked: "2026-09-07",
      },
      {
        name: "MinRosh — Student visa information",
        url: "/student-visa-australia",
        lastChecked: "2026-09-07",
        isOfficial: false,
      },
    ],
  },
  {
    id: "partner",
    label: "Partner and family visa categories",
    summary: "Public information on partner and family visa categories.",
    sources: [
      {
        name: "Department of Home Affairs — Partner visas",
        url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/partner-onshore",
        lastChecked: "2026-09-07",
      },
      {
        name: "MinRosh — Partner visa information",
        url: "/partner-visa-australia",
        lastChecked: "2026-09-07",
        isOfficial: false,
      },
    ],
  },
  {
    id: "employer",
    label: "Employer-sponsored work visas",
    summary: "Official employer-sponsored and temporary skilled work information.",
    sources: [
      {
        name: "Department of Home Affairs — Working in Australia",
        url: "https://immi.homeaffairs.gov.au/visas/working-in-australia",
        lastChecked: "2026-09-07",
      },
      {
        name: "MinRosh — Employer-sponsored information",
        url: "/employer-sponsored-visas",
        lastChecked: "2026-09-07",
        isOfficial: false,
      },
    ],
  },
  {
    id: "visitor",
    label: "Visitor visas",
    summary: "Official visitor and tourist visa information.",
    sources: [
      {
        name: "Department of Home Affairs — Visitor visas",
        url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600",
        lastChecked: "2026-09-07",
      },
      {
        name: "MinRosh — Visitor visa information",
        url: "/visitor-visas",
        lastChecked: "2026-09-07",
        isOfficial: false,
      },
    ],
  },
  {
    id: "official-help",
    label: "Who can help with an application",
    summary:
      "Official guidance on who may lawfully provide immigration assistance, and how to find a registered migration agent.",
    sources: [
      {
        name: "Home Affairs — Who can help with your application",
        url: "https://immi.homeaffairs.gov.au/help-support/who-can-help-with-your-application",
        lastChecked: "2026-09-07",
      },
      {
        name: "OMARA — Search the Register of Migration Agents",
        url: "https://www.mara.gov.au/search-the-register-of-migration-agents/",
        lastChecked: "2026-09-07",
      },
      {
        name: "OMARA — Helpers who are not registered",
        url: "https://www.mara.gov.au/get-help-with-a-visa/helpers-not-registered",
        lastChecked: "2026-09-07",
      },
    ],
  },
  {
    id: "education-support",
    label: "Education course and admissions support (MinRosh)",
    summary:
      "General education-provider and course enquiry support offered by MinRosh. This is not immigration assistance.",
    sources: [
      {
        name: "MinRosh — Education course enquiry",
        url: "/education-consultation",
        lastChecked: "2026-09-07",
        isOfficial: false,
      },
      {
        name: "Study Australia — Find a course",
        url: "https://www.studyaustralia.gov.au/en/study-in-australia",
        lastChecked: "2026-09-07",
      },
    ],
  },
];

export function getInformationFinderTopic(id) {
  return INFORMATION_FINDER_TOPICS.find((t) => t.id === id) || null;
}
