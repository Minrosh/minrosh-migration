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
    <details
      className="pathway-map-disclosure rounded-[2rem] border border-brand-plum/10 bg-white/90 shadow-inner"
      onToggle={onToggle}
    >
      <summary className="cursor-pointer list-none px-5 py-4 pr-10 text-left marker:content-[''] sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
        <div className="flex max-w-4xl flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <p className="text-base font-extrabold text-brand-plum sm:text-lg">Explore the global pathway map</p>
          <p className="text-sm font-medium text-brand-plum/65">
            Optional · tap to open origins, study goals, and map preview
          </p>
        </div>
      </summary>
      <div className="border-t border-brand-plum/10 px-2 pb-2 sm:px-4 sm:pb-4">{mounted ? <PathwayMapPanel /> : null}</div>
    </details>
  );
}
