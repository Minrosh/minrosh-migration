const DEFAULT_RECOMMENDATIONS = [
  { href: "/assessment", title: "Official Information Finder" },
  { href: "/tools", title: "Planning tools hub" },
  { href: "/contact", title: "Education or information enquiry" },
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
      title: "Looking for study information?",
      body: "Use the Official Information Finder for topic links, or send an education-course enquiry. MinRosh does not assess visa eligibility or prepare applications.",
    };
  }
  if (path.includes("partner")) {
    return {
      title: "Partner visa category information",
      body: "Read official Home Affairs partner pages and MinRosh general summaries. For personalised advice or applications, contact a registered migration agent or Australian legal practitioner.",
    };
  }
  if (path.includes("skilled")) {
    return {
      title: "Skilled category orientation",
      body: "Explore publicly described points, skills assessment, and nomination themes via official sources and MinRosh guides. We do not score competitiveness or recommend a visa.",
    };
  }
  if (path.includes("/tools")) {
    return {
      title: "Tools for general orientation",
      body: "These tools organise publicly available information. They do not assess eligibility. For education-course questions, use the enquiry form.",
    };
  }
  if (path.includes("destinations")) {
    return {
      title: "Continue with official sources",
      body: "Use hub sections and official links for orientation, then the Official Information Finder or an education enquiry if you need general next steps.",
    };
  }
  return {
    title: "Find general information or education support",
    body: "Use the Official Information Finder for topic-based official links, or contact us about education-course enquiries. MinRosh does not provide immigration assistance.",
  };
}

export function recommendedLinksForPath(pathname = "", max = 4) {
  const path = String(pathname || "").toLowerCase();
  const cluster = [];

  if (path.includes("skilled")) {
    cluster.push(
      { href: "/australian-visas-official-sources", title: "Australian visas: official sources hub" },
      { href: "/skilled-migration-australia-points-guide", title: "Skilled migration points guide" },
      { href: "/tools/pr-pathway-explorer", title: "PR pathway explorer (orientation)" },
      { href: "/australia-visa-processing-times-guide", title: "Visa processing times guide" }
    );
  } else if (path.includes("student") || path.includes("education")) {
    cluster.push(
      { href: "/australian-visas-official-sources", title: "Australian visas: official sources hub" },
      { href: "/tools/student-country-cost-planner", title: "Student country & cost planner" },
      { href: "/student-visa-australia-requirements", title: "Student visa requirements guide" },
      { href: "/australia-visa-document-checklist-guide", title: "Visa document checklist guide" }
    );
  } else if (path.includes("partner")) {
    cluster.push(
      { href: "/australian-visas-official-sources", title: "Australian visas: official sources hub" },
      { href: "/partner-visa-australia-guide", title: "Partner visa application guide" },
      { href: "/australia-visa-document-checklist-guide", title: "Visa document checklist guide" }
    );
  } else if (path.includes("employer") || path.includes("visitor")) {
    cluster.push(
      { href: "/australian-visas-official-sources", title: "Australian visas: official sources hub" },
      { href: "/australia-visa-document-checklist-guide", title: "Visa document checklist guide" }
    );
  } else if (path.includes("destinations")) {
    cluster.push(
      { href: "/tools", title: "Planning tools hub" },
      { href: "/tools/student-country-cost-planner", title: "Student country & cost planner" },
      { href: "/australia-vs-canada-migration-guide", title: "Australia vs Canada migration guide" },
      { href: "/updates", title: "Updates hub" }
    );
  } else {
    cluster.push(...DEFAULT_RECOMMENDATIONS);
  }

  return includeUnique([...cluster, ...DEFAULT_RECOMMENDATIONS]).slice(0, max);
}
