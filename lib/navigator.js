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

  let baseConfidence = 70;
  if (profile === "I already know my likely pathway") baseConfidence += 22;
  if (profile === "I need help comparing options") baseConfidence += 10;
  if (profile === "I need to improve my profile first") baseConfidence -= 15;
  if (profile === "My case feels complex or time-sensitive") baseConfidence -= 5;
  
  if (/Immediately|Within 3 months/.test(timeline)) baseConfidence += 5;
  if (/Just exploring/.test(timeline)) baseConfidence -= 10;
  
  const confidenceScore = Math.max(30, Math.min(98, baseConfidence));
  
  let alternative = null;
  if (/study/i.test(goal)) alternative = { need: "Skilled Migration", reason: "Graduate pathway to PR" };
  else if (/skilled/i.test(goal)) alternative = { need: "Employer-Sponsored", reason: "If independent points are too low" };
  else if (/family|partner/i.test(goal)) alternative = { need: "Visitor Visa", reason: "Short-term option while preparing evidence" };
  else alternative = { need: "Student Visa", reason: "To upskill and build local experience" };

  const why = [];
  if (profile === "I already know my likely pathway") why.push("Matches your existing pathway knowledge.");
  if (profile === "I need help comparing options") why.push("Structured comparison aligns with your current search stage.");
  if (/Immediately|Within 3 months/.test(timeline)) why.push("Urgent timeline necessitates a direct, high-priority route.");
  if (/skilled/i.test(goal)) why.push("Your goal aligns with current high-demand occupation lists.");
  if (why.length === 0) why.push("Based on current destination availability and your primary goal.");

  const risks = [];
  if (/Just exploring/.test(timeline)) risks.push("Delaying assessment may lead to missed occupation list windows.");
  if (profile === "I need to improve my profile first") risks.push("Profile gaps (English/Experience) may lead to invitation delays.");
  if (profile === "My case feels complex or time-sensitive") risks.push("Complex history requires registered agent review to avoid refusal.");
  if (risks.length === 0) risks.push("Standard legislative changes may affect eligibility timing.");

  const timelineExpectation = 
    /Immediately|Within 3 months/.test(timeline) ? "6-12 months for primary outcomes." : 
    /Within 6 months/.test(timeline) ? "12-18 months for full preparation and lodgement." :
    "18+ months for strategic long-term planning.";

  const backupStrategy = 
    /skilled/i.test(goal) ? { need: "State Nomination (190/491)", reason: "Lower points requirement if 189 is too competitive." } :
    /partner/i.test(goal) ? { need: "Prospective Marriage (300)", reason: "If living together evidence is currently insufficient." } :
    { need: "Graduate Work Stream", reason: "Strategic extension to build local experience." };

  const hybridPathway = 
    /study/i.test(goal) ? "Study + Regional Work Hybrid (Pathway to PR via 491/190)" :
    /skilled/i.test(goal) ? "Direct Entry + Employer Match (Dual Strategy)" :
    "Visitor to Partner Onshore Transition (Strategic Bridging)";

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
    confidenceScore,
    alternative,
    why,
    risks,
    timelineExpectation,
    backupStrategy,
    hybridPathway
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
    `Hybrid: ${recommendation.hybridPathway}.`,
    `Backup: ${recommendation.backupStrategy.need}.`,
  ].join(" ");
}
