export const quizOptions = {
  age: [
    { value: "18-24", label: "18-24", points: 25 },
    { value: "25-32", label: "25-32", points: 30 },
    { value: "33-39", label: "33-39", points: 25 },
    { value: "40-44", label: "40-44", points: 15 },
    { value: "45+", label: "45+", points: 0, restricted: true },
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

export function calculateQuizResult(form) {
  const ageOption = quizOptions.age.find((item) => item.value === form.age);
  const englishOption = quizOptions.english.find((item) => item.value === form.english);
  const experienceOption = quizOptions.overseasExperience.find(
    (item) => item.value === form.overseasExperience
  );
  const educationOption = quizOptions.education.find((item) => item.value === form.education);
  const partnerOption = quizOptions.partner.find((item) => item.value === form.partner);

  if (!ageOption || !englishOption || !experienceOption || !educationOption || !partnerOption) {
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

  if (restricted) {
    messages.push(
      "Direct PR is restricted for applicants aged 45+, but employer-sponsored or alternative pathways may still be available."
    );
  } else if (score >= 65) {
    messages.push(
      "You meet the minimum 65-point threshold for EOI. A stronger profile may still be needed depending on occupation and competition."
    );
  } else {
    messages.push(
      "You are currently below the 65-point threshold. State, regional, employer-sponsored, or profile-strengthening options may still help."
    );
  }

  if (form.occupation === "yes") {
    messages.push("A skilled-list occupation can materially improve pathway confidence.");
  } else if (form.occupation === "unsure") {
    messages.push("An occupation review is a strong next step before deciding on your pathway.");
  } else {
    messages.push("If your occupation is not on a relevant skilled list, alternative pathways may matter more.");
  }

  return {
    restricted,
    score,
    thresholdMet: score >= 65 && !restricted,
    messages,
  };
}
