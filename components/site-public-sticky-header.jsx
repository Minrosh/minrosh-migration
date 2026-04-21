"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useRef } from "react";
import { useEffect, useState } from "react";

/**
 * Sticky marketing/portal header: absolute media layer (clipped) + measured chrome height for mobile nav offset.
 * @param {{ backdropModifier: string, className?: string, children: import("react").ReactNode }} props
 */
export function SitePublicStickyHeader({ backdropModifier, className = "", children }) {
  const headerRef = useRef(null);
  const [showFloatingAssessment, setShowFloatingAssessment] = useState(false);

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
    if (typeof window === "undefined") return;
    function syncFloatingCta() {
      if (window.location.pathname !== "/") {
        setShowFloatingAssessment(false);
        return;
      }
      const hero = document.getElementById("home");
      if (!hero) {
        setShowFloatingAssessment(window.scrollY > 640);
        return;
      }
      const threshold = hero.getBoundingClientRect().height * 0.7;
      setShowFloatingAssessment(window.scrollY > threshold);
    }
    syncFloatingCta();
    window.addEventListener("scroll", syncFloatingCta, { passive: true });
    window.addEventListener("resize", syncFloatingCta);
    return () => {
      window.removeEventListener("scroll", syncFloatingCta);
      window.removeEventListener("resize", syncFloatingCta);
    };
  }, []);

  const tone = backdropModifier.includes("neutral") ? "neutral" : "au";

  return (
    <header ref={headerRef} className={`site-header site-header--backdrop ${backdropModifier} ${className}`.trim()}>
      <div className={`site-header__media site-header__media--${tone}`} aria-hidden />
      <div className="site-header__chrome">
        {children}
        <AnimatePresence>
          {showFloatingAssessment ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="site-header__floating-assessment"
            >
              <Link href="/#quiz" scroll={false} className="site-nav__floating-cta">
                Start Free Assessment
              </Link>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
