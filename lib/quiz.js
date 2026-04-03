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
};

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

  if (
    !ageOption ||
    !englishOption ||
    !experienceOption ||
    !auWorkOption ||
    !skillsReadinessOption ||
    !educationOption ||
    !partnerOption ||
    !occupationStatusOption ||
    !pathwayFocusOption
  ) {
    return null;
  }

  const restricted = Boolean(ageOption.restricted);
  const score = restricted
    ? 0
    : ageOption.points +
      englishOption.points +
      experienceOption.points +
      auWorkOption.points +
      educationOption.points +
      partnerOption.points;

  const messages = [];
  const selectedOccupation =
    typeof form.occupationName === "string" && form.occupationName.trim()
      ? form.occupationName.trim()
      : "your selected occupation";

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

  const pointBreakdownText = pointsBreakdown
    .map((item) => `${item.label}: ${item.value} (${item.points} pts)`)
    .join("; ");

  const marketInsight =
    !restricted && score < 90
      ? "While 65 is the legal minimum, 2026 invitation trends for skilled pathways often require 90+ points."
      : null;

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

  return {
    restricted,
    score,
    thresholdMet: score >= 65 && !restricted,
    messages,
    marketInsight,
    boosters,
    selectedOccupation,
    pointsBreakdown,
    pointBreakdownText,
    skillsReadinessLabel: skillsReadinessOption.label,
    pathwayFocusLabel: pathwayFocusOption.label,
  };
}
