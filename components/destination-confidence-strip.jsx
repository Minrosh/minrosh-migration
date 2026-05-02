"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function clamp(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

export function DestinationConfidenceStrip({ title, summary, metrics = [], proof = [], nextMilestones = [] }) {
  const [showPlan, setShowPlan] = useState(false);
  const safeMetrics = useMemo(() => metrics.filter((item) => item?.id && item?.label), [metrics]);

  return (
    <section className="mt-8 rounded-[1.75rem] border border-brand-plum/10 bg-white/90 p-5 shadow-lux backdrop-blur-sm md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-rose">Decision confidence</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-plum md:text-3xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-brand-plum/70 md:text-base">{summary}</p>
        </div>
        <button
          type="button"
          className="min-h-[48px] touch-manipulation rounded-full border border-brand-plum/20 px-4 py-2 text-sm font-semibold text-brand-plum transition hover:border-brand-plum/45"
          onClick={() => setShowPlan((current) => !current)}
          aria-expanded={showPlan}
        >
          {showPlan ? "Hide next 3 moves" : "Show next 3 moves"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {safeMetrics.map((metric) => {
          const score = clamp(metric.value);
          return (
            <div key={metric.id} className="rounded-2xl border border-brand-plum/10 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-brand-plum/60">{metric.label}</p>
              <p className="mt-1 text-lg font-semibold text-brand-plum">{score}/100</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-plum/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand-rose to-brand-plum"
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {proof.map((item) => (
          <span
            key={item}
            className="rounded-full border border-brand-plum/10 bg-brand-cream/60 px-3 py-1 text-xs font-semibold text-brand-plum/80"
          >
            {item}
          </span>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {showPlan ? (
          <motion.ol
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 overflow-hidden text-sm text-brand-plum/80"
          >
            {nextMilestones.map((step, index) => (
              <li key={step} className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-cream text-xs font-semibold text-brand-plum">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </motion.ol>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
