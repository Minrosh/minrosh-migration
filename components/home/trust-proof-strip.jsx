"use client";

import { motion } from "framer-motion";

const TRUST_POINTS = [
  "Registered Migration Agents (MARA)",
  "Brisbane-based Office",
  "Secure Online Portal",
];

export function TrustProofStrip({ siteData }) {
  const stats = Array.isArray(siteData?.stats) ? siteData.stats : [];
  if (!stats.length) {
    return null;
  }

  return (
    <section
      className="border-t border-brand-plum/10 bg-white py-16 lg:py-24"
      aria-label="Key facts and credentials"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl font-bold tracking-tight text-brand-plum sm:text-4xl">{stat.value}</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-brand-gold">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 border-t border-brand-plum/10 pt-10 text-sm font-medium text-brand-plum/70">
          {TRUST_POINTS.map((point) => (
            <div key={point} className="flex items-center gap-2">
              <span className="text-brand-gold" aria-hidden>
                ✓
              </span>
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
