"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const AIConcierge = dynamic(
  () => import("./ai-concierge").then((m) => ({ default: m.AIConcierge })),
  { ssr: false, loading: () => null }
);

export function AIConciergeLazy({ siteData }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <AIConcierge siteData={siteData} />;
}
