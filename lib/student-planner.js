import countriesPayload from "../data/student-country-planner/countries.json";

/** @typedef {{ id: string, label: string, currency: string }} StudentPlannerCountryBase */

/**
 * @param {unknown} list
 * @param {string} id
 * @param {number} fallback
 */
function multiplierFrom(list, id, fallback = 1) {
  if (!Array.isArray(list)) return fallback;
  const row = list.find((x) => x.id === id);
  return row?.tuitionMultiplier ?? row?.livingMultiplier ?? fallback;
}

/**
 * @param {number} value
 * @param {number} low
 * @param {number} high
 */
function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

/**
 * @returns {import('../data/student-country-planner/countries.json').countries}
 */
export function getStudentPlannerCountries() {
  const list = countriesPayload.countries;
  return Array.isArray(list) ? list : [];
}

export function getStudentPlannerDisclaimer() {
  return String(countriesPayload.disclaimer || "").trim();
}

/**
 * @param {string} countryId
 * @param {number} studyMonths 1–120
 */
export function estimateStudentStudyCosts(countryId, studyMonths) {
  const countries = getStudentPlannerCountries();
  const country = countries.find((c) => c.id === countryId) ?? countries.find((c) => c.id === "australia");
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

/**
 * @param {{
 *   countryId: string,
 *   regionId?: string,
 *   studyLevelId?: string,
 *   providerTypeId?: string,
 *   studyMonths?: number,
 *   jobTypeId?: string,
 * }} inputs
 */
export function estimateStudentCountryPlan(inputs) {
  const countries = getStudentPlannerCountries();
  const country = countries.find((c) => c.id === inputs.countryId) ?? countries[0];
  if (!country) throw new Error("Student planner: no country data");

  const regionId = inputs.regionId || country.regions?.[0]?.id;
  const studyLevelId = inputs.studyLevelId || country.studyLevels?.[0]?.id;
  const providerTypeId = inputs.providerTypeId || country.providerTypes?.[0]?.id;
  const jobTypeId = inputs.jobTypeId || country.jobTypes?.[0]?.id;

  const regionMult = multiplierFrom(country.regions, regionId, 1);
  const levelMult = multiplierFrom(country.studyLevels, studyLevelId, 1);
  const providerMult = multiplierFrom(country.providerTypes, providerTypeId, 1);

  const rawMonths = Number(inputs.studyMonths);
  const studyMonths = clamp(Number.isFinite(rawMonths) ? Math.round(rawMonths) : 12, 1, 120);
  const years = studyMonths / 12;

  const tuitionMid = Math.round(
    ((country.tuitionAnnualLow + country.tuitionAnnualHigh) / 2) * years * levelMult * providerMult
  );
  const livingMonthlyMid = Math.round(
    ((country.livingMonthlyLow + country.livingMonthlyHigh) / 2) * regionMult
  );
  const livingAnnual = livingMonthlyMid * 12;
  const rentMonthly = Math.round(livingMonthlyMid * (country.rentShareOfLiving ?? 0.45));
  const transportMonthly = Math.round(livingMonthlyMid * (country.transportShareOfLiving ?? 0.12));
  const foodMonthly = Math.round(livingMonthlyMid * (country.foodShareOfLiving ?? 0.28));

  const visaFee = country.visaFeeEstimate ?? 0;
  const healthAnnual = Math.round((country.healthInsuranceMonthly ?? 0) * studyMonths);
  const fundsShowMoney = Math.round(
    livingMonthlyMid * (country.fundsShowMoneyMonths ?? 12) + tuitionMid * 0.5
  );

  const job = country.jobTypes?.find((j) => j.id === jobTypeId) ?? country.jobTypes?.[0];
  const hourlyMid = job ? (job.hourlyLow + job.hourlyHigh) / 2 : 0;
  const workHours = country.workHoursPerWeek ?? 20;
  const fortnightlyIncome = Math.round(hourlyMid * workHours * 2);
  const monthlyIncome = Math.round(fortnightlyIncome * 2);
  const monthlyShortfall = Math.max(0, livingMonthlyMid - monthlyIncome);
  const firstYearCost = Math.round(tuitionMid + livingAnnual + visaFee + healthAnnual);

  const gapLabel =
    monthlyShortfall > 0
      ? `Indicative monthly shortfall of ~${monthlyShortfall.toLocaleString()} ${country.currency} (living vs part-time income)`
      : `Indicative monthly surplus of ~${Math.abs(livingMonthlyMid - monthlyIncome).toLocaleString()} ${country.currency} — still budget conservatively`;

  return {
    country,
    studyMonths,
    regionId,
    studyLevelId,
    providerTypeId,
    jobTypeId,
    firstYearCostEstimate: firstYearCost,
    monthlyLivingEstimate: livingMonthlyMid,
    rentMonthlyEstimate: rentMonthly,
    transportMonthlyEstimate: transportMonthly,
    foodMonthlyEstimate: foodMonthly,
    visaFeeEstimate: visaFee,
    healthInsuranceEstimate: healthAnnual,
    fundsShowMoneyEstimate: fundsShowMoney,
    tuitionMidEstimate: tuitionMid,
    fortnightlyIncomeEstimate: fortnightlyIncome,
    monthlyIncomeEstimate: monthlyIncome,
    incomeVsExpenseGap: gapLabel,
    mainFinancialRisk: country.mainFinancialRisk,
    nextVisaStage: country.nextVisaStage,
    prPathwayNote: country.prPathwayNote,
    recommendedNextStep:
      "Book an education consultation to stress-test your course choice, funds story, and work-hour assumptions before you pay enrolment deposits.",
    workHoursPerWeek: workHours,
    jobLabel: job?.label ?? "Part-time work",
    hourlyRange: job ? `${job.hourlyLow}–${job.hourlyHigh}` : "—",
  };
}
