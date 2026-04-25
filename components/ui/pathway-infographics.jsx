"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useMemo, useRef } from "react";

function clampScore(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 40;
  return Math.max(12, Math.min(98, n));
}

export function PathwayInfographics({ sections = [] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduce = useReducedMotion();

  const metrics = useMemo(() => {
    const totalPossible = Math.max(3, sections.length);
    const score = Math.min(totalPossible, sections.length);
    
    return [
      { 
        label: "Document Prep", 
        value: `${score}/${totalPossible}`,
        percent: (score / totalPossible) * 100,
        tip: "Estimate of documentation volume addressed in this guide." 
      },
      { 
        label: "Strategic Coverage", 
        value: `${score}/${totalPossible}`,
        percent: (score / totalPossible) * 100,
        tip: "Depth of strategic scenarios covered in these sections." 
      }
    ];
  }, [sections.length]);

  return (
    <section ref={ref} className="pathway-infographics bento-hover" aria-label="Strategy preparation indicators">
      <div className="flex justify-between items-center mb-6">
        <h3 className="!mb-0 text-brand-plum">Preparation Indicators</h3>
        <span className="text-[10px] uppercase tracking-widest text-brand-plum/40 font-bold italic">Estimated from content depth</span>
      </div>
      
      <div className="pathway-infographics__grid">
        {metrics.map((m, idx) => (
          <article key={m.label} className="pathway-infographics__metric group relative" title={m.tip}>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-black text-brand-plum/70">{m.label}</p>
              <strong className="text-xs font-black text-brand-rose">{m.value}</strong>
            </div>
            <div className="pathway-infographics__track bg-brand-plum/5 h-1.5 rounded-full overflow-hidden" aria-hidden>
              <motion.span
                className="pathway-infographics__fill bg-brand-rose block h-full"
                initial={reduce ? { width: `${m.percent}%` } : { width: 0 }}
                animate={inView ? { width: `${m.percent}%` } : undefined}
                transition={{ duration: 1, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
