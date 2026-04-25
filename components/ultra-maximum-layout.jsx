"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const GlobalClientWidgets = dynamic(() => import("./global-client-widgets").then(mod => mod.GlobalClientWidgets), { ssr: false });

export function UltraMaximumLayout({ children }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="relative">
      {/* GLOBAL PROGRESS BAR */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-brand-rose z-[200] origin-left"
        style={{ scaleX }}
      />
      
      {/* FLOATING NAVIGATION INDICATOR */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] hidden lg:flex flex-col gap-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-1.5 w-1.5 rounded-full bg-brand-plum/20 border border-brand-plum/10" />
        ))}
      </div>

      {children}
    </div>
  );
}
