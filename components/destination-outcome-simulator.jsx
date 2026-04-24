"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function clampScore(score) {
  return Math.max(0, Math.min(100, Number(score) || 0));
}

export function DestinationOutcomeSimulator({ destinationName, sectionLabel, scenarios = [] }) {
  const safeScenarios = useMemo(
    () => (Array.isArray(scenarios) ? scenarios.filter((item) => item && item.id) : []),
    [scenarios]
  );
  const [activeId, setActiveId] = useState(safeScenarios[0]?.id ?? null);
  const activeScenario =
    safeScenarios.find((item) => item.id === activeId) ?? safeScenarios[0] ?? null;

  if (!activeScenario) return null;

  const confidence = clampScore(activeScenario.confidenceScore);
  const progress = Math.min(100, confidence + 20);

  return (
    <section className="mt-8 rounded-3xl border border-brand-plum/10 bg-white/85 p-5 shadow-lux backdrop-blur-sm md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-rose">
            Outcome simulator
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-plum md:text-3xl">
            {destinationName} {sectionLabel} experience forecast
          </h2>
          <p className="mt-2 text-sm text-brand-plum/70 md:text-base">
            Pick a profile to preview timeline confidence, likely friction points, and the next
            best action.
          </p>
        </div>
        <div className="min-w-[200px] rounded-2xl border border-brand-plum/10 bg-brand-cream/60 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.15em] text-brand-plum/60">Endowed progress</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-plum/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-rose to-brand-plum"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-sm font-medium text-brand-plum/80">{progress}% journey momentum</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {safeScenarios.map((scenario) => {
          const selected = scenario.id === activeScenario.id;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => setActiveId(scenario.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                selected
                  ? "border-brand-plum bg-brand-plum text-white"
                  : "border-brand-plum/20 bg-white text-brand-plum/80 hover:border-brand-plum/45"
              }`}
              aria-pressed={selected}
            >
              {scenario.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeScenario.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="rounded-2xl border border-brand-plum/10 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-brand-plum/60">Profile snapshot</p>
            <p className="mt-2 text-sm text-brand-plum/80">{activeScenario.persona}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-brand-cream/55 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-brand-plum/55">
                  Timeline window
                </p>
                <p className="mt-1 text-xl font-semibold text-brand-plum">
                  {activeScenario.timelineMonths} months
                </p>
              </div>
              <div className="rounded-xl bg-brand-cream/55 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-brand-plum/55">Confidence</p>
                <p className="mt-1 text-xl font-semibold text-brand-plum">{confidence}/100</p>
              </div>
            </div>

            {activeScenario.wins?.length ? (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.14em] text-brand-plum/60">What improves fast</p>
                <ul className="mt-2 space-y-1.5 text-sm text-brand-plum/80">
                  {activeScenario.wins.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-rose" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-brand-plum/10 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-plum/60">Risk signals</p>
            <ul className="mt-2 space-y-1.5 text-sm text-brand-plum/80">
              {(activeScenario.riskSignals ?? []).map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl border border-brand-rose/25 bg-brand-rose/10 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-brand-plum/60">Next best action</p>
              <p className="mt-1 text-sm font-medium text-brand-plum">{activeScenario.nextAction}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
