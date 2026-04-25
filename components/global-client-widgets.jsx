"use client";

import dynamic from "next/dynamic";

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
  return (
    <>
      <AIConciergeLazy siteData={siteData} />
      <StickyMobileCTA />
      <ExitIntentPopup />
    </>
  );
}
