"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    // Only trigger once per session
    if (sessionStorage.getItem("exitIntentTriggered")) {
      setHasTriggered(true);
      return;
    }

    const startTime = Date.now();
    let scrollReached = false;

    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;
      if (scrollPos / totalHeight > 0.3) {
        scrollReached = true;
      }
    };

    const handleMouseLeave = (e) => {
      const timeSpent = (Date.now() - startTime) / 1000;
      // Trigger if mouse leaves top, spent > 20s, and scrolled > 30%
      if (e.clientY <= 0 && !hasTriggered && timeSpent > 20 && scrollReached) {
        setIsVisible(true);
        setHasTriggered(true);
        sessionStorage.setItem("exitIntentTriggered", "true");
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasTriggered]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-plum/40 p-4 backdrop-blur-sm"
        onClick={() => setIsVisible(false)}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl text-center"
        >
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-800"
            aria-label="Close popup"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="mb-2 text-2xl font-bold text-brand-plum">Not sure about your visa options?</h3>
          <p className="mb-6 text-brand-plum/70">
            Don&apos;t leave your migration journey to chance. Take our free 2-minute assessment to discover your clearest pathway.
          </p>
          
          <Link
            href="/assessment"
            onClick={() => setIsVisible(false)}
            className="block w-full rounded-xl bg-brand-rose px-5 py-3.5 text-center font-bold text-white shadow-lg shadow-brand-rose/25 transition-transform hover:-translate-y-0.5 hover:shadow-xl"
          >
            Try Free Assessment
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="mt-4 text-sm font-semibold text-brand-plum/50 transition hover:text-brand-plum"
          >
            No thanks, I&apos;ll figure it out myself
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
