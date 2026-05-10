"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Single pathway FAB above the mobile tab bar (avoids duplicating Book / Assessment strips).
 */
export function StickyMobileCTA() {
  const pathname = usePathname() || "";
  const [isVisible, setIsVisible] = useState(false);

  const hideOnAssessment = pathname === "/assessment" || pathname.startsWith("/assessment/");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setIsVisible(true);
      else setIsVisible(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && !hideOnAssessment ? (
        <motion.div
          initial={{ y: 56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 56, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="mobile-sticky-quiz-cta-shell"
        >
          <Link
            href="/assessment"
            className="mobile-sticky-quiz-cta touch-manipulation motion-safe:transition-transform motion-safe:active:scale-[0.98]"
          >
            Pathway check
          </Link>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
