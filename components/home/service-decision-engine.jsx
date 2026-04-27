"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

const INTENTS = [
  { id: "fast", label: "Fastest clear next step" },
  { id: "family", label: "Family / partner priority" },
  { id: "study", label: "Study-first pathway" },
  { id: "cost", label: "Cost-aware planning" },
];

const INTENT_PLAYBOOK = {
  fast: {
    urgency: "High momentum lane",
    firstStep: "Open your top match and lock the first 14-day action list.",
    progressStart: 62,
  },
  family: {
    urgency: "Evidence-sensitive lane",
    firstStep: "Prioritize relationship timeline and consistency checks.",
    progressStart: 58,
  },
  study: {
    urgency: "Pathway optionality lane",
    firstStep: "Choose a course path with long-term migration flexibility.",
    progressStart: 60,
  },
  cost: {
    urgency: "Efficiency lane",
    firstStep: "Start with official-source checks before paid commitments.",
    progressStart: 65,
  },
};

function scoreService(service, intent) {
  const text = `${service.title} ${service.summary} ${service.highlights.join(" ")}`.toLowerCase();
  if (intent === "family") return /partner|family/.test(text) ? 4 : /visitor/.test(text) ? 2 : 1;
  if (intent === "study") return /student|study|education/.test(text) ? 4 : /skilled/.test(text) ? 2 : 1;
  if (intent === "cost") return /visitor|official|list|sources/.test(text) ? 4 : /student|partner/.test(text) ? 2 : 1;
  return /skilled|employer|official/.test(text) ? 4 : 2;
}

export function ServiceDecisionEngine({ services = [] }) {
  const [intent, setIntent] = useState(INTENTS[0].id);
  const [showAll, setShowAll] = useState(false);

  const ranked = useMemo(() => {
    return [...services]
      .map((service) => ({ service, score: scoreService(service, intent) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [services, intent]);
  const playbook = INTENT_PLAYBOOK[intent] ?? INTENT_PLAYBOOK.fast;

  if (!services.length) return null;

  return (
    <section className="mt-8 rounded-[2rem] border border-brand-plum/10 bg-white/90 p-6 shadow-lux md:p-8">
      <div className="mb-5 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-rose">Decision engine</p>
        <h3 className="text-2xl font-semibold tracking-tight text-brand-plum">Find the right service in one step</h3>
        <p className="text-sm text-brand-plum/65">
          Progressive disclosure: pick your intent, then we prioritize the most relevant pathways instantly.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {INTENTS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIntent(item.id)}
            className={`min-h-[48px] rounded-full border px-4 py-2 text-sm font-semibold transition ${
              intent === item.id
                ? "border-brand-rose bg-brand-rose text-white"
                : "border-brand-plum/15 bg-white text-brand-plum/80 hover:border-brand-rose/40"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-brand-plum/10 bg-brand-cream/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-plum/60">Decision momentum</p>
          <span className="rounded-full bg-brand-plum px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
            {playbook.urgency}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-plum/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-rose to-brand-gold"
            initial={{ width: 0 }}
            animate={{ width: `${playbook.progressStart}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
        <p className="mt-2 text-xs text-brand-plum/70">
          Endowed progress starts at {playbook.progressStart}% once you choose a lane.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {ranked.map(({ service, score }, index) => (
          <motion.article
            key={service.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="rounded-2xl border border-brand-plum/10 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-brand-rose/10 px-3 py-1 text-xs font-semibold text-brand-rose">
                Match score {score}/4
              </span>
              {index === 0 ? (
                <span className="rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-semibold text-brand-plum">Top match</span>
              ) : null}
            </div>
            <h4 className="text-lg font-semibold text-brand-plum">{service.title}</h4>
            <p className="mt-2 text-sm text-brand-plum/65">{service.summary}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-brand-plum/75">
              {service.highlights.slice(0, 2).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <Link
              href={service.href}
              className="mt-4 inline-flex min-h-[48px] items-center text-sm font-semibold text-brand-rose hover:underline"
            >
              Open pathway →
            </Link>
            {index === 0 ? (
              <p className="mt-2 text-xs font-medium text-brand-plum/70">
                Next action: {playbook.firstStep}
              </p>
            ) : null}
          </motion.article>
        ))}
      </div>

      <div className="mt-6 border-t border-brand-plum/10 pt-5">
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="inline-flex min-h-[48px] items-center text-sm font-semibold text-brand-rose hover:underline"
        >
          {showAll ? "Hide full service catalogue" : "Show full service catalogue"}
        </button>
        {showAll ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {services.map((service) => (
              <Link
                key={`all-${service.title}`}
                href={service.href}
                className="rounded-2xl border border-brand-plum/10 bg-white px-4 py-3 text-sm text-brand-plum/80 transition hover:border-brand-rose/40"
              >
                <strong className="block text-brand-plum">{service.title}</strong>
                <span className="mt-1 block line-clamp-2">{service.summary}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
