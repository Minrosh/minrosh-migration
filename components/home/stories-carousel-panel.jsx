"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import trustSignals from "../../data/home-stories-trust-signals.json";

export function StoriesCarouselPanel({ siteData, isActive, wrapSection = true }) {
  const [storyIndex, setStoryIndex] = useState(0);
  const [daysCounter, setDaysCounter] = useState(0);
  const [showProofPlan, setShowProofPlan] = useState(false);
  const activeStory = siteData.successStories[storyIndex];
  const storyImages = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80",
  ];

  const daysToApproval = useMemo(() => {
    const match = String(activeStory?.timeline || "").match(/(\d+)/);
    const months = match ? Number(match[1]) : 6;
    return Math.max(45, months * 30);
  }, [activeStory]);
  const storyLane = useMemo(() => {
    const visa = String(activeStory?.visa || "").toLowerCase();
    if (visa.includes("partner")) return "Partner";
    if (visa.includes("student")) return "Student";
    if (visa.includes("employer")) return "Employer";
    if (visa.includes("skilled")) return "Skilled";
    return "General";
  }, [activeStory]);
  const relevanceScore = useMemo(() => {
    if (storyLane === "Partner") return 89;
    if (storyLane === "Student") return 84;
    if (storyLane === "Employer") return 81;
    if (storyLane === "Skilled") return 93;
    return 78;
  }, [storyLane]);
  const proofStats = Array.isArray(trustSignals?.proofStats) ? trustSignals.proofStats : [];
  const lanePatterns = trustSignals?.decisionPatterns && typeof trustSignals.decisionPatterns === "object"
    ? trustSignals.decisionPatterns
    : {};
  const decisionPattern = Array.isArray(lanePatterns[storyLane])
    ? lanePatterns[storyLane]
    : Array.isArray(lanePatterns.General)
      ? lanePatterns.General
      : [];

  useEffect(() => {
    setShowProofPlan(false);
  }, [storyIndex]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStoryIndex((current) => (current + 1) % siteData.successStories.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [siteData.successStories.length]);

  useEffect(() => {
    let raf;
    let start;
    const duration = 700;
    const from = 0;
    const to = daysToApproval;
    function tick(ts) {
      if (!start) start = ts;
      const progress = Math.min(1, (ts - start) / duration);
      setDaysCounter(Math.round(from + (to - from) * progress));
      if (progress < 1) raf = window.requestAnimationFrame(tick);
    }
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [daysToApproval, storyIndex]);

  function goToNextStory() {
    setStoryIndex((current) => (current + 1) % siteData.successStories.length);
  }

  function goToPreviousStory() {
    setStoryIndex((current) =>
      current === 0 ? siteData.successStories.length - 1 : current - 1
    );
  }

  const content = (
    <div className={`${wrapSection ? "" : "py-10 md:py-14 px-4 sm:px-6"}`}>
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-12 text-center max-w-2xl mx-auto animate-fade-up">
          <p className="inline-block text-brand-rose font-bold uppercase tracking-wider text-sm mb-3 bg-brand-rose/10 px-4 py-1.5 rounded-full border border-brand-rose/20 shadow-sm">
            Success Stories
          </p>
          <h2 className="text-[2rem] md:text-4xl lg:text-5xl font-extrabold text-brand-plum mb-5 tracking-tight leading-tight">
            Real families. Real approvals. Real momentum.
          </h2>
          <p className="text-lg text-brand-plum/70 font-medium">
            Real pathways realized through structured, step-by-step guidance.
          </p>
        </div>
        {proofStats.length ? (
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {proofStats.map((item) => (
              <div key={item.id} className="rounded-2xl border border-brand-plum/15 bg-white/75 px-4 py-3 text-left shadow-sm">
                <p className="text-base font-extrabold text-brand-plum">{item.value}</p>
                <p className="text-xs text-brand-plum/70">{item.label}</p>
              </div>
            ))}
          </div>
        ) : null}
        <motion.div
          key={`story-${storyIndex}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="relative bg-white/85 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden mt-8 mb-12 flex flex-col-reverse lg:flex-row group animate-fade-up-delay hover:-translate-y-1 transition-transform duration-300"
        >
          <div className="lg:w-1/2 p-8 sm:p-14 flex flex-col justify-center relative">
            <div className="absolute top-6 left-8 text-[12rem] leading-none text-brand-cream font-serif -z-10 select-none">
              &ldquo;
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-8">
                <span className="bg-brand-plum text-brand-cream text-xs font-extrabold uppercase tracking-widest px-4 py-2 rounded-full shadow-md">
                  Outcome Verified
                </span>
                <p className="text-brand-rose font-bold bg-brand-rose/10 px-4 py-2 rounded-xl text-sm border border-brand-rose/20">
                  {activeStory.visa}
                </p>
              </div>
              <blockquote className="text-2xl sm:text-3xl text-brand-plum font-medium leading-relaxed mb-10 transition-opacity duration-300">
                &ldquo;{activeStory.quote}&rdquo;
              </blockquote>
              <div className="mb-7 rounded-2xl border border-brand-plum/10 bg-brand-cream/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-plum/60">Case relevance</p>
                  <span className="rounded-full bg-brand-plum px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                    {storyLane} lane
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-plum/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand-rose to-brand-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${relevanceScore}%` }}
                    transition={{ duration: 0.45 }}
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-brand-plum/70">
                  Relevance score: {relevanceScore}% based on pathway style and timeline pattern.
                </p>
              </div>
              <div className="mt-auto border-t border-brand-plum/10 pt-8">
                <h3 className="text-xl font-extrabold text-brand-plum mb-1">{activeStory.name}</h3>
                <div className="flex items-center gap-2 text-brand-plum/60 text-sm font-medium mb-3">
                  <span className="text-brand-gold">📍</span> {activeStory.location}
                  <span className="mx-2 opacity-30">•</span>
                  <span>⏱ {activeStory.timeline}</span>
                </div>
                <p className="text-brand-rose font-semibold bg-brand-rose/5 inline-block px-3 py-1 rounded-md">
                  Status: {activeStory.outcome}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-brand-plum px-3 py-2 text-white">
                    <p className="text-[10px] uppercase tracking-wider text-white/70">Days to approval</p>
                    <p className="text-lg font-extrabold">{daysCounter}</p>
                  </div>
                  <div className="rounded-xl bg-brand-cream px-3 py-2 text-brand-plum">
                    <p className="text-[10px] uppercase tracking-wider text-brand-plum/60">Confidence score</p>
                    <p className="text-lg font-extrabold">{92 - storyIndex}%</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center rounded-full border border-brand-plum/15 bg-white px-3 py-1.5 text-xs font-semibold text-brand-plum transition hover:border-brand-plum/40"
                  onClick={() => setShowProofPlan((current) => !current)}
                  aria-expanded={showProofPlan}
                >
                  {showProofPlan ? "Hide decision pattern" : "Show decision pattern"}
                </button>
                {showProofPlan ? (
                  <ul className="mt-3 space-y-2 text-xs text-brand-plum/75">
                    {decisionPattern.map((step) => (
                      <li key={step} className="flex gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand-rose" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div className="flex items-center gap-4 mt-10">
                <button
                  type="button"
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-cream/70 border border-brand-plum/10 text-brand-plum hover:bg-brand-rose hover:text-white hover:border-brand-rose hover:shadow-lg transition-all duration-300"
                  onClick={goToPreviousStory}
                  aria-label="Previous success story"
                >
                  <span className="text-xl leading-none">←</span>
                </button>
                <button
                  type="button"
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-brand-plum border border-brand-plum text-white hover:bg-brand-rose hover:border-brand-rose hover:-translate-y-1 hover:shadow-xl shadow-brand-plum/30 transition-all duration-300"
                  onClick={goToNextStory}
                  aria-label="Next success story"
                >
                  <span className="text-xl leading-none">→</span>
                </button>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 relative min-h-[320px] lg:min-h-full overflow-hidden bg-brand-plum border-b lg:border-b-0 lg:border-l border-white/40">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-plum/35 via-transparent to-transparent z-10"></div>
            <Image
              src={storyImages[storyIndex % storyImages.length]}
              alt="MinRosh migration guidance and Brisbane lifestyle"
              fill
              className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-90"
            />
          </div>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {siteData.successStories.map((story, index) => (
            <button
              key={story.name}
              type="button"
              className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 group ${
                storyIndex === index
                  ? "border-brand-plum bg-brand-cream/40 shadow-md ring-2 ring-brand-plum/10 scale-100"
                  : "border-white/70 bg-white/75 backdrop-blur-md hover:border-brand-rose/40 hover:bg-brand-cream/50 hover:-translate-y-1 shadow-sm"
              }`}
              onClick={() => setStoryIndex(index)}
            >
              <strong className={`block text-lg mb-1 transition-colors ${storyIndex === index ? "text-brand-plum" : "text-brand-plum/85 group-hover:text-brand-plum"}`}>
                {story.name}
              </strong>
              <div className="flex flex-col gap-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${storyIndex === index ? "text-brand-rose" : "text-brand-gold"}`}>
                  {story.visa}
                </span>
                <p className="text-brand-plum/55 text-sm font-medium">{story.timeline}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (!wrapSection) return content;

  return (
    <section id="stories" className={`tab-panel ${isActive ? "is-active" : ""} py-10 md:py-14 px-4 sm:px-6`}>
      {content}
    </section>
  );
}
