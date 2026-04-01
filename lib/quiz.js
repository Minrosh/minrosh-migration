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
};

function getOption(list, value) {
  return list.find((item) => item.value === value) || null;
}

export function calculateQuizResult(form) {
  const ageOption = getOption(quizOptions.age, form.age);
  const englishOption = getOption(quizOptions.english, form.english);
  const experienceOption = getOption(quizOptions.overseasExperience, form.overseasExperience);
  const educationOption = getOption(quizOptions.education, form.education);
  const partnerOption = getOption(quizOptions.partner, form.partner);
  const occupationStatusOption = getOption(quizOptions.occupationStatus, form.occupation);

  if (
    !ageOption ||
    !englishOption ||
    !experienceOption ||
    !educationOption ||
    !partnerOption ||
    !occupationStatusOption
  ) {
    return null;
  }

  const restricted = Boolean(ageOption.restricted);
  const score = restricted
    ? 0
    : ageOption.points +
      englishOption.points +
      experienceOption.points +
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

  const pointsBreakdown = [
    { label: "Age", value: ageOption.label, points: ageOption.points },
    { label: "English", value: englishOption.label, points: englishOption.points },
    {
      label: "Work Experience",
      value: experienceOption.label,
      points: experienceOption.points,
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

  const boosters =
    !restricted && score < 95
      ? [
          "Aim for Superior English (+20 pts)",
          "Secure State Nomination (Subclass 190) (+5 pts)",
          "Claim Regional Nomination (Subclass 491) (+15 pts)",
        ]
      : [];

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
  };
}
