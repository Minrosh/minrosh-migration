"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-2 border-t border-brand-plum/10 bg-white/95 p-3 px-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden"
        >
          <Link
            href="/assessment"
            className="flex flex-1 items-center justify-center rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-transform active:scale-95"
          >
            Start Assessment
          </Link>
          <a
            href="tel:+61000000000" // Replace with actual number
            className="flex flex-1 items-center justify-center rounded-xl border border-brand-plum/15 bg-brand-cream/30 py-3 text-sm font-bold text-brand-plum transition-transform active:scale-95"
          >
            Call Now
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
