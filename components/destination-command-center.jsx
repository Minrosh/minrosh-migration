"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

function clamp(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

export function DestinationCommandCenter({ slug, destinationName, intents = [] }) {
  const safeIntents = useMemo(
    () => (Array.isArray(intents) ? intents.filter((item) => item?.id) : []),
    [intents]
  );
  const [activeId, setActiveId] = useState(safeIntents[0]?.id ?? null);
  const activeIntent = safeIntents.find((item) => item.id === activeId) ?? safeIntents[0] ?? null;

  if (!activeIntent) return null;

  const routeHref = `/destinations/${slug}/${activeIntent.recommendedSection}`;
  const certainty = clamp(activeIntent.confidence);

  return (
    <section className="mt-8 rounded-[1.75rem] border border-brand-plum/10 bg-white/90 p-5 shadow-lux backdrop-blur-sm md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-rose">
            Migration command center
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-plum md:text-3xl">
            Pick your intent, get your best route
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-brand-plum/70 md:text-base">
            This is your strategy cockpit for {destinationName}. Select the outcome you care about
            most, then follow the recommended next section with a confidence-weighted plan.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {safeIntents.map((intent) => {
          const selected = intent.id === activeIntent.id;
          return (
            <button
              key={intent.id}
              type="button"
              onClick={() => setActiveId(intent.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                selected
                  ? "border-brand-plum bg-brand-plum text-white"
                  : "border-brand-plum/20 bg-white text-brand-plum/80 hover:border-brand-plum/45"
              }`}
              aria-pressed={selected}
            >
              {intent.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeIntent.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-5 grid gap-4 md:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="rounded-2xl border border-brand-plum/10 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-brand-plum/60">Chosen trajectory</p>
            <p className="mt-2 text-lg font-semibold text-brand-plum">{activeIntent.tagline}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-brand-cream/60 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-brand-plum/55">Estimated horizon</p>
                <p className="mt-1 text-lg font-semibold text-brand-plum">{activeIntent.timeHorizon}</p>
              </div>
              <div className="rounded-xl bg-brand-cream/60 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-brand-plum/55">Route confidence</p>
                <p className="mt-1 text-lg font-semibold text-brand-plum">{certainty}/100</p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-brand-plum/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-rose to-brand-plum"
                initial={{ width: 0 }}
                animate={{ width: `${certainty}%` }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
            </div>

            <ul className="mt-4 space-y-2 text-sm text-brand-plum/80">
              {(activeIntent.why ?? []).map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-rose" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-brand-plum/10 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-brand-plum/60">Momentum milestones</p>
            <ol className="mt-3 space-y-2 text-sm text-brand-plum/80">
              {(activeIntent.milestones ?? []).map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-cream text-xs font-semibold text-brand-plum">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <Link
              href={routeHref}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-brand-plum px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Open recommended route
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
