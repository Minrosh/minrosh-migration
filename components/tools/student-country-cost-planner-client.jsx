"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { estimateStudentCountryPlan, getStudentPlannerCountries } from "../../lib/student-planner";
import { trackEvent } from "../../lib/client-analytics";

/**
 * @param {{ disclaimer: string, defaultCountryId?: string }} props
 */
export function StudentCountryCostPlannerClient({ disclaimer, defaultCountryId = "australia" }) {
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const countries = useMemo(() => getStudentPlannerCountries(), []);

  const [countryId, setCountryId] = useState(defaultCountryId);
  const country = countries.find((c) => c.id === countryId) ?? countries[0];

  const [regionId, setRegionId] = useState(country?.regions?.[0]?.id ?? "");
  const [studyLevelId, setStudyLevelId] = useState(country?.studyLevels?.[0]?.id ?? "");
  const [providerTypeId, setProviderTypeId] = useState(country?.providerTypes?.[0]?.id ?? "");
  const [jobTypeId, setJobTypeId] = useState(country?.jobTypes?.[0]?.id ?? "");
  const [months, setMonths] = useState(12);

  useEffect(() => {
    if (!country) return;
    setRegionId(country.regions?.[0]?.id ?? "");
    setStudyLevelId(country.studyLevels?.[0]?.id ?? "");
    setProviderTypeId(country.providerTypes?.[0]?.id ?? "");
    setJobTypeId(country.jobTypes?.[0]?.id ?? "");
  }, [countryId, country]);

  const markStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("student_planner_started", { country: countryId });
  };

  const result = useMemo(() => {
    try {
      return estimateStudentCountryPlan({
        countryId,
        regionId,
        studyLevelId,
        providerTypeId,
        jobTypeId,
        studyMonths: months,
      });
    } catch {
      return null;
    }
  }, [countryId, regionId, studyLevelId, providerTypeId, jobTypeId, months]);

  useEffect(() => {
    if (result && !completedRef.current) {
      completedRef.current = true;
      trackEvent("student_planner_completed", { country: countryId, study_months: months });
    }
  }, [result, countryId, months]);

  const selectClass =
    "min-h-[48px] touch-manipulation rounded-xl border border-brand-plum/15 bg-brand-cream/30 px-3 py-2 text-base font-medium text-brand-plum w-full";

  return (
    <div className="min-w-0 overflow-x-clip rounded-2xl border border-brand-plum/10 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid min-w-0 gap-6 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-brand-plum">
          Country
          <select
            className={selectClass}
            value={countryId}
            onChange={(e) => {
              markStarted();
              setCountryId(e.target.value);
            }}
            aria-label="Select country"
          >
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-brand-plum">
          City / state / province
          <select
            className={selectClass}
            value={regionId}
            onChange={(e) => {
              markStarted();
              setRegionId(e.target.value);
            }}
            aria-label="Select region"
          >
            {(country?.regions ?? []).map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-brand-plum">
          Study level
          <select
            className={selectClass}
            value={studyLevelId}
            onChange={(e) => {
              markStarted();
              setStudyLevelId(e.target.value);
            }}
          >
            {(country?.studyLevels ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-brand-plum">
          Provider type
          <select
            className={selectClass}
            value={providerTypeId}
            onChange={(e) => {
              markStarted();
              setProviderTypeId(e.target.value);
            }}
          >
            {(country?.providerTypes ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-brand-plum">
          Study duration (months)
          <input
            type="number"
            min={1}
            max={120}
            className={selectClass}
            value={months}
            onChange={(e) => {
              markStarted();
              setMonths(Number(e.target.value));
            }}
          />
        </label>

        <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-brand-plum">
          Expected casual job type
          <select
            className={selectClass}
            value={jobTypeId}
            onChange={(e) => {
              markStarted();
              setJobTypeId(e.target.value);
            }}
          >
            {(country?.jobTypes ?? []).map((j) => (
              <option key={j.id} value={j.id}>
                {j.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {result ? (
        <div className="mt-8 min-w-0 space-y-4 rounded-xl bg-brand-plum/[0.03] p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-rose">Planning estimate results</p>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <ResultRow
              label="Estimated first-year cost"
              value={`~${result.firstYearCostEstimate.toLocaleString()} ${result.country.currency}`}
            />
            <ResultRow
              label="Estimated monthly living cost"
              value={`~${result.monthlyLivingEstimate.toLocaleString()} ${result.country.currency}`}
            />
            <ResultRow label="Rent (monthly share)" value={`~${result.rentMonthlyEstimate.toLocaleString()}`} />
            <ResultRow label="Transport (monthly share)" value={`~${result.transportMonthlyEstimate.toLocaleString()}`} />
            <ResultRow label="Food (monthly share)" value={`~${result.foodMonthlyEstimate.toLocaleString()}`} />
            <ResultRow label="Visa fee (indicative)" value={`~${result.visaFeeEstimate.toLocaleString()}`} />
            <ResultRow label="Health cover (study period)" value={`~${result.healthInsuranceEstimate.toLocaleString()}`} />
            <ResultRow label="Funds / show-money (orientation)" value={`~${result.fundsShowMoneyEstimate.toLocaleString()}`} />
            <ResultRow
              label="Fortnightly income (part-time)"
              value={`~${result.fortnightlyIncomeEstimate.toLocaleString()} (${result.hourlyRange}/hr, ${result.workHoursPerWeek}h/wk)`}
            />
            <ResultRow label="Income vs expenses" value={result.incomeVsExpenseGap} />
          </div>

          <div className="rounded-xl border border-brand-plum/10 bg-white p-4 text-sm text-brand-plum/80">
            <p>
              <strong className="text-brand-plum">Main financial risk:</strong> {result.mainFinancialRisk}
            </p>
            <p className="mt-3">
              <strong className="text-brand-plum">Possible next visa stage:</strong> {result.nextVisaStage}
            </p>
            <p className="mt-3">
              <strong className="text-brand-plum">PR pathway note:</strong> {result.prPathwayNote}
            </p>
            <p className="mt-3">
              <strong className="text-brand-plum">Recommended next step:</strong> {result.recommendedNextStep}
            </p>
          </div>

          <Link
            href="/education-consultation"
            onClick={() =>
              trackEvent("consultation_booking_clicked", {
                cta_id: "student_planner_education_consult",
                cta_location: "student_planner_results",
                destination: "/education-consultation",
              })
            }
            className="btn btn-primary inline-flex min-h-[48px] w-full items-center justify-center rounded-full sm:w-auto"
          >
            Book education consultation
          </Link>
        </div>
      ) : null}

      <p className="mt-6 text-sm leading-relaxed text-brand-plum/70" role="note">
        {disclaimer}
      </p>
    </div>
  );
}

/** @param {{ label: string, value: string }} props */
function ResultRow({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-brand-plum/8 bg-white/80 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-brand-plum/55">{label}</p>
      <p className="mt-1 text-sm font-semibold text-brand-plum">{value}</p>
    </div>
  );
}
