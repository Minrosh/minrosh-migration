"use client";

import dynamic from "next/dynamic";

const GlobalClientWidgets = dynamic(
  () => import("./global-client-widgets").then((mod) => mod.GlobalClientWidgets),
  { ssr: false, loading: () => null }
);

export function GlobalClientWidgetsLazy(props) {
  return <GlobalClientWidgets {...props} />;
}
