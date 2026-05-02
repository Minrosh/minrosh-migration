"use client";

import { useMemo, useState } from "react";
import { estimateStudentStudyCosts } from "../../lib/student-planner";

/**
 * @param {{ disclaimer: string, defaultCountryId?: string }} props
 */
export function StudentCountryCostPlannerClient({ disclaimer, defaultCountryId = "australia" }) {
  const [countryId, setCountryId] = useState(defaultCountryId);
  const [months, setMonths] = useState(12);

  const result = useMemo(() => {
    try {
      return estimateStudentStudyCosts(countryId, months);
    } catch {
      return null;
    }
  }, [countryId, months]);

  return (
    <div className="rounded-2xl border border-brand-plum/10 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-brand-plum">
          Country focus
          <select
            className="min-h-[48px] touch-manipulation rounded-xl border border-brand-plum/15 bg-brand-cream/30 px-3 py-2 text-base font-medium text-brand-plum"
            value={countryId}
            onChange={(e) => setCountryId(e.target.value)}
            aria-label="Select country for cost estimate"
          >
            <option value="australia">Australia</option>
            <option value="canada">Canada</option>
            <option value="united-kingdom">United Kingdom</option>
            <option value="new-zealand">New Zealand</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-brand-plum">
          Study duration (months)
          <input
            type="number"
            min={1}
            max={120}
            className="min-h-[48px] touch-manipulation rounded-xl border border-brand-plum/15 bg-brand-cream/30 px-3 py-2 text-base font-medium text-brand-plum"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            aria-label="Study duration in months"
          />
        </label>
      </div>

      {result ? (
        <div className="mt-8 space-y-4 rounded-xl bg-brand-plum/[0.03] p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-rose">Indicative totals</p>
          <p className="text-sm text-brand-plum/70">
            Tuition band ({result.studyMonths} months, {result.country.currency}):{" "}
            <strong className="text-brand-plum">
              {result.tuitionLow.toLocaleString()} – {result.tuitionHigh.toLocaleString()}
            </strong>
          </p>
          <p className="text-sm text-brand-plum/70">
            Living costs (same window):{" "}
            <strong className="text-brand-plum">
              {result.livingLow.toLocaleString()} – {result.livingHigh.toLocaleString()}
            </strong>
          </p>
          <p className="text-lg font-black text-brand-plum">
            Combined orientation range: {result.totalLow.toLocaleString()} – {result.totalHigh.toLocaleString()}{" "}
            {result.country.currency}
          </p>
          <p className="text-sm leading-relaxed text-brand-plum/80">{result.country.officialNote}</p>
        </div>
      ) : null}

      <p className="mt-6 text-sm leading-relaxed text-brand-plum/70" role="note">
        {disclaimer}
      </p>
    </div>
  );
}
