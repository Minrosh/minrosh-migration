"use client";

import dynamic from "next/dynamic";

const AIConcierge = dynamic(
  () => import("./ai-concierge").then((m) => ({ default: m.AIConcierge })),
  { ssr: false, loading: () => null }
);

export function AIConciergeLazy({ siteData }) {
  return <AIConcierge siteData={siteData} />;
}
