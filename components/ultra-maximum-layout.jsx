"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const GlobalClientWidgets = dynamic(() => import("./global-client-widgets").then(mod => mod.GlobalClientWidgets), { ssr: false });

export function UltraMaximumLayout({ children, className = "" }) {
  const { scrollYProgress } = useScroll();
  const [activeSection, setActiveSection] = useState(0);
  const [sectionCount, setSectionCount] = useState(0);

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const sections = document.querySelectorAll(".ultra-snap-section");
    setSectionCount(sections.length);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(sections).indexOf(entry.target);
            if (index !== -1) setActiveSection(index);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (index) => {
    const sections = document.querySelectorAll(".ultra-snap-section");
    if (sections[index]) {
      sections[index].scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* GLOBAL PROGRESS BAR */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-brand-rose z-[200] origin-left"
        style={{ scaleX }}
      />
      
      {/* FLOATING NAVIGATION INDICATOR */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] hidden lg:flex flex-col gap-4">
        {Array.from({ length: sectionCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToSection(i)}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              activeSection === i 
                ? "bg-brand-rose scale-150 shadow-[0_0_10px_rgba(155,74,108,0.5)]" 
                : "bg-brand-plum/20 hover:bg-brand-plum/40"
            } border border-brand-plum/10`}
            aria-label={`Scroll to section ${i + 1}`}
          />
        ))}
      </div>

      {children}
    </div>
  );
}
