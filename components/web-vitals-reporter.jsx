"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Sends Core Web Vitals to GA4 when gtag is available (see GoogleAnalytics).
 * Falls back to console in development for local profiling.
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const value =
      metric.name === "CLS" ? Math.round(metric.value * 1000) : Math.round(metric.value);

    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", metric.name, {
        value,
        event_label: metric.id,
        non_interaction: true,
      });
      return;
    }

    if (process.env.NODE_ENV === "development") {
      console.info("[web-vitals]", metric.name, value, metric.rating);
    }
  });

  return null;
}
