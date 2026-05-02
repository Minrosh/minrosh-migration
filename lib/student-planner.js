import countriesPayload from "../data/student-country-planner/countries.json";

/** @typedef {{ id: string, label: string, currency: string, tuitionAnnualLow: number, tuitionAnnualHigh: number, livingMonthlyLow: number, livingMonthlyHigh: number, officialNote: string }} StudentPlannerCountry */

/**
 * @returns {StudentPlannerCountry[]}
 */
export function getStudentPlannerCountries() {
  const list = countriesPayload.countries;
  return Array.isArray(list) ? list : [];
}

/**
 * @param {string} countryId
 * @param {number} studyMonths 1–120
 * @returns {{ country: StudentPlannerCountry, studyMonths: number, tuitionLow: number, tuitionHigh: number, livingLow: number, livingHigh: number, totalLow: number, totalHigh: number }}
 */
export function estimateStudentStudyCosts(countryId, studyMonths) {
  const countries = getStudentPlannerCountries();
  const country =
    countries.find((c) => c.id === countryId) ?? countries.find((c) => c.id === "australia");
  if (!country) {
    throw new Error("Student planner: no country data");
  }
  const raw = Number(studyMonths);
  const rounded = Number.isFinite(raw) ? Math.round(raw) : 12;
  const months = Math.min(120, Math.max(1, rounded));
  const years = months / 12;
  const tuitionLow = Math.round(country.tuitionAnnualLow * years);
  const tuitionHigh = Math.round(country.tuitionAnnualHigh * years);
  const livingLow = Math.round(country.livingMonthlyLow * months);
  const livingHigh = Math.round(country.livingMonthlyHigh * months);
  return {
    country,
    studyMonths: months,
    tuitionLow,
    tuitionHigh,
    livingLow,
    livingHigh,
    totalLow: tuitionLow + livingLow,
    totalHigh: tuitionHigh + livingHigh,
  };
}
