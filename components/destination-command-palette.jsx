"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DEFAULT_COMPLIANCE } from "@/lib/compliance";

function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function DestinationCommandPalette({ destinationName, links = [], prompts = [], intentHints = {} }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query);

  const scored = useMemo(() => {
    const terms = normalizedQuery.split(" ").filter(Boolean);
    return links
      .map((link) => {
        const haystack = normalize(`${link.label} ${intentHints[link.sectionId] || ""}`);
        const score = terms.reduce((acc, term) => acc + (haystack.includes(term) ? 1 : 0), 0);
        return { ...link, score };
      })
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  }, [links, normalizedQuery, intentHints]);

  const visible = normalizedQuery ? scored.filter((item) => item.score > 0).slice(0, 6) : scored.slice(0, 6);

  return (
    <section className="mt-8 rounded-[1.75rem] border border-brand-plum/10 bg-white/90 p-5 shadow-lux backdrop-blur-sm md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-rose">Section finder</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-plum md:text-3xl">
        Find {destinationName} information sections
      </h2>
      <p className="mt-2 text-sm text-brand-plum/70 md:text-base">
        Type a topic keyword to jump to a general information section. This is not an eligibility assessment or visa recommendation.
      </p>
      <p className="mt-2 text-xs text-brand-plum/60">{DEFAULT_COMPLIANCE.shortDisclaimer}</p>

      <label className="mt-5 block text-sm font-semibold text-brand-plum" htmlFor={`dest-section-search-${destinationName}`}>
        Search sections
      </label>
      <input
        id={`dest-section-search-${destinationName}`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. student, partner, skilled"
        className="mt-2 w-full rounded-xl border border-brand-plum/20 bg-white px-4 py-3 text-brand-plum"
      />

      {prompts?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {prompts.slice(0, 4).map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="rounded-full border border-brand-plum/15 px-3 py-1 text-xs font-semibold text-brand-plum/70"
              onClick={() => setQuery(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <ul className="mt-4 space-y-2">
        {visible.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="font-semibold text-brand-rose underline-offset-2 hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
