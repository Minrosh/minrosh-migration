"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function MaintenancePage() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-b from-[#f7f2ec] via-[#fdfcfb] to-[#f6efe8] px-6 py-20">
      <motion.div
        className="pointer-events-none absolute -left-20 top-4 h-72 w-72 rounded-full bg-brand-rose/20 blur-3xl"
        aria-hidden
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-brand-gold/25 blur-3xl"
        aria-hidden
        animate={{ scale: [1.04, 1, 1.04], opacity: [0.55, 0.35, 0.55] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <section className="mx-auto max-w-3xl rounded-[2rem] border border-brand-plum/10 bg-white/90 p-8 text-center shadow-lux backdrop-blur-sm md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-rose">Software update in progress</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-brand-plum md:text-4xl">
          Upgrading for a better experience
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-brand-plum/70">
          We are briefly upgrading our systems to bring you a better, faster experience. We will be right back.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <motion.span
            className="inline-block h-3 w-3 rounded-full bg-brand-rose shadow-[0_0_24px_rgba(215,124,153,0.6)]"
            animate={{ scale: [1, 1.35, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
          <span className="text-sm font-semibold text-brand-plum/75">Installing improvements</span>
        </div>

        <div className="mt-8 rounded-2xl border border-brand-plum/10 bg-brand-cream/45 px-5 py-4 text-sm text-brand-plum/70">
          Need urgent assistance? WhatsApp and phone channels reopen immediately after deployment.
        </div>

        <div className="mt-8">
          <Link href="/" className="inline-flex rounded-full bg-brand-plum px-5 py-2.5 text-sm font-semibold text-white">
            Retry homepage
          </Link>
        </div>
      </section>
    </main>
  );
}
