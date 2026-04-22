"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STEPS = [
  {
    title: "1. Initial Consultation",
    description: "We analyze your background, goals, and migration viability.",
  },
  {
    title: "2. Deep Strategy & Processing",
    description: "Comprehensive points calculation and gathering of critical documentation.",
  },
  {
    title: "3. Application Lodgement",
    description: "Official submission to the Department of Home Affairs with all evidence.",
  },
  {
    title: "4. Visa Grant ✓",
    description: "Welcome! Your pathway to Australia is authenticated and finalized.",
  },
];

export function PathwaySequenceAnimated() {
  const rootRef = useRef(null);
  const timersRef = useRef([]);
  const [activeStep, setActiveStep] = useState(0);
  const [line1Active, setLine1Active] = useState(false);
  const [line2Active, setLine2Active] = useState(false);
  const [line3Active, setLine3Active] = useState(false);
  const [grantPulse, setGrantPulse] = useState(false);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const runSequence = useCallback(() => {
    clearTimers();
    setActiveStep(0);
    setLine1Active(false);
    setLine2Active(false);
    setLine3Active(false);
    setGrantPulse(false);

    const schedule = (ms, fn) => {
      const timer = window.setTimeout(fn, ms);
      timersRef.current.push(timer);
    };

    schedule(1000, () => setActiveStep(1));
    schedule(2200, () => setLine1Active(true));
    schedule(3300, () => setActiveStep(2));
    schedule(4500, () => setLine2Active(true));
    schedule(5600, () => setActiveStep(3));
    schedule(6800, () => setLine3Active(true));
    schedule(8200, () => setActiveStep(4));
    schedule(8700, () => setGrantPulse(true));
  }, [clearTimers]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) runSequence();
      },
      { threshold: 0.45 }
    );
    if (rootRef.current) observer.observe(rootRef.current);
    return () => {
      observer.disconnect();
      clearTimers();
    };
  }, [clearTimers, runSequence]);

  const lineStates = useMemo(() => [line1Active, line2Active, line3Active], [line1Active, line2Active, line3Active]);

  return (
    <div ref={rootRef} className="bg-white/80 backdrop-blur-2xl border border-white/60 p-5 sm:p-6 rounded-[2rem] shadow-2xl relative z-10">
      <p className="text-brand-rose font-bold uppercase tracking-wider text-sm mb-3">How It Works</p>
      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">The MinRosh Pathway</h3>
      <p className="text-slate-600 mb-5 text-sm sm:text-base font-medium">
        A guided, sequenced process from first assessment to your final visa outcome.
      </p>

      <div className="space-y-1">
        {STEPS.map((step, index) => {
          const isActive = activeStep >= index + 1;
          const isGrant = index === STEPS.length - 1;
          return (
            <div key={step.title} className="relative">
              <div
                className={`flex items-center gap-4 transition-all duration-1000 ease-out ${
                  isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-[3px] border-brand-plum z-10 shadow-md transition-all duration-500 ${
                    isGrant
                      ? `bg-brand-rose ${isActive ? "scale-100 shadow-[0_0_20px_rgba(176,67,106,0.8)]" : "scale-0"}`
                      : `bg-brand-gold ${isActive ? "scale-100" : "scale-0"}`
                  }`}
                />

                {isGrant ? (
                  <div
                    className={`flex-1 p-4 sm:p-5 rounded-2xl shadow-2xl text-white border transition-transform duration-500 ${
                      grantPulse ? "scale-105" : "scale-100"
                    }`}
                    style={{
                      background: "linear-gradient(135deg, var(--brand-plum) 0%, var(--brand-rose) 100%)",
                      borderColor: "rgba(202, 166, 77, 0.55)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg sm:text-xl font-bold" style={{ color: "var(--brand-gold)" }}>
                        {step.title}
                      </h4>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider">Success</span>
                    </div>
                    <p className="mt-1 text-sm text-white/95">{step.description}</p>
                  </div>
                ) : (
                  <div className="flex-1 bg-white p-4 sm:p-5 rounded-2xl shadow-xl border border-slate-100">
                    <h4 className="text-base sm:text-lg font-bold text-brand-plum">{step.title}</h4>
                    <p className="text-slate-600 mt-1 text-sm">{step.description}</p>
                  </div>
                )}
              </div>

              {index < STEPS.length - 1 ? (
                <div className="ml-[10px] h-[40px] flex items-start">
                  <div
                    className={`w-1 bg-brand-rose transition-all duration-[1500ms] ease-out ${
                      lineStates[index] ? "h-[40px]" : "h-0"
                    }`}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
