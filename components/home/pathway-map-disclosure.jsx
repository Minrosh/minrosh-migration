"use client";

import { useCallback, useState } from "react";
import { PathwayMapPanel } from "./pathway-map-panel";

/**
 * Keeps the heavy map + controls off the first paint until the visitor opts in,
 * while preserving the full {@link PathwayMapPanel} once opened.
 */
export function PathwayMapDisclosure() {
  const [mounted, setMounted] = useState(false);

  const onToggle = useCallback((event) => {
    const el = event.currentTarget;
    if (el instanceof HTMLDetailsElement) {
      setMounted(el.open);
    }
  }, []);

  return (
    <details className="pathway-map-disclosure rounded-[2rem] border border-brand-plum/10 bg-white/90 shadow-inner" onToggle={onToggle}>
      <summary className="cursor-pointer list-none px-5 py-4 pr-10 text-left marker:content-[''] sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
        <div className="flex max-w-4xl flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <p className="text-base font-extrabold text-brand-plum sm:text-lg">Global pathway map (guided mode)</p>
          <p className="text-sm font-medium text-brand-plum/65">
            Start simple: choose your origin and destination, then open detailed strategy only if needed.
          </p>
        </div>
      </summary>
      <div className="border-t border-brand-plum/10 px-4 py-3 sm:px-6">
        <div className="mb-3 grid gap-2 text-sm text-brand-plum/70 sm:grid-cols-3">
          <p className="rounded-xl bg-brand-cream/70 px-3 py-2"><strong>Step 1:</strong> Pick your start city.</p>
          <p className="rounded-xl bg-brand-cream/70 px-3 py-2"><strong>Step 2:</strong> Pick your goal in Australia.</p>
          <p className="rounded-xl bg-brand-cream/70 px-3 py-2"><strong>Step 3:</strong> Review next action card.</p>
        </div>
        {mounted ? <PathwayMapPanel /> : null}
      </div>
    </details>
  );
}
