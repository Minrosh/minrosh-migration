"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const GlobalClientWidgets = dynamic(
  () => import("./global-client-widgets").then((mod) => mod.GlobalClientWidgets),
  { ssr: false, loading: () => null }
);

export function GlobalClientWidgetsLazy(props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = () => setReady(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 1500);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready) return null;
  return <GlobalClientWidgets {...props} />;
}
