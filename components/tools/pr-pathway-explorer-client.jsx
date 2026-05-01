"use client";

import { useState } from "react";

const PATHWAYS = {
  "au-student-pr": {
    title: "Australia: study → temporary graduate → skilled (illustrative)",
    steps: [
      { label: "Enrol & comply", detail: "Subclass 500 student visa — genuine student, attendance, work limits." },
      { label: "Graduate work", detail: "Subclass 485 TGV where eligible — check current lists and validity." },
      { label: "Skills assessment & EOI", detail: "Nominated occupation, skills assessment, points-tested or employer pathways." },
      { label: "Invitation & PR visa", detail: "189/190/491 or employer-sponsored PR where criteria met — not automatic." },
    ],
  },
  "au-offshore-skilled": {
    title: "Australia: offshore skilled (illustrative)",
    steps: [
      { label: "Skills & English", detail: "Recognised test and skills assessment for your nominated occupation." },
      { label: "Points / sponsor", detail: "EOI for GSM or secure employer nomination where available." },
      { label: "Invitation", detail: "State/territory or independent invitation subject to caps and policy." },
      { label: "Lodgement", detail: "Permanent or provisional visa per your pathway — evidence heavy." },
    ],
  },
};

/**
 * @param {{ disclaimer: string }} props
 */
export function PrPathwayExplorerClient({ disclaimer }) {
  const [key, setKey] = useState("au-student-pr");
  const pathway = PATHWAYS[key];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setKey("au-student-pr")}
          className={`min-h-[48px] touch-manipulation rounded-full px-5 py-2 text-sm font-bold transition ${
            key === "au-student-pr"
              ? "bg-brand-plum text-white shadow-md"
              : "border border-brand-plum/15 bg-white text-brand-plum hover:border-brand-rose/40"
          }`}
        >
          Study → skilled (AU)
        </button>
        <button
          type="button"
          onClick={() => setKey("au-offshore-skilled")}
          className={`min-h-[48px] touch-manipulation rounded-full px-5 py-2 text-sm font-bold transition ${
            key === "au-offshore-skilled"
              ? "bg-brand-plum text-white shadow-md"
              : "border border-brand-plum/15 bg-white text-brand-plum hover:border-brand-rose/40"
          }`}
        >
          Offshore skilled (AU)
        </button>
      </div>

      <div className="rounded-2xl border border-brand-plum/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-black text-brand-plum">{pathway.title}</h2>
        <ol className="mt-6 space-y-4">
          {pathway.steps.map((step, i) => (
            <li key={step.label} className="flex gap-4">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-rose/15 text-sm font-black text-brand-rose"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div>
                <p className="font-bold text-brand-plum">{step.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-brand-plum/70">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm leading-relaxed text-brand-plum/70" role="note">
          {disclaimer}
        </p>
      </div>
    </div>
  );
}
