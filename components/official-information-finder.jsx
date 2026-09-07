"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { INFORMATION_FINDER_TOPICS } from "@/lib/official-information-finder";
import { DEFAULT_COMPLIANCE } from "@/lib/compliance";
import { trackEvent } from "@/lib/client-analytics";

/**
 * Non-personalised Official Information Finder.
 * Topic selection only — no eligibility, confidence, ranking, or pathway recommendation.
 */
export function OfficialInformationFinder({ notice } = {}) {
  const intro = notice || DEFAULT_COMPLIANCE.aiInformationFinderNotice;
  const [topicId, setTopicId] = useState("");
  const topic = useMemo(
    () => INFORMATION_FINDER_TOPICS.find((t) => t.id === topicId) || null,
    [topicId]
  );

  function onSelectTopic(id) {
    setTopicId(id);
    try {
      trackEvent("information_finder_started", { topic_id: id });
      trackEvent("information_topic_selected", { topic_id: id });
      if (id) trackEvent("information_results_viewed", { topic_id: id });
    } catch {
      /* analytics optional */
    }
  }

  function onOpenLink(url, topicKey) {
    try {
      trackEvent("official_link_opened", { topic_id: topicKey, url });
    } catch {
      /* analytics optional */
    }
  }

  return (
    <section
      className="rounded-[2rem] border border-brand-plum/15 bg-white/80 p-6 shadow-sm sm:p-8"
      aria-labelledby="information-finder-heading"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-plum/70">
        Official Information Finder
      </p>
      <h2 id="information-finder-heading" className="mt-2 text-2xl font-bold text-brand-plum">
        Explore public information by topic
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-plum/80 sm:text-base">{intro}</p>

      <label className="mt-6 block text-sm font-semibold text-brand-plum" htmlFor="information-topic">
        Choose a broad topic
      </label>
      <select
        id="information-topic"
        className="mt-2 w-full max-w-xl rounded-xl border border-brand-plum/20 bg-white px-4 py-3 text-brand-plum"
        value={topicId}
        onChange={(e) => onSelectTopic(e.target.value)}
      >
        <option value="">Select a topic…</option>
        {INFORMATION_FINDER_TOPICS.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      {topic ? (
        <div className="mt-8" aria-live="polite">
          <h3 className="text-lg font-bold text-brand-plum">Public information you may wish to read</h3>
          <p className="mt-2 text-sm text-brand-plum/75">{topic.summary}</p>
          <ul className="mt-4 space-y-3">
            {topic.sources.map((source) => (
              <li
                key={`${topic.id}-${source.url}`}
                className="rounded-2xl border border-brand-plum/10 bg-brand-cream/40 px-4 py-3"
              >
                <p className="font-semibold text-brand-plum">
                  {source.name}
                  {source.isOfficial === false ? (
                    <span className="ml-2 text-xs font-medium text-brand-plum/60">(MinRosh summary)</span>
                  ) : (
                    <span className="ml-2 text-xs font-medium text-brand-plum/60">(Official / institutional)</span>
                  )}
                </p>
                <p className="mt-1 text-xs text-brand-plum/60">Last checked: {source.lastChecked}</p>
                <p className="mt-1 text-xs text-brand-plum/60">
                  Always verify the current official information before acting.
                </p>
                {source.url.startsWith("http") ? (
                  <a
                    className="mt-2 inline-flex text-sm font-semibold text-brand-rose underline-offset-2 hover:underline"
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => onOpenLink(source.url, topic.id)}
                  >
                    View official source
                  </a>
                ) : (
                  <Link
                    className="mt-2 inline-flex text-sm font-semibold text-brand-rose underline-offset-2 hover:underline"
                    href={source.url}
                    onClick={() => onOpenLink(source.url, topic.id)}
                  >
                    View information page
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
