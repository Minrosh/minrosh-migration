export const quizOptions = {
  age: [
    { value: "18-24", label: "18-24", points: 25 },
    { value: "25-32", label: "25-32", points: 30 },
    { value: "33-39", label: "33-39", points: 25 },
    { value: "40-44", label: "40-44", points: 15 },
    { value: "45+", label: "45+", points: 0, restricted: true },
  ],
  occupationStatus: [
    { value: "yes", label: "Yes, it appears on a relevant skilled list" },
    { value: "unsure", label: "I need an occupation review" },
    { value: "no", label: "Not currently / not sure it qualifies" },
  ],
  english: [
    { value: "superior", label: "Superior (IELTS 8 / PTE 79+)", points: 20 },
    { value: "proficient", label: "Proficient (IELTS 7 / PTE 65+)", points: 10 },
    { value: "competent", label: "Competent (IELTS 6 / PTE 50+)", points: 0 },
  ],
  overseasExperience: [
    { value: "0-2", label: "0-2 years", points: 0 },
    { value: "3-4", label: "3-4 years", points: 5 },
    { value: "5-7", label: "5-7 years", points: 10 },
    { value: "8+", label: "8+ years", points: 15 },
  ],
  australianSkilled: [
    {
      value: "none",
      label: "None / not in Australia in skilled occupation",
      points: 0,
    },
    { value: "1y", label: "1 year in Australia (skilled occupation)", points: 5 },
    { value: "3y", label: "3 years in Australia (skilled occupation)", points: 10 },
    { value: "5y", label: "5 years in Australia (skilled occupation)", points: 15 },
    { value: "8y", label: "8 years in Australia (skilled occupation)", points: 20 },
  ],
  skillsReadiness: [
    { value: "not_started", label: "Not started — planning skills assessment" },
    { value: "in_progress", label: "In progress with assessing authority" },
    { value: "positive", label: "Positive / completed skills assessment" },
  ],
  education: [
    { value: "phd", label: "PhD / Doctorate", points: 20 },
    { value: "bachelor", label: "Bachelor or Master's Degree", points: 15 },
    { value: "diploma", label: "Diploma or Trade Qualification", points: 10 },
    { value: "other", label: "Other / Not assessed yet", points: 0 },
  ],
  partner: [
    { value: "single", label: "Single or partner is an Australian citizen / PR", points: 10 },
    { value: "skilled", label: "Partner has skilled assessment and English", points: 10 },
    { value: "english", label: "Partner has English only", points: 5 },
    { value: "none", label: "None of the above", points: 0 },
  ],
  pathwayFocus: [
    { value: "independent", label: "Subclass 189 — independent focus" },
    { value: "state", label: "Subclass 190 — state nomination interest" },
    { value: "regional", label: "Subclass 491 — regional nomination interest" },
    { value: "comparing", label: "Still comparing pathways" },
  ],
  /** Policy context: sectors often emphasised in Australian skilled migration planning (illustrative). */
  occupationSector: [
    { value: "healthcare", label: "Healthcare / allied health" },
    { value: "teaching", label: "Teaching / education" },
    { value: "construction_trades", label: "Construction trades" },
    { value: "cybersecurity", label: "Cybersecurity / information security" },
    { value: "digital_it", label: "Other digital / IT professional" },
    { value: "other", label: "Another field / not listed above" },
  ],
  /**
   * Skills in Demand (SID) — three employer-sponsored skilled streams (policy labels evolve; confirm on Home Affairs).
   */
  sidStream: [
    {
      value: "specialist_skills",
      label: "Specialist Skills — senior / specialist professional roles (higher-skill band)",
    },
    {
      value: "core_skills",
      label: "Core Skills — typical skilled occupation sponsorship (mainstream band)",
    },
    {
      value: "essential_skills",
      label: "Essential Skills — targeted workforce gaps (sector-specific rules)",
    },
    { value: "comparing", label: "Still comparing SID streams / unsure" },
  ],
  /** Hybrid / analytical capability (illustrative — not a Home Affairs points band). */
  hybridCapability: [
    { value: "mostly_operational", label: "Mostly operational — hands-on or routine delivery", points: 0 },
    { value: "mixed", label: "Mixed — analysis, coordination, or stakeholder judgment", points: 3 },
    {
      value: "strategic_advisory",
      label: "Strong advisory, systems, or strategic leadership in my role",
      points: 6,
    },
  ],
};

/**
 * 2026 “Green / priority” narrative: healthcare, trades, education only (illustrative — not a government guarantee).
 * Cyber / broader IT use the amber “digital” tier below for traffic-light copy.
 */
export const GREEN_PRIORITY_SECTORS = new Set(["healthcare", "teaching", "construction_trades"]);

const DIGITAL_PRIORITY_SECTORS = new Set(["cybersecurity", "digital_it"]);

/** @deprecated Use GREEN_PRIORITY_SECTORS — kept for imports expecting this name. */
export const TRAFFIC_LIGHT_GREEN_SECTORS = GREEN_PRIORITY_SECTORS;

/** Illustrative “high priority” sector add-on — Healthcare, Trades, Education (+ cyber/digital tier). Not SkillSelect-tested. */
export function prioritySectorIllustrativeBonus(sector) {
  if (["healthcare", "teaching", "construction_trades"].includes(sector)) return 12;
  if (["cybersecurity", "digital_it"].includes(sector)) return 9;
  return 0;
}

/** @deprecated Use trafficLight === "green" + occupationSector; kept for any external imports. */
export const PRIORITY_PROCESSING_SECTORS = new Set(["healthcare", "construction_trades"]);

/** Illustrative points added when user focuses on subclass 491 regional nomination (actual +15 applies when nominated). */
export const REGIONAL_PATHWAY_ILLUSTRATIVE_BONUS = 15;

function getOption(list, value) {
  return list.find((item) => item.value === value) || null;
}

export function calculateQuizResult(form) {
  const ageOption = getOption(quizOptions.age, form.age);
  const englishOption = getOption(quizOptions.english, form.english);
  const experienceOption = getOption(quizOptions.overseasExperience, form.overseasExperience);
  const auWorkOption = getOption(quizOptions.australianSkilled, form.australianSkilled);
  const skillsReadinessOption = getOption(quizOptions.skillsReadiness, form.skillsReadiness);
  const educationOption = getOption(quizOptions.education, form.education);
  const partnerOption = getOption(quizOptions.partner, form.partner);
  const occupationStatusOption = getOption(quizOptions.occupationStatus, form.occupation);
  const pathwayFocusOption = getOption(quizOptions.pathwayFocus, form.pathwayFocus);
  const occupationSectorOption = getOption(quizOptions.occupationSector, form.occupationSector);
  const sidStreamOption = getOption(quizOptions.sidStream, form.sidStream);
  const hybridOption = getOption(quizOptions.hybridCapability, form.hybridCapability);

  if (
    !ageOption ||
    !englishOption ||
    !experienceOption ||
    !auWorkOption ||
    !skillsReadinessOption ||
    !educationOption ||
    !partnerOption ||
    !occupationStatusOption ||
    !pathwayFocusOption ||
    !occupationSectorOption ||
    !sidStreamOption ||
    !hybridOption
  ) {
    return null;
  }

  const restricted = Boolean(ageOption.restricted);
  const baseScore = restricted
    ? 0
    : ageOption.points +
      englishOption.points +
      experienceOption.points +
      auWorkOption.points +
      educationOption.points +
      partnerOption.points +
      hybridOption.points;

  const regionalBonus =
    !restricted && form.pathwayFocus === "regional" ? REGIONAL_PATHWAY_ILLUSTRATIVE_BONUS : 0;
  const priorityBonus = restricted ? 0 : prioritySectorIllustrativeBonus(form.occupationSector);
  const score = baseScore + regionalBonus + priorityBonus;

  const messages = [];
  const selectedOccupation =
    typeof form.occupationName === "string" && form.occupationName.trim()
      ? form.occupationName.trim()
      : "your selected occupation";

  const planAStrategy = !restricted
    ? [
        "Plan A — Employer-sponsored sequence (Skills in Demand / 482-style pathways → permanent routes where eligible): in 2026 many viable strategies start when you can secure qualifying skilled employment, meet TSMIT and list rules, and obtain sponsorship or nomination support.",
        "Plan B — Points-tested skilled visas (subclasses 189, 190, 491): still central for many profiles, but invitations are occupation-specific; compare your indicative total to realistic ceilings, not only the 65-point legal minimum.",
      ]
    : [];

  if (restricted) {
    messages.push(
      "Direct PR is restricted for applicants aged 45+, but employer-sponsored and alternative pathways may still be available."
    );
  } else if (score >= 65) {
    messages.push(
      "You meet the legal minimum 65-point threshold for EOI, but invitation competitiveness can still vary significantly."
    );
  } else {
    messages.push(
      "You are currently below the 65-point threshold. A profile-strengthening plan or alternative pathway review is recommended."
    );
  }

  if (!restricted && regionalBonus > 0) {
    messages.push(
      `This total includes an illustrative +${regionalBonus} pts for a successful subclass 491 regional nomination (the bonus applies when nomination is granted — confirm against current Home Affairs points tables).`
    );
  }

  if (!restricted && priorityBonus > 0) {
    messages.push(
      `This total includes an illustrative +${priorityBonus} pts “2026 high-priority sector” weighting (healthcare, education, trades, or digital/cyber tiers) — it is not an extra SkillSelect band; confirm your ANZSCO against current lists.`
    );
  }

  if (!restricted && hybridOption.points > 0) {
    messages.push(
      "Stronger analytical, advisory, or systems leadership in your role often maps better to hybrid skilled narratives — align evidence and references to how you exercise judgment, not only task lists."
    );
  }

  if (form.occupation === "yes") {
    messages.push("A relevant skilled occupation can materially improve pathway confidence.");
  } else if (form.occupation === "unsure") {
    messages.push("An occupation review is a strong next step before committing to a pathway.");
  } else {
    messages.push("If your occupation is not on a relevant list, alternative pathways may matter more.");
  }

  if (form.skillsReadiness === "not_started") {
    messages.push(
      "Skills assessment timing often drives the whole sequence — check assessing authority requirements early."
    );
  } else if (form.skillsReadiness === "in_progress") {
    messages.push(
      "While assessment is in progress, avoid locking in EOI or nomination dates until you have a clear outcome."
    );
  } else {
    messages.push(
      "A positive skills assessment strengthens skilled pathway positioning when combined with competitive points."
    );
  }

  const goldenTicketSector =
    form.occupationSector === "healthcare" ||
    form.occupationSector === "teaching" ||
    form.occupationSector === "construction_trades" ||
    form.occupationSector === "cybersecurity" ||
    form.occupationSector === "digital_it";

  if (goldenTicketSector) {
    messages.push(
      "Your sector is often highlighted in national skilled workforce planning (including digital / cyber roles) — keep occupation list alignment, evidence, and English competitiveness as tight as any other pathway."
    );
  }

  if (form.sidStream === "specialist_skills") {
    messages.push(
      "Specialist Skills (SID) targets higher-skill roles with distinct settings — confirm salary, occupation list placement, and nomination rules on current Home Affairs material rather than assuming Core Skills settings."
    );
  } else if (form.sidStream === "core_skills") {
    messages.push(
      "Core Skills is the mainstream employer-sponsored skilled band for many occupations — TSMIT and the Skills in Demand occupation list usually drive whether a role can proceed."
    );
  } else if (form.sidStream === "essential_skills") {
    messages.push(
      "Essential Skills addresses specific workforce segments with different parameters — verify that your role is intended for this stream and not Core or Specialist Skills before planning."
    );
  } else {
    messages.push(
      "Comparing Specialist, Core, and Essential Skills streams early avoids investing in the wrong nomination or evidence set for employer-sponsored pathways."
    );
  }

  if (form.pathwayFocus === "state") {
    messages.push(
      "State nomination (190) adds points but depends on state lists, quotas, and your ability to meet each jurisdiction’s rules."
    );
  } else if (form.pathwayFocus === "regional") {
    messages.push(
      "Regional nomination (491) can add substantial points; understand residence and compliance obligations before committing."
    );
  } else if (form.pathwayFocus === "independent") {
    messages.push(
      "Independent (189) invitations are highly competitive — your total points and occupation ceiling matter as much as the minimum threshold."
    );
  } else {
    messages.push(
      "Comparing 189, 190, and 491 against your profile is often the most efficient use of time before you invest in tests and fees."
    );
  }

  const pointsBreakdown = [
    { label: "Age", value: ageOption.label, points: ageOption.points },
    { label: "English", value: englishOption.label, points: englishOption.points },
    {
      label: "Overseas skilled experience",
      value: experienceOption.label,
      points: experienceOption.points,
    },
    {
      label: "Australian skilled employment",
      value: auWorkOption.label,
      points: auWorkOption.points,
    },
    { label: "Education", value: educationOption.label, points: educationOption.points },
    { label: "Partner", value: partnerOption.label, points: partnerOption.points },
  ];

  if (!restricted) {
    pointsBreakdown.push({
      label: "Hybrid / advisory capability (illustrative)",
      value: hybridOption.label,
      points: hybridOption.points,
    });
  }

  if (regionalBonus > 0) {
    pointsBreakdown.push({
      label: "Regional nomination (491) — illustrative",
      value: "When nominated (not SkillSelect-tested)",
      points: regionalBonus,
    });
  }

  if (priorityBonus > 0) {
    pointsBreakdown.push({
      label: "2026 high-priority sector weighting — illustrative",
      value: "Healthcare, education, trades, or digital/cyber emphasis (not SkillSelect-tested)",
      points: priorityBonus,
    });
  }

  const pointBreakdownText = pointsBreakdown
    .map((item) => `${item.label}: ${item.value} (${item.points} pts)`)
    .join("; ");

  let marketInsight =
    !restricted && score < 90
      ? "While 65 is the legal minimum, 2026 invitation trends for skilled pathways often require 90+ points."
      : null;

  if (!restricted && form.pathwayFocus === "regional") {
    const regionalExtra =
      " Regional 491 → 191 routes can be comparatively accessible when 189/190 ceilings are tight, but residence and compliance rules are strict — map obligations before you rely on regional points.";
    marketInsight = marketInsight ? marketInsight + regionalExtra : regionalExtra.trim();
  }

  const occupationRealismNote =
    !restricted && form.occupationSector === "digital_it"
      ? "While 65 is the legal minimum for points-tested skilled visas, 2026 trends for many ICT occupations show invitations clustering at 95+ points for independent (189-style) rounds — treat employer-sponsored or nomination routes as equally important to model."
      : null;

  const priorityProcessingBadge =
    !restricted && PRIORITY_PROCESSING_SECTORS.has(form.occupationSector);

  let trafficLight = "amber";
  let trafficLightLabel = "Standard skilled profile (Amber)";
  let trafficLightDescription =
    "Most skilled roles follow mainstream planning patterns; outcomes still depend on points, lists, and nomination.";
  let greenPrioritySector = false;
  let digitalPriorityTier = false;

  if (restricted || form.occupation === "no") {
    trafficLight = "red";
    trafficLightLabel = "Complex / high-scrutiny pathway (Red)";
    trafficLightDescription =
      "Age limits or occupation-list uncertainty often mean alternative pathways and stronger evidence expectations — plan with care.";
  } else if (GREEN_PRIORITY_SECTORS.has(form.occupationSector)) {
    trafficLight = "green";
    greenPrioritySector = true;
    trafficLightLabel = "Green / priority sector (Healthcare, Trades, Education)";
    trafficLightDescription =
      "Healthcare, teaching, and construction trades are frequently referenced in Australian skilled workforce planning — still verify your ANZSCO against current lists.";
  } else if (DIGITAL_PRIORITY_SECTORS.has(form.occupationSector)) {
    digitalPriorityTier = true;
    trafficLightLabel = "Digital & cyber skilled profile (Amber)";
    trafficLightDescription =
      "ICT and cybersecurity roles often attract policy attention, but invitation patterns differ from the 2026 green-priority sectors — model employer-sponsored and state options alongside independent pathways.";
  }

  const sidStreamKey = sidStreamOption.value;

  const boosters = [];
  if (!restricted && score < 95) {
    if (form.pathwayFocus === "state") {
      boosters.push("Research state occupation lists and opening dates for nomination");
      boosters.push("Aim for Superior English (+20 pts) if you are below competitive totals");
      boosters.push("Align skills assessment occupation wording with state requirements");
    } else if (form.pathwayFocus === "regional") {
      boosters.push("Map regional nomination options and residence obligations for subclass 491");
      boosters.push("Consider combined overseas + Australian experience evidence");
      boosters.push("Aim for Superior English (+20 pts) where points are still short");
    } else if (form.pathwayFocus === "independent") {
      boosters.push("Aim for Superior English (+20 pts)");
      boosters.push("Maximise skilled employment points (overseas and Australian bands)");
      boosters.push("Consider NAATI CCL or PY only where they genuinely apply to your pathway");
    } else {
      boosters.push("Book a structured comparison of 189, 190, and 491 for your occupation");
      boosters.push("Aim for Superior English (+20 pts) if points are below typical invite levels");
      boosters.push("Secure skills assessment early — it gates most skilled steps");
    }
  }

  /** Actionable checklist when below a competitive skilled total (illustrative — not personal advice). */
  const scoreBoostChecklist = [];
  if (!restricted && score < 90) {
    const engGain = 20 - englishOption.points;
    if (engGain > 0) {
      const hypothetical = score + engGain;
      scoreBoostChecklist.push(
        `You are at ${score} pts (including any illustrative regional or priority-sector lines shown above) with ${englishOption.points} pts from English. Reaching the Superior English band is worth up to 20 pts — in this simplified model that could lift your indicative total toward ${hypothetical} pts (confirm with current Home Affairs tables and your test results).`
      );
    }
    if (educationOption.points < 20) {
      scoreBoostChecklist.push(
        "Higher recognised qualifications can add points on the skilled test — compare your highest qualification against the current points table."
      );
    }
    if (experienceOption.points < 15 || auWorkOption.points < 20) {
      scoreBoostChecklist.push(
        "Skilled employment in your nominated occupation (overseas and/or in Australia) can add further points with the right evidence and dates."
      );
    }
    if (form.pathwayFocus === "independent" || form.pathwayFocus === "comparing") {
      scoreBoostChecklist.push(
        "Subclass 189 invitations are highly competitive; explore whether subclass 190 or 491 nomination could suit your timeline and location goals."
      );
    }
    scoreBoostChecklist.push(
      "Community language (NAATI CCL) and Professional Year can add points only for eligible visas — verify they apply to your pathway before investing time and fees."
    );
  }

  let pathwayStrengthBand = "standard";
  let pathwayStrengthLabel =
    "Standard pathway modelling — not a prediction of invitation, processing speed, or visa grant.";
  if (restricted || trafficLight === "red") {
    pathwayStrengthBand = "review";
    pathwayStrengthLabel =
      "Elevated complexity in this model — plan for stronger evidence and alternative routes.";
  } else if (priorityBonus >= 12 && score >= 72) {
    pathwayStrengthBand = "elevated";
    pathwayStrengthLabel =
      "Elevated alignment with 2026 priority sectors (healthcare, education, construction trades) in this illustrative view.";
  } else if (priorityBonus >= 9 && score >= 70) {
    pathwayStrengthBand = "strong";
    pathwayStrengthLabel =
      "Strong digital / cybersecurity policy emphasis with a competitive indicative profile.";
  } else if (score >= 90) {
    pathwayStrengthBand = "strong";
    pathwayStrengthLabel =
      "Indicative points are high — still verify occupation-specific invitation history.";
  }

  return {
    restricted,
    score,
    baseScore,
    regionalPointsBonus: regionalBonus,
    prioritySectorBonus: priorityBonus,
    thresholdMet: score >= 65 && !restricted,
    messages: [...planAStrategy, ...messages],
    occupationRealismNote,
    marketInsight,
    boosters,
    scoreBoostChecklist,
    selectedOccupation,
    pointsBreakdown,
    pointBreakdownText,
    skillsReadinessLabel: skillsReadinessOption.label,
    pathwayFocusLabel: pathwayFocusOption.label,
    occupationSectorLabel: occupationSectorOption.label,
    sidStreamLabel: sidStreamOption.label,
    sidStreamKey,
    priorityProcessingBadge,
    goldenTicketSector,
    trafficLight,
    trafficLightLabel,
    trafficLightDescription,
    greenPrioritySector,
    digitalPriorityTier,
    pathwayStrengthBand,
    pathwayStrengthLabel,
    hybridCapabilityLabel: hybridOption.label,
  };
}
