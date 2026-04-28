"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const params = new URLSearchParams(window.location.search);
    const swMode = params.get("sw");
    const shouldDisable = swMode === "off";
    const shouldReset = swMode === "reset";

    if (shouldDisable || shouldReset) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch(() => {});

      if (shouldReset && "caches" in window) {
        caches
          .keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
          .catch(() => {});
      }

      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Non-blocking: app works normally if registration fails.
    });
  }, []);

  return null;
}
