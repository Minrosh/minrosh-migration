"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const AIConciergeLazy = dynamic(() => import("./ai-concierge").then(mod => mod.AIConcierge || mod.default), { 
  ssr: false,
  loading: () => null 
});

const StickyMobileCTA = dynamic(() => import("./sticky-mobile-cta").then(mod => mod.StickyMobileCTA || mod.default), { 
  ssr: false 
});

const ExitIntentPopup = dynamic(() => import("./exit-intent-popup").then(mod => mod.ExitIntentPopup || mod.default), { 
  ssr: false 
});

export function GlobalClientWidgets({ siteData }) {
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [showEngagementWidgets, setShowEngagementWidgets] = useState(false);

  useEffect(() => {
    const stickyTimer = window.setTimeout(() => setShowStickyCta(true), 1200);

    let cancelled = false;
    const idleCb =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(
            () => {
              if (!cancelled) setShowEngagementWidgets(true);
            },
            { timeout: 4000 }
          )
        : null;

    const fallbackTimer =
      idleCb == null
        ? window.setTimeout(() => {
            if (!cancelled) setShowEngagementWidgets(true);
          }, 2600)
        : null;

    return () => {
      cancelled = true;
      window.clearTimeout(stickyTimer);
      if (idleCb != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleCb);
      }
      if (fallbackTimer != null) {
        window.clearTimeout(fallbackTimer);
      }
    };
  }, []);

  return (
    <>
      {showStickyCta ? <StickyMobileCTA /> : null}
      {showEngagementWidgets ? <AIConciergeLazy siteData={siteData} /> : null}
      {showEngagementWidgets ? <ExitIntentPopup /> : null}
    </>
  );
}
