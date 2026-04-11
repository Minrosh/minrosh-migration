const DEFAULT_RECOMMENDATIONS = [
  { href: "/tools", title: "Client tools hub" },
  { href: "/assessment", title: "Start with a free assessment" },
  { href: "/book-consultation", title: "Book a consultation" },
  { href: "/updates", title: "Read latest migration updates" },
];

function includeUnique(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.href || !item?.title) return false;
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}

export function personalizedCtaForPath(pathname = "") {
  const path = String(pathname || "").toLowerCase();
  if (path.includes("student")) {
    return {
      title: "Ready to plan your study pathway?",
      body: "Use an assessment first, then book a consultation to validate your student strategy, budget, and timeline.",
    };
  }
  if (path.includes("partner")) {
    return {
      title: "Ready to strengthen your partner pathway?",
      body: "Start with a document and timeline check so relationship evidence and sequence are clear before lodgement.",
    };
  }
  if (path.includes("skilled")) {
    return {
      title: "Ready to improve invitation readiness?",
      body: "Review points competitiveness, evidence quality, and nomination options before committing to the next stage.",
    };
  }
  if (path.includes("/tools")) {
    return {
      title: "Use tools first, then go deeper",
      body: "Work through assessments and guides here, then book when you need case-specific sequencing and evidence planning.",
    };
  }
  if (path.includes("destinations")) {
    return {
      title: "Map the next practical step",
      body: "Use hub sections and official links for orientation, then assessment or consultation for your specific profile.",
    };
  }
  return {
    title: "Ready to discuss your options?",
    body: "Explore guides and tools, start a free assessment, then book a consultation when you want tailored sequencing.",
  };
}

export function recommendedLinksForPath(pathname = "", max = 4) {
  const path = String(pathname || "").toLowerCase();
  const cluster = [];

  if (path.includes("skilled")) {
    cluster.push(
      { href: "/skilled-migration-australia-points-guide", title: "Skilled migration points guide" },
      { href: "/australia-visa-processing-times-guide", title: "Visa processing times guide" }
    );
  } else if (path.includes("student") || path.includes("education")) {
    cluster.push(
      { href: "/student-visa-australia-requirements", title: "Student visa requirements guide" },
      { href: "/australia-visa-document-checklist-guide", title: "Visa document checklist guide" }
    );
  } else if (path.includes("partner")) {
    cluster.push(
      { href: "/partner-visa-australia-guide", title: "Partner visa application guide" },
      { href: "/australia-visa-document-checklist-guide", title: "Visa document checklist guide" }
    );
  } else if (path.includes("destinations")) {
    cluster.push(
      { href: "/tools", title: "Client tools hub" },
      { href: "/australia-vs-canada-migration-guide", title: "Australia vs Canada migration guide" },
      { href: "/updates", title: "Updates hub" }
    );
  } else {
    cluster.push(...DEFAULT_RECOMMENDATIONS);
  }

  return includeUnique([...cluster, ...DEFAULT_RECOMMENDATIONS]).slice(0, max);
}
