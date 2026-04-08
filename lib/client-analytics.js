"use client";

function safeString(value) {
  return typeof value === "string" ? value.slice(0, 120) : undefined;
}

export function trackEvent(eventName, params = {}) {
  if (typeof window === "undefined") return;
  const normalizedName = safeString(eventName);
  if (!normalizedName) return;

  const payload = {
    ...params,
    page_path: params.page_path || window.location.pathname,
  };

  if (typeof window.minroshTrack === "function") {
    window.minroshTrack(normalizedName, payload);
    return;
  }
  if (typeof window.gtag === "function") {
    window.gtag("event", normalizedName, payload);
  }
}
