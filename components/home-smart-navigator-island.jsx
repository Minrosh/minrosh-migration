"use client";

import dynamic from "next/dynamic";

const SmartNavigator = dynamic(
  () => import("./smart-navigator").then((m) => ({ default: m.SmartNavigator })),
  { ssr: false, loading: () => null }
);

export function HomeSmartNavigatorIsland() {
  return <SmartNavigator />;
}
