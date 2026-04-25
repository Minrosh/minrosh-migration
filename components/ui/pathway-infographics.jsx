"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useMemo, useRef } from "react";

function labelForPercent(value) {
  if (value >= 78) return "High";
  if (value >= 58) return "Medium";
  return "Early";
}

export function PathwayInfographics({ sections = [] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduce = useReducedMotion();

  const metrics = useMemo(() => {
    const totalPossible = Math.max(3, sections.length);
    const score = Math.min(totalPossible, sections.length);
    const percent = (score / totalPossible) * 100;

    return [
      {
        label: "Document prep",
        value: labelForPercent(percent),
        percent,
        tip: "Indicative preparation signal based on the guide sections shown here.",
      },
      {
        label: "Strategic coverage",
        value: labelForPercent(percent),
        percent,
        tip: "Indicative planning signal based on the scenarios covered here.",
      },
    ];
  }, [sections.length]);

  return (
    <section ref={ref} className="pathway-infographics bento-hover" aria-label="Strategy preparation indicators">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="!mb-0 text-brand-plum">Preparation Indicators</h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-plum/40">
          Planning prompts
        </span>
      </div>

      <div className="pathway-infographics__grid">
        {metrics.map((m, idx) => (
          <article key={m.label} className="pathway-infographics__metric group relative" title={m.tip}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-black text-brand-plum/70">{m.label}</p>
              <strong className="text-xs font-black text-brand-rose">{m.value}</strong>
            </div>
            <div className="pathway-infographics__track h-1.5 overflow-hidden rounded-full bg-brand-plum/5" aria-hidden>
              <motion.span
                className="pathway-infographics__fill block h-full bg-brand-rose"
                initial={reduce ? { width: `${m.percent}%` } : { width: 0 }}
                animate={inView ? { width: `${m.percent}%` } : undefined}
                transition={{ duration: 1, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-600">
        These indicators are planning prompts only, not official eligibility scores.
      </p>
    </section>
  );
}
