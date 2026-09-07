"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { DEFAULT_COMPLIANCE } from "@/lib/compliance";

/**
 * Destination Information Hub — topic navigation to general public information.
 * No confidence scores, recommendations, eligibility conclusions, or outcome predictions.
 */
export function DestinationCommandCenter({ slug, destinationName, intents = [], topics }) {
  const safeTopics = useMemo(() => {
    if (Array.isArray(topics) && topics.length) {
      return topics.filter((item) => item?.id);
    }
    // Legacy intents shape → map to neutral topics without confidence/horizon
    return (Array.isArray(intents) ? intents : [])
      .filter((item) => item?.id)
      .map((item) => ({
        id: item.id,
        label: item.label,
        summary: item.tagline || item.summary || "General information topic for this destination.",
        section: item.recommendedSection || item.section || "updates",
        points: Array.isArray(item.why) ? item.why : item.points || [],
        officialLinks: item.officialLinks || [],
      }));
  }, [intents, topics]);

  const [activeId, setActiveId] = useState(safeTopics[0]?.id ?? null);
  const activeTopic = safeTopics.find((item) => item.id === activeId) ?? safeTopics[0] ?? null;

  if (!activeTopic) return null;

  const routeHref = `/destinations/${slug}/${activeTopic.section}`;

  return (
    <section
      className="mt-8 rounded-[1.75rem] border border-brand-plum/10 bg-white/90 p-5 shadow-lux backdrop-blur-sm md:p-8"
      aria-labelledby="destination-information-hub-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-rose">
            Destination Information Hub
          </p>
          <h2
            id="destination-information-hub-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-brand-plum md:text-3xl"
          >
            Explore public information for {destinationName}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-brand-plum/70 md:text-base">
            Choose a broad topic to read general summaries and official links. This hub does not assess
            eligibility, recommend a visa, or provide immigration assistance.
          </p>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-brand-plum/60">
            {DEFAULT_COMPLIANCE.categoryPageBanner}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {safeTopics.map((topic) => {
          const selected = topic.id === activeTopic.id;
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => setActiveId(topic.id)}
              className={`min-h-[48px] touch-manipulation rounded-full border px-4 py-2 text-sm font-semibold transition ${
                selected
                  ? "border-brand-plum bg-brand-plum text-white"
                  : "border-brand-plum/20 bg-white text-brand-plum/80 hover:border-brand-plum/45"
              }`}
              aria-pressed={selected}
            >
              {topic.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTopic.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-5 grid gap-4 md:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="rounded-2xl border border-brand-plum/10 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-brand-plum/60">Selected topic</p>
            <p className="mt-2 text-lg font-semibold text-brand-plum">{activeTopic.summary}</p>
            <ul className="mt-4 space-y-2 text-sm text-brand-plum/80">
              {(activeTopic.points ?? []).map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-rose" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-brand-plum/10 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-brand-plum/60">Official / institutional links</p>
            <ul className="mt-3 space-y-2 text-sm">
              {(activeTopic.officialLinks ?? []).length ? (
                activeTopic.officialLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-brand-rose underline-offset-2 hover:underline"
                    >
                      {link.name}
                    </a>
                  </li>
                ))
              ) : (
                <li className="text-brand-plum/70">Open the destination section for MinRosh summaries and source links.</li>
              )}
            </ul>

            <Link
              href={routeHref}
              className="mt-5 inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-full bg-brand-plum px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
            >
              View information section
            </Link>
            <p className="mt-3 text-xs text-brand-plum/60">{DEFAULT_COMPLIANCE.categoryPageFooter}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
