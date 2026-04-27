"use client";

import { motion } from "framer-motion";

export function ContactCalmVisual() {
  return (
    <div className="relative h-44 overflow-hidden rounded-2xl border border-brand-plum/10 bg-gradient-to-br from-brand-cream via-white to-brand-rose/15">
      <motion.div
        className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-brand-rose/35 blur-2xl"
        animate={{ x: [0, 10, 0], y: [0, 8, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="absolute -bottom-10 -right-8 h-40 w-40 rounded-full bg-brand-gold/35 blur-2xl"
        animate={{ x: [0, -12, 0], y: [0, -8, 0], scale: [1.04, 1, 1.04] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-[28%] border border-brand-plum/20 bg-white/60 shadow-xl backdrop-blur-md"
        animate={{ rotate: [0, 8, 0, -8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <div className="relative z-10 flex h-full items-end p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-plum/65">
          Calm planning mode
        </p>
      </div>
    </div>
  );
}
