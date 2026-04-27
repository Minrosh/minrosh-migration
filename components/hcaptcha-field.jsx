"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const SITE_KEY = String(process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "").trim();
const ENABLED = String(process.env.NEXT_PUBLIC_ENABLE_HCAPTCHA || "").toLowerCase() === "true" && Boolean(SITE_KEY);

export function HCaptchaField({ value = "", onTokenChange, error = "" }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ENABLED || !ready || !containerRef.current) return;
    const api = window.hcaptcha;
    if (!api || typeof api.render !== "function") return;
    if (widgetIdRef.current != null) return;
    widgetIdRef.current = api.render(containerRef.current, {
      sitekey: SITE_KEY,
      theme: "light",
      callback: (token) => {
        if (typeof onTokenChange === "function") onTokenChange(String(token || ""));
      },
      "expired-callback": () => {
        if (typeof onTokenChange === "function") onTokenChange("");
      },
      "error-callback": () => {
        if (typeof onTokenChange === "function") onTokenChange("");
      },
    });
  }, [ready, onTokenChange]);

  useEffect(() => {
    if (!ENABLED) return;
    if (!value && widgetIdRef.current != null && window.hcaptcha && typeof window.hcaptcha.reset === "function") {
      window.hcaptcha.reset(widgetIdRef.current);
    }
  }, [value]);

  if (!ENABLED) return null;

  return (
    <div className="contact-grid__full">
      <Script
        src="https://js.hcaptcha.com/1/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div ref={containerRef} className="hcaptcha-widget" />
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
