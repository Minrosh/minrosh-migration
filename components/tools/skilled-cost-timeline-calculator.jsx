"use client";

import { useMemo, useState } from "react";
import { trackEvent } from "@/lib/client-analytics";

const pathwayMultipliers = {
  skilled: { fee: 1, months: 1 },
  partner: { fee: 1.35, months: 1.2 },
  student: { fee: 0.85, months: 0.75 },
};

export function SkilledCostTimelineCalculator() {
  const [pathwayType, setPathwayType] = useState("skilled");
  const [applicants, setApplicants] = useState(1);
  const [englishTestNeeded, setEnglishTestNeeded] = useState(true);
  const [skillsAssessmentNeeded, setSkillsAssessmentNeeded] = useState(true);
  const [consultationSupport, setConsultationSupport] = useState(true);

  const estimate = useMemo(() => {
    const multiplier = pathwayMultipliers[pathwayType] || pathwayMultipliers.skilled;
    const baseVisaFee = 4640;
    const additionalApplicantFee = Math.max(0, applicants - 1) * 2310;
    const englishCost = englishTestNeeded ? 420 : 0;
    const skillsCost = skillsAssessmentNeeded ? 950 : 0;
    const supportCost = consultationSupport ? 750 : 0;
    const subtotal = (baseVisaFee + additionalApplicantFee + englishCost + skillsCost + supportCost) * multiplier.fee;
    const timelineMonths = Math.max(3, Math.round((6 + Math.max(0, applicants - 1) + (skillsAssessmentNeeded ? 2 : 0)) * multiplier.months));
    return {
      totalAud: Math.round(subtotal),
      timelineMonths,
    };
  }, [applicants, consultationSupport, englishTestNeeded, pathwayType, skillsAssessmentNeeded]);

  function handleTrackCalculation() {
    trackEvent("calculator_used", {
      calculator_id: "skilled_cost_timeline",
      pathway: pathwayType,
      applicants,
      english_test_needed: englishTestNeeded,
      skills_assessment_needed: skillsAssessmentNeeded,
      consultation_support: consultationSupport,
      estimated_total_aud: estimate.totalAud,
      estimated_timeline_months: estimate.timelineMonths,
    });
  }

  return (
    <section className="content-section bento-hover" aria-label="Skilled migration cost and timeline calculator">
      <p className="section-label">Interactive calculator</p>
      <h2>Skilled cost & timeline estimator</h2>
      <p className="text-sm text-brand-plum/70">
        Quick scenario planning only. Final charges and timelines depend on official settings, evidence quality, and case specifics.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold text-brand-plum/80">
          Pathway focus
          <select
            className="mt-1 min-h-[48px] w-full rounded-xl border border-brand-plum/15 bg-white px-3 py-2"
            value={pathwayType}
            onChange={(event) => setPathwayType(event.target.value)}
          >
            <option value="skilled">Skilled pathway</option>
            <option value="partner">Partner pathway</option>
            <option value="student">Student pathway</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-brand-plum/80">
          Number of applicants
          <input
            type="number"
            min={1}
            max={6}
            className="mt-1 min-h-[48px] w-full rounded-xl border border-brand-plum/15 bg-white px-3 py-2"
            value={applicants}
            onChange={(event) => setApplicants(Math.max(1, Math.min(6, Number(event.target.value) || 1)))}
          />
        </label>
      </div>

      <div className="mt-3 grid gap-2">
        <label className="inline-flex min-h-[48px] cursor-pointer items-center gap-3 text-sm text-brand-plum/80 touch-manipulation">
          <input type="checkbox" checked={englishTestNeeded} onChange={(event) => setEnglishTestNeeded(event.target.checked)} />
          Include English test
        </label>
        <label className="inline-flex min-h-[48px] cursor-pointer items-center gap-3 text-sm text-brand-plum/80 touch-manipulation">
          <input type="checkbox" checked={skillsAssessmentNeeded} onChange={(event) => setSkillsAssessmentNeeded(event.target.checked)} />
          Include skills assessment
        </label>
        <label className="inline-flex min-h-[48px] cursor-pointer items-center gap-3 text-sm text-brand-plum/80 touch-manipulation">
          <input type="checkbox" checked={consultationSupport} onChange={(event) => setConsultationSupport(event.target.checked)} />
          Include guided consultation support
        </label>
      </div>

      <div className="mt-4 rounded-2xl border border-brand-plum/10 bg-brand-plum/[0.03] p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-plum/50">Estimated range</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <p className="text-lg font-black text-brand-plum">AUD ${estimate.totalAud.toLocaleString()}</p>
          <p className="text-lg font-black text-brand-plum">{estimate.timelineMonths} months</p>
        </div>
        <p className="mt-2 text-xs text-brand-plum/60">
          Estimate includes visa, testing/assessment toggles, and preparation support assumptions.
        </p>
      </div>

      <button type="button" className="btn btn-primary mt-4 min-h-[48px] touch-manipulation" onClick={handleTrackCalculation}>
        Track this scenario
      </button>
    </section>
  );
}
