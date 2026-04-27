"use client";

import dynamic from "next/dynamic";

const GlobalClientWidgets = dynamic(() => import("./global-client-widgets").then(mod => mod.GlobalClientWidgets), { ssr: false });
const UltraMaximumEffects = dynamic(
  () => import("./ultra-maximum-effects").then((mod) => mod.UltraMaximumEffects),
  { ssr: false, loading: () => null }
);

export function UltraMaximumLayout({ children, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <UltraMaximumEffects />
      {children}
    </div>
  );
}
