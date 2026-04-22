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
    const count = sections.length || 1;
    return [
      { label: "Pathway readiness", value: clampScore(52 + count * 4) },
      { label: "Documentation clarity", value: clampScore(46 + count * 5) },
      { label: "Strategic confidence", value: clampScore(44 + count * 6) },
    ];
  }, [sections.length]);

  return (
    <section ref={ref} className="pathway-infographics bento-hover" aria-label="Visual migration strategy indicators">
      <h3>Strategy indicators</h3>
      <div className="pathway-infographics__grid">
        {metrics.map((m, idx) => (
          <article key={m.label} className="pathway-infographics__metric">
            <p>{m.label}</p>
            <div className="pathway-infographics__track" aria-hidden>
              <motion.span
                className="pathway-infographics__fill"
                initial={reduce ? { width: `${m.value}%` } : { width: 0 }}
                animate={inView ? { width: `${m.value}%` } : undefined}
                transition={{ duration: 1, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <strong>{m.value}%</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
