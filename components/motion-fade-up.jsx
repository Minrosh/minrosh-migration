"use client";

import { useEffect, useRef, useState } from "react";

export function MotionFadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "-50px", threshold: 0.02 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`motion-fade-up${visible ? " motion-fade-up--visible" : ""}${className ? ` ${className}` : ""}`}
      style={{ transitionDelay: visible ? `${delay}s` : undefined }}
    >
      {children}
    </div>
  );
}
