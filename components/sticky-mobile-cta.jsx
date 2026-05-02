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
          className="fixed bottom-0 left-0 right-0 z-[65] flex items-center justify-between gap-2 border-t border-brand-plum/10 bg-white/95 p-3 px-4 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden"
        >
          <Link
            href="/assessment"
            className="flex min-h-[48px] flex-1 touch-manipulation items-center justify-center rounded-xl bg-brand-rose px-4 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand-rose/20 transition-transform active:scale-95"
          >
            Free Assessment
          </Link>
          <Link
            href="/book-consultation"
            className="flex min-h-[48px] flex-1 touch-manipulation items-center justify-center rounded-xl border border-brand-plum/10 bg-brand-plum/5 px-4 py-4 text-xs font-black uppercase tracking-widest text-brand-plum transition-transform active:scale-95"
          >
            Book Now
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
