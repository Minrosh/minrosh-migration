import { describe, expect, it } from "vitest";
import {
  estimateStudentStudyCosts,
  estimateStudentCountryPlan,
  getStudentPlannerCountries,
  getStudentPlannerDisclaimer,
} from "../lib/student-planner.js";

describe("student-planner", () => {
  it("lists countries", () => {
    const c = getStudentPlannerCountries();
    expect(c.length).toBeGreaterThanOrEqual(4);
    expect(c.map((x) => x.id)).toContain("australia");
  });

  it("exposes planner disclaimer", () => {
    const d = getStudentPlannerDisclaimer();
    expect(d.toLowerCase()).toContain("planning estimate");
  });

  it("scales tuition and living by months", () => {
    const six = estimateStudentStudyCosts("australia", 6);
    const twelve = estimateStudentStudyCosts("australia", 12);
    expect(six.studyMonths).toBe(6);
    expect(twelve.studyMonths).toBe(12);
    expect(twelve.tuitionLow).toBeGreaterThan(six.tuitionLow);
    expect(twelve.livingLow).toBeGreaterThan(six.livingLow);
  });

  it("clamps months", () => {
    const low = estimateStudentStudyCosts("canada", 0);
    expect(low.studyMonths).toBe(1);
    const high = estimateStudentStudyCosts("canada", 999);
    expect(high.studyMonths).toBe(120);
  });

  it("estimateStudentCountryPlan returns planning estimates without eligibility language", () => {
    const plan = estimateStudentCountryPlan({
      countryId: "australia",
      studyMonths: 12,
    });
    expect(plan.firstYearCostEstimate).toBeGreaterThan(0);
    expect(plan.monthlyLivingEstimate).toBeGreaterThan(0);
    expect(plan.fortnightlyIncomeEstimate).toBeGreaterThan(0);
    expect(plan.prPathwayNote.toLowerCase()).not.toContain("guaranteed");
    expect(plan.recommendedNextStep).toMatch(/consultation/i);
  });
});
