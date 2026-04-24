"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-rose">Predictive route search</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-plum md:text-3xl">
        Ask what you want in {destinationName}
      </h2>
      <p className="mt-2 text-sm text-brand-plum/70 md:text-base">
        Type your goal in plain language and jump directly to the best destination section.
      </p>

      <div className="mt-4">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. fastest PR path, partner proof checklist, student pathway"
          className="w-full rounded-2xl border border-brand-plum/20 bg-white px-4 py-3 text-sm text-brand-plum outline-none transition focus:border-brand-rose focus:ring-2 focus:ring-brand-rose/20"
          aria-label="Search destination routes"
        />
      </div>

      {!normalizedQuery && prompts.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {prompts.slice(0, 4).map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setQuery(prompt)}
              className="rounded-full border border-brand-plum/15 bg-brand-cream/40 px-3 py-1.5 text-xs font-semibold text-brand-plum/80 transition hover:border-brand-rose/40"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {visible.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-brand-plum/10 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-brand-rose/35 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-brand-plum">{item.label}</p>
            <p className="mt-1 text-xs text-brand-plum/65">{intentHints[item.sectionId] || "Open this route"}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
