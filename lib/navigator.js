export const navigatorSteps = [
  {
    id: "country",
    title: "Where do you want to move?",
    options: ["Australia", "New Zealand", "Canada", "United Kingdom"],
  },
  {
    id: "goal",
    title: "What is your primary goal?",
    options: ["Study", "Skilled Work", "Family or Partner", "Visitor or Other"],
  },
  {
    id: "timeline",
    title: "How soon do you want to start?",
    options: ["Immediately", "Within 3 months", "Within 6 months", "Just exploring"],
  },
  {
    id: "support",
    title: "What kind of support do you want?",
    options: [
      "Quick direction only",
      "Document and strategy planning",
      "Full consultation roadmap",
      "Urgent case review",
    ],
  },
  {
    id: "profile",
    title: "Which description sounds closest to your situation?",
    options: [
      "I already know my likely pathway",
      "I need help comparing options",
      "I need to improve my profile first",
      "My case feels complex or time-sensitive",
    ],
  },
];

function getService(goal) {
  if (/study/i.test(goal)) {
    return {
      title: "Education consultation and student visa strategy",
      href: "/education-consultation",
      cta: "Open education page",
      need: "Student Visa",
      prep: [
        "Your preferred course or study level",
        "Current education history and transcripts",
        "Expected budget and timing for study",
      ],
    };
  }

  if (/skilled/i.test(goal)) {
    return {
      title: "Skilled migration strategy session",
      href: "/skilled-migration",
      cta: "Open skilled migration page",
      need: "Skilled Migration",
      prep: [
        "Occupation title and years of experience",
        "Your current English test level or plan",
        "Education details and target timeline",
      ],
    };
  }

  if (/family|partner/i.test(goal)) {
    return {
      title: "Partner and family pathway consultation",
      href: "/partner-visa-australia",
      cta: "Open partner visa page",
      need: "Partner Visa",
      prep: [
        "Relationship timeline and current visa status",
        "Any shared financial or household evidence",
        "Questions around timing or eligibility concerns",
      ],
    };
  }

  return {
    title: "General migration consultation",
    href: "/contact",
    cta: "Contact MinRosh",
    need: "Family / Complex Case",
    prep: [
      "Your current visa or travel status",
      "What you want to achieve in the next 6 to 12 months",
      "Any refusals, deadlines, or urgent constraints",
    ],
  };
}

export function buildNavigatorRecommendation(answers) {
  const goal = answers.goal || "General migration support";
  const country = answers.country || "Australia";
  const timeline = answers.timeline || "Just exploring";
  const support = answers.support || "Full consultation roadmap";
  const profile = answers.profile || "I need help comparing options";

  const service = getService(goal);

  const urgency =
    /Immediately|Within 3 months/.test(timeline) || /Urgent/i.test(support)
      ? "Priority action is recommended so documents, timing, and eligibility risks can be reviewed early."
      : "A planning consultation is the strongest next step if you want to reduce risk before moving forward.";

  const profileNote =
    profile === "I need to improve my profile first"
      ? "Your next best move is likely strategy before lodgement, especially if points, English, or supporting evidence need work."
      : profile === "My case feels complex or time-sensitive"
        ? "A direct human review is recommended because complex timing or evidence issues are easier to solve early."
        : profile === "I already know my likely pathway"
          ? "You may be ready to move straight into a targeted consultation rather than more general exploration."
          : "A guided comparison can help narrow the strongest pathway before you spend time or money in the wrong direction.";

  const supportNote =
    support === "Quick direction only"
      ? "Start with the Smart Navigator result, then move to the relevant page for a deeper overview."
      : support === "Document and strategy planning"
        ? "Focus on evidence quality, timing, and the order in which you prepare tests, documents, and applications."
        : support === "Urgent case review"
          ? "Use WhatsApp or contact MinRosh directly after this result so time-sensitive issues can be triaged quickly."
          : "A consultation roadmap is the best format if you want a clearer step-by-step plan.";

  return {
    title: service.title,
    href: service.href,
    cta: service.cta,
    mainNeed: service.need,
    summary: `Best fit: ${service.title}. Focus country: ${country}. Preferred support: ${support}.`,
    urgency,
    profileNote,
    supportNote,
    next: `Recommended next step: review the ${goal.toLowerCase()} pathway with MinRosh and prepare your background, current documents, and target timeline before consultation.`,
    prep: service.prep,
    timing: timeline,
  };
}

export function navigatorSummaryText(answers, recommendation) {
  return [
    `Assessment destination: ${answers.country}.`,
    `Primary goal: ${answers.goal}.`,
    `Timeline: ${answers.timeline}.`,
    `Support requested: ${answers.support}.`,
    `Profile signal: ${answers.profile}.`,
    `Recommended path: ${recommendation.title}.`,
  ].join(" ");
}
