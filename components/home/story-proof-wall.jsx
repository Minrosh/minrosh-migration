"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

function visaType(story) {
  const v = (story.visa || "").toLowerCase();
  if (v.includes("partner")) return "Partner";
  if (v.includes("student")) return "Student";
  if (v.includes("employer")) return "Employer";
  if (v.includes("skilled")) return "Skilled";
  return "Other";
}

function monthsFromTimeline(timeline) {
  const match = String(timeline || "").match(/(\d+)\s*month/i);
  return match ? Number(match[1]) : 12;
}

const FILTERS = ["All", "Skilled", "Partner", "Student", "Employer"];

export function StoryProofWall({ stories = [] }) {
  const [filter, setFilter] = useState("All");
  const [speed, setSpeed] = useState("Any");

  const filtered = useMemo(() => {
    return stories.filter((story) => {
      const type = visaType(story);
      const months = monthsFromTimeline(story.timeline);
      const filterOk = filter === "All" ? true : type === filter;
      const speedOk =
        speed === "Any" ? true : speed === "Fast (<=8 months)" ? months <= 8 : speed === "Mid (9-14 months)" ? months >= 9 && months <= 14 : months > 14;
      return filterOk && speedOk;
    });
  }, [stories, filter, speed]);

  if (!stories.length) return null;

  return (
    <section className="mt-8 rounded-[2rem] border border-brand-plum/10 bg-white/90 p-6 shadow-lux md:p-8">
      <div className="mb-5 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-rose">Social proof</p>
        <h3 className="text-2xl font-semibold tracking-tight text-brand-plum">Explore outcomes by profile type</h3>
        <p className="text-sm text-brand-plum/65">Filter stories by pathway and timeline to reduce ambiguity and help users self-identify faster.</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
              filter === item ? "border-brand-rose bg-brand-rose text-white" : "border-brand-plum/15 bg-white text-brand-plum/80"
            }`}
          >
            {item}
          </button>
        ))}

        <select
          aria-label="Filter by timeline speed"
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
          className="ml-auto rounded-full border border-brand-plum/20 bg-white px-4 py-1.5 text-sm font-semibold text-brand-plum outline-none"
        >
          <option>Any</option>
          <option>Fast (&lt;=8 months)</option>
          <option>Mid (9-14 months)</option>
          <option>Long (15+ months)</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {filtered.map((story, idx) => (
          <motion.article
            key={`${story.name}-${story.visa}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: idx * 0.04 }}
            className="rounded-2xl border border-brand-plum/10 bg-gradient-to-b from-white to-brand-cream/30 p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-brand-plum/10 px-3 py-1 text-xs font-semibold text-brand-plum">{visaType(story)}</span>
              <span className="text-xs font-semibold text-brand-rose">{story.timeline}</span>
            </div>
            <h4 className="text-lg font-semibold text-brand-plum">{story.name}</h4>
            <p className="mt-1 text-sm text-brand-plum/55">{story.location}</p>
            <p className="mt-3 text-sm leading-relaxed text-brand-plum/75">“{story.quote}”</p>
            <p className="mt-3 text-sm font-medium text-brand-rose">{story.outcome}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
