"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1];
const MOBILE_QUERY = "(max-width: 768px)";

function useShouldMinimizeMotion() {
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(query.matches);
    sync();
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", sync);
      return () => query.removeEventListener("change", sync);
    }
    query.addListener(sync);
    return () => query.removeListener(sync);
  }, []);

  const userReduce = mounted ? reduce : false;
  return Boolean(userReduce || isMobile);
}

export function MotionReveal({ as: Comp = "div", className = "", delay = 0, y = 22, children }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const shouldReduce = useShouldMinimizeMotion();
  const MotionComp = motion[Comp] || motion.div;

  return (
    <MotionComp
      ref={ref}
      className={className}
      initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.72, ease: EASE, delay: shouldReduce ? 0 : delay }}
    >
      {children}
    </MotionComp>
  );
}

export function MotionStagger({ className = "", stagger = 0.08, children }) {
  const shouldReduce = useShouldMinimizeMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduce ? undefined : "hidden"}
      whileInView={shouldReduce ? undefined : "show"}
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: stagger,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({ className = "", children }) {
  const shouldReduce = useShouldMinimizeMotion();

  return (
    <motion.div
      className={className}
      variants={
        shouldReduce
          ? undefined
          : {
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
            }
      }
    >
      {children}
    </motion.div>
  );
}
