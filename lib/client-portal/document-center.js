const TEMPLATE_LIBRARY = [
  { id: "passport", title: "Identity Document Checklist", href: "/australia-visa-document-checklist-guide" },
  { id: "timeline", title: "Processing Timeline Guide", href: "/australia-visa-processing-times-guide" },
  { id: "costs", title: "Visa Fees and Cost Planner", href: "/australia-visa-fees-and-costs-guide" },
];

const REQUIREMENT_SETS = {
  skilled: [
    { id: "identity_docs", title: "Identity documents", required: true },
    { id: "employment_evidence", title: "Employment evidence", required: true },
    { id: "skills_assessment", title: "Skills assessment", required: true },
    { id: "english_test", title: "English test evidence", required: false },
  ],
  partner: [
    { id: "identity_docs", title: "Identity documents", required: true },
    { id: "relationship_evidence", title: "Relationship evidence", required: true },
    { id: "sponsor_docs", title: "Sponsor documents", required: true },
    { id: "statutory_declarations", title: "Statutory declarations", required: false },
  ],
  student: [
    { id: "identity_docs", title: "Identity documents", required: true },
    { id: "coe_offer", title: "Offer / CoE documents", required: true },
    { id: "financial_capacity", title: "Financial capacity evidence", required: true },
    { id: "english_test", title: "English test evidence", required: false },
  ],
  general: [
    { id: "identity_docs", title: "Identity documents", required: true },
    { id: "supporting_docs", title: "Supporting documents", required: false },
  ],
};

function normalizeNeed(mainNeed) {
  const raw = String(mainNeed || "").toLowerCase();
  if (raw.includes("skilled")) return "skilled";
  if (raw.includes("partner")) return "partner";
  if (raw.includes("student")) return "student";
  return "general";
}

export function templateLibraryForCustomer() {
  return TEMPLATE_LIBRARY;
}

export function defaultRequirementsForCustomer(customer) {
  const key = normalizeNeed(customer?.mainNeed);
  return (REQUIREMENT_SETS[key] || REQUIREMENT_SETS.general).map((item) => ({
    ...item,
    status: "pending",
    updatedAt: "",
    notes: "",
  }));
}

export function mergeRequirements(current, defaults) {
  const currentList = Array.isArray(current) ? current : [];
  const merged = defaults.map((item) => {
    const existing = currentList.find((entry) => entry.id === item.id);
    return existing ? { ...item, ...existing } : item;
  });
  for (const extra of currentList) {
    if (!merged.some((item) => item.id === extra.id)) {
      merged.push(extra);
    }
  }
  return merged;
}

export function buildPortalTimeline(customer) {
  const activity = Array.isArray(customer?.activityLog) ? customer.activityLog : [];
  return [...activity]
    .slice(-40)
    .reverse()
    .map((item) => ({
      at: String(item.at || ""),
      action: String(item.action || "update"),
      detail: String(item.detail || ""),
    }));
}
