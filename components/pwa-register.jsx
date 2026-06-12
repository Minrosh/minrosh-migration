"use client";

import { useEffect } from "react";

function readBuildId() {
  if (typeof document === "undefined") return "";
  return document.querySelector('meta[name="minrosh-build-id"]')?.getAttribute("content")?.trim() || "";
}

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

    const buildId = readBuildId();
    const swUrl = buildId ? `/sw.js?v=${encodeURIComponent(buildId)}` : "/sw.js";

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch(() => {
        // Non-blocking: app works normally if registration fails.
      });

    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  }, []);

  return null;
}
