"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Sticky marketing/portal header: absolute media layer (clipped) + measured chrome height for mobile nav offset.
 * @param {{ backdropModifier: string, className?: string, children: import("react").ReactNode }} props
 */
export function SitePublicStickyHeader({ backdropModifier, className = "", children }) {
  const headerRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    function sync() {
      const h = Math.ceil(el.getBoundingClientRect().height);
      el.style.setProperty("--site-header-chrome-height", `${h}px`);
    }
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 18);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tone = backdropModifier.includes("neutral") ? "neutral" : "au";

  return (
    <header
      ref={headerRef}
      className={`site-header site-header--backdrop ${backdropModifier} ${scrolled ? "is-scrolled" : ""} ${className}`.trim()}
    >
      <div className={`site-header__media site-header__media--${tone}`} aria-hidden />
      <div className="site-header__chrome">{children}</div>
    </header>
  );
}
