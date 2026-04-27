"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { calculateQuizResult, quizOptions } from "@/lib/quiz";
import { persistNavigatorSummary } from "@/lib/navigator-session";
import { trackEvent } from "@/lib/client-analytics";
import { QuizResultSkeleton as DefaultQuizResultSkeleton } from "./quiz-result-skeleton";

const quizSteps = [
  {
    id: "basics",
    label: "Basics",
    title: "Profile basics",
    description:
      "Start with age, your field, and whether your occupation sits on a relevant skilled list.",
    fields: ["occupationName", "age", "occupation", "occupationSector"],
  },
  {
    id: "english",
    label: "English",
    title: "English proficiency",
    description: "Your English result can materially change invitation competitiveness.",
    fields: ["english"],
  },
  {
    id: "work",
    label: "Work",
    title: "Overseas skilled experience",
    description:
      "Count overseas skilled experience in your nominated occupation carefully and conservatively.",
    fields: ["overseasExperience"],
  },
  {
    id: "australiaWork",
    label: "AU work",
    title: "Australian skilled employment",
    description:
      "Australian employment in your skilled occupation can add points (simplified bands aligned with common skilled points tables — confirm your exact position on Home Affairs).",
    fields: ["australianSkilled"],
  },
  {
    id: "readiness",
    label: "Assessment",
    title: "Skills assessment readiness",
    description:
      "This does not change points here, but it drives sequencing — most skilled applicants need a positive skills assessment before moving forward confidently.",
    fields: ["skillsReadiness"],
  },
  {
    id: "education",
    label: "Education",
    title: "Education",
    description: "Your highest qualification contributes to the overall points profile.",
    fields: ["education"],
  },
  {
    id: "hybrid",
    label: "Capability",
    title: "Hybrid & advisory work",
    description:
      "Policy and labour-market narratives increasingly distinguish roles with judgment, systems thinking, and client or stakeholder oversight from purely routine tasks — answer for your typical responsibilities.",
    fields: ["hybridCapability"],
  },
  {
    id: "partner",
    label: "Partner",
    title: "Partner",
    description: "Partner status can add valuable points and change your strategy.",
    fields: ["partner"],
  },
  {
    id: "sid",
    label: "SID",
    title: "Skills in Demand (SID)",
    description:
      "Employer-sponsored skilled migration is organised into Specialist Skills, Core Skills, and Essential Skills streams (Skills in Demand). Pick the closest fit — we will refine it against current Home Affairs rules.",
    fields: ["sidStream"],
  },
  {
    id: "planning",
    label: "Pathway",
    title: "Nomination focus",
    description:
      "Whether you lean toward independent, state-nominated, or regional pathways helps tailor practical next steps.",
    fields: ["pathwayFocus"],
  },
];

function buildQuizSummaryText(quizForm, quizResult) {
  if (!quizResult) return "";
  const lines = [
    "MinRosh Migration — 2026 Points Wizard summary (indicative only)",
    `Date: ${new Date().toISOString().slice(0, 10)}`,
    "",
    `Occupation (as entered): ${quizForm.occupationName || "n/a"}`,
    `Estimated points: ${quizResult.score}`,
    `Priority: ${quizResult.trafficLightLabel}`,
    `SID: ${quizResult.sidStreamLabel}`,
    "",
    "Notes:",
    ...quizResult.messages.map((m) => `- ${m}`),
    "",
    "Breakdown:",
    ...quizResult.pointsBreakdown.map((row) => `- ${row.label}: ${row.points} pts`),
    "",
    "Always verify against current Department of Home Affairs rules before making decisions.",
    "This summary does not constitute migration advice.",
  ];
  return lines.join("\n");
}

const initialQuiz = {
  occupationName: "",
  age: "",
  occupation: "unsure",
  occupationSector: "",
  english: "",
  overseasExperience: "",
  australianSkilled: "",
  skillsReadiness: "",
  education: "",
  hybridCapability: "",
  partner: "",
  sidStream: "",
  pathwayFocus: "",
};

function fieldIsComplete(field, quizForm) {
  if (field === "occupationName") return Boolean(quizForm.occupationName.trim());
  return Boolean(quizForm[field]);
}

export function QuizWizardPanel({ isActive, onGoToContact, resultSkeleton }) {
  const [quizForm, setQuizForm] = useState(initialQuiz);
  const [quizStepIndex, setQuizStepIndex] = useState(0);
  const [resultSkeletonActive, setResultSkeletonActive] = useState(false);
  const [copySummaryState, setCopySummaryState] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const quizResult = useMemo(() => calculateQuizResult(quizForm), [quizForm]);
  const currentQuizStep = quizSteps[quizStepIndex];
  const quizStepProgressRaw = ((quizStepIndex + 1) / quizSteps.length) * 100;
  const quizStepProgress = Math.min(100, 35 + quizStepProgressRaw * 0.65);
  const canAdvance = currentQuizStep.fields.every((field) => fieldIsComplete(field, quizForm));
  const quizComplete = quizSteps.every((step) =>
    step.fields.every((field) => fieldIsComplete(field, quizForm))
  );
  const completedStepsCount = quizSteps.filter((step) =>
    step.fields.every((field) => fieldIsComplete(field, quizForm))
  ).length;
  const completionPercent = Math.round((completedStepsCount / quizSteps.length) * 100);

  const summaryText = useMemo(() => {
    if (!quizResult || !quizComplete) return "";
    return buildQuizSummaryText(quizForm, quizResult);
  }, [quizForm, quizResult, quizComplete]);

  useEffect(() => {
    if (!quizComplete) {
      setResultSkeletonActive(false);
      setShowBreakdown(false);
      return;
    }
    setResultSkeletonActive(true);
    const t = window.setTimeout(() => setResultSkeletonActive(false), 480);
    return () => window.clearTimeout(t);
  }, [quizComplete]);

  useEffect(() => {
    if (!quizResult || !quizComplete || resultSkeletonActive) return;
    const summary = [
      `Quiz result: Estimated ${quizResult.score} points.`,
      `Priority status: ${quizResult.trafficLightLabel}.`,
      quizResult.greenPrioritySector
        ? "2026 Green priority sector: healthcare, trades, or education (illustrative)."
        : "",
      quizResult.marketInsight ? `2026 Market Insight: ${quizResult.marketInsight}` : "",
      `Occupation: ${quizResult.selectedOccupation}.`,
      `Sector: ${quizResult.occupationSectorLabel}. SID stream: ${quizResult.sidStreamLabel}.`,
      `Breakdown: ${quizResult.pointBreakdownText}.`,
    ]
      .filter(Boolean)
      .join(" ");

    if (typeof window !== "undefined") {
      const detail = {
        summary,
        preferredCountry: "Australia",
        mainNeed: "Skilled Migration",
        quizSummaryShort: `Estimated points: ${quizResult.score}. ${quizResult.pointBreakdownText}. SID: ${quizResult.sidStreamLabel}.`,
      };
      persistNavigatorSummary(detail);
      window.dispatchEvent(new CustomEvent("minrosh:navigator-summary", { detail }));
      trackEvent("quiz_completed", {
        points_score: quizResult.score,
        traffic_light: quizResult.trafficLight,
        sid_stream: quizResult.sidStreamLabel,
      });
    }
  }, [quizComplete, quizResult, resultSkeletonActive]);

  function setQuizValue(key, value) {
    setQuizForm((current) => ({ ...current, [key]: value }));
  }

  function goToNextQuizStep() {
    if (!canAdvance) return;
    setQuizStepIndex((current) => Math.min(current + 1, quizSteps.length - 1));
  }

  function goToPreviousQuizStep() {
    setQuizStepIndex((current) => Math.max(current - 1, 0));
  }

  async function copySummaryToClipboard() {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopySummaryState("copied");
      trackEvent("quiz_summary_copied", { points_score: quizResult?.score ?? 0 });
      window.setTimeout(() => setCopySummaryState(""), 2400);
    } catch {
      setCopySummaryState("failed");
      window.setTimeout(() => setCopySummaryState(""), 4000);
    }
  }

  function downloadSummaryFile() {
    if (!summaryText || typeof document === "undefined") return;
    const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `minrosh-points-wizard-${new Date().toISOString().slice(0, 10)}.txt`;
    anchor.rel = "noopener";
    anchor.click();
    URL.revokeObjectURL(url);
    trackEvent("quiz_summary_downloaded", { points_score: quizResult?.score ?? 0 });
  }

  return (
    <section id="quiz" className={`tab-panel ${isActive ? "is-active" : ""} py-12 px-4 sm:px-6`}>
      <div className="max-w-7xl mx-auto w-full">
        {/* Wizard Header / Hero */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <p className="inline-block text-brand-rose font-bold uppercase tracking-wider text-sm mb-3 bg-brand-rose/10 px-4 py-1 rounded-full border border-brand-rose/20">
            2026 Points Wizard
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-plum mb-4 tracking-tight leading-tight">
            Your AI concierge intake, one calm question at a time
          </h2>
          <p className="text-lg text-brand-plum/70 mb-4">
            This wizard is designed to feel closer to a real intake review while still remaining
            preliminary guidance. Always confirm points and eligibility against current Department of
            Home Affairs rules.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm font-medium text-brand-plum/60 mt-6">
             <div className="flex items-center gap-2"><span className="text-brand-rose">✓</span> Takes 2 minutes</div>
             <div className="flex items-center gap-2"><span className="text-brand-rose">✓</span> No sign-up required</div>
             <div className="flex items-center gap-2"><span className="text-brand-rose">✓</span> 100% Privacy Protected</div>
          </div>
          <p className="mt-4 text-sm text-brand-plum/60">Guided by MinRosh AI concierge style prompts — one decision at a time.</p>
        </div>

        {/* Wizard Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Panel: The Questions */}
          <section className="lg:col-span-8 bg-white border border-brand-plum/15 shadow-xl rounded-3xl overflow-hidden flex flex-col">
            
            {/* Header & Progress */}
            <div className="bg-brand-cream/45 border-b border-brand-plum/10 p-6 sm:p-8 relative">
              <motion.div
                key={`step-head-${currentQuizStep.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-between mb-4 relative z-10"
              >
                <div>
                  <p className="text-brand-rose text-sm font-bold uppercase tracking-wider mb-1">{currentQuizStep.label}</p>
                  <h3 className="text-2xl font-extrabold text-brand-plum">{currentQuizStep.title}</h3>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-brand-plum/10 text-brand-plum font-bold">
                  Step {quizStepIndex + 1} <span className="text-brand-plum/40 font-medium">/ {quizSteps.length}</span>
                </div>
              </motion.div>
              
              {/* Animated Progress Bar */}
              <div className="w-full bg-brand-plum/15 h-2.5 rounded-full overflow-hidden mt-6 shadow-inner relative z-10">
                <div 
                  className="h-full bg-gradient-to-r from-brand-rose via-brand-plum to-brand-gold transition-all duration-700 ease-out rounded-full relative"
                  style={{ width: `${quizStepProgress}%` }}
                >
                   {/* Shimmer effect on bar */}
                   <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -skew-x-12 translate-x-[-100%]"></div>
                </div>
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-plum/60">
                You are already 35% complete - we prefilled your momentum.
              </p>
            </div>

            {/* Question Body */}
            <div className="p-6 sm:p-10 flex-grow min-h-[400px]">
              <AnimatePresence mode="wait">
              <motion.div
                key={`step-body-${currentQuizStep.id}`}
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.22 }}
              >
              <p className="text-lg text-brand-plum/80 mb-8 font-medium leading-relaxed">{currentQuizStep.description}</p>

              <div className="space-y-4">
                {currentQuizStep.id === "basics" ? (
                  <div className="space-y-8">
                    <label className="block w-full">
                      <span className="block text-brand-plum font-bold mb-3 text-lg">Occupation / Field</span>
                      <input
                        type="text"
                        value={quizForm.occupationName}
                        onChange={(event) => setQuizValue("occupationName", event.target.value)}
                        placeholder="e.g. Software Engineer"
                        className="w-full text-lg p-4 rounded-xl border-2 border-brand-plum/15 focus:border-brand-rose focus:ring-4 focus:ring-brand-rose/20 outline-none transition-all shadow-sm"
                      />
                    </label>
                    <label className="block w-full">
                      <span className="block text-brand-plum font-bold mb-3 text-lg">Age</span>
                      <select
                        value={quizForm.age}
                        onChange={(event) => setQuizValue("age", event.target.value)}
                        className="w-full text-lg p-4 rounded-xl border-2 border-brand-plum/15 focus:border-brand-rose focus:ring-4 focus:ring-brand-rose/20 outline-none transition-all shadow-sm bg-white"
                      >
                        <option value="" disabled>Choose your age range...</option>
                        {quizOptions.age.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    
                    <div>
                      <span className="block text-brand-plum font-bold mb-3 text-lg">Is your occupation on the skilled list?</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {quizOptions.occupationStatus.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={`p-4 rounded-xl border-2 text-left transition-all duration-300 font-bold ${
                              quizForm.occupation === option.value 
                                ? "border-brand-rose bg-brand-rose/10 text-brand-plum shadow-md ring-2 ring-brand-rose/30 scale-[1.02]" 
                                : "border-brand-plum/15 text-brand-plum/70 hover:border-brand-rose/50 hover:bg-brand-cream/45 hover:shadow-sm"
                            }`}
                            onClick={() => setQuizValue("occupation", option.value)}
                          >
                            <div className="flex items-center justify-between">
                              {option.label}
                              {quizForm.occupation === option.value && <span className="text-brand-rose">✓</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-brand-plum font-bold mb-3 text-lg">
                        Which sector best describes your main occupation or training?
                      </span>
                      <div className="grid grid-cols-1 gap-3">
                        {quizOptions.occupationSector.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={`p-4 rounded-xl border-2 text-left transition-all duration-300 font-bold ${
                              quizForm.occupationSector === option.value 
                                ? "border-brand-rose bg-brand-rose/10 text-brand-plum shadow-md ring-2 ring-brand-rose/30 scale-[1.02]" 
                                : "border-brand-plum/15 text-brand-plum/70 hover:border-brand-rose/50 hover:bg-brand-cream/45 hover:shadow-sm"
                            }`}
                            onClick={() => setQuizValue("occupationSector", option.value)}
                          >
                            <div className="flex items-center justify-between">
                              {option.label}
                              {quizForm.occupationSector === option.value && <span className="text-brand-rose">✓</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Standard Radio Button Renderers for all other steps */}
                {["english", "work", "education", "hybrid", "partner", "australiaWork", "readiness", "sid", "planning"].map(stepId => {
                  if (currentQuizStep.id !== stepId) return null;
                  const opts = quizOptions[stepId] || quizOptions.overseasExperience || quizOptions.australianSkilled || quizOptions.hybridCapability || quizOptions.skillsReadiness || quizOptions.sidStream || quizOptions.pathwayFocus; 
                  // Resolve the proper option list. 
                  const correctOpts = stepId === "work" ? quizOptions.overseasExperience 
                                   : stepId === "australiaWork" ? quizOptions.australianSkilled 
                                   : stepId === "hybrid" ? quizOptions.hybridCapability
                                   : stepId === "readiness" ? quizOptions.skillsReadiness
                                   : stepId === "sid" ? quizOptions.sidStream
                                   : stepId === "planning" ? quizOptions.pathwayFocus
                                   : quizOptions[stepId];
                  const fieldName = stepId === "work" ? "overseasExperience"
                                   : stepId === "australiaWork" ? "australianSkilled"
                                   : stepId === "hybrid" ? "hybridCapability"
                                   : stepId === "readiness" ? "skillsReadiness"
                                   : stepId === "sid" ? "sidStream"
                                   : stepId === "planning" ? "pathwayFocus"
                                   : stepId;

                  return (
                    <div className="grid grid-cols-1 gap-3" key={stepId}>
                      {correctOpts.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                            quizForm[fieldName] === option.value 
                              ? "border-brand-rose bg-brand-rose/5 text-brand-plum shadow-md ring-2 ring-brand-rose/20 scale-[1.01]" 
                              : "border-brand-plum/15 text-brand-plum/75 hover:border-brand-plum/40 hover:bg-brand-cream/45 hover:shadow-sm"
                          }`}
                          onClick={() => setQuizValue(fieldName, option.value)}
                        >
                          <div className="flex items-center justify-between font-bold text-lg">
                            {option.label}
                            {quizForm[fieldName] === option.value && (
                              <div className="w-6 h-6 rounded-full bg-brand-rose flex items-center justify-center text-white shadow-sm animate-pulse-slow">
                                ✓
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
              </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="bg-brand-cream/45 border-t border-brand-plum/10 p-6 sm:px-10 py-6 flex items-center justify-between">
              <button
                type="button"
                className={`min-h-[48px] px-6 py-3 rounded-xl font-bold transition-all ${
                  quizStepIndex === 0 
                  ? "text-brand-plum/40 bg-brand-plum/10 cursor-not-allowed" 
                  : "text-brand-plum/75 bg-white border border-brand-plum/20 hover:bg-brand-cream/60 hover:text-brand-plum shadow-sm"
                }`}
                onClick={goToPreviousQuizStep}
                disabled={quizStepIndex === 0}
              >
                ← Previous
              </button>
              
              {quizStepIndex < quizSteps.length - 1 ? (
                <button
                  type="button"
                  className={`min-h-[48px] px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center gap-2 ${
                    !canAdvance 
                    ? "text-white/70 bg-brand-plum/45 cursor-not-allowed shadow-none" 
                    : "text-white bg-brand-rose hover:bg-brand-plum shadow-brand-rose/40 hover:shadow-brand-plum/40 hover:-translate-y-0.5"
                  }`}
                  onClick={goToNextQuizStep}
                  disabled={!canAdvance}
                >
                  Next step →
                </button>
              ) : (
                <button
                  type="button"
                  className={`min-h-[48px] px-8 py-3 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center gap-2 ${
                    !quizComplete 
                    ? "text-white/70 bg-brand-plum/45 cursor-not-allowed shadow-none" 
                    : "text-white bg-gradient-to-r from-brand-plum to-brand-rose hover:scale-105 shadow-brand-rose/50"
                  }`}
                  onClick={() => {
                    trackEvent("quiz_continue_to_report_clicked", { points_score: quizResult?.score || 0 });
                    onGoToContact?.();
                  }}
                  disabled={!quizComplete}
                >
                  Get Eligibility Report 🌟
                </button>
              )}
            </div>
          </section>

          {/* Right Panel: The Results Sidebar */}
          <aside className="lg:col-span-4 sticky top-32">
            <div className={`backdrop-blur-xl bg-white/95 shadow-2xl rounded-3xl p-6 sm:p-8 border border-white/60 transition-all duration-1000 ${
              quizResult && quizComplete && !resultSkeletonActive 
              ? "opacity-100 translate-y-0" 
              : "opacity-80 translate-y-4"
            }`}>
              <div className="mb-5 rounded-2xl border border-brand-plum/10 bg-brand-cream/45 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-plum/60">Endowed progress</p>
                  <span className="text-xs font-semibold text-brand-plum/70">{completionPercent}% complete</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-brand-plum/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand-rose to-brand-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(18, completionPercent)}%` }}
                    transition={{ duration: 0.35 }}
                  />
                </div>
                <p className="mt-2 text-xs text-brand-plum/65">
                  {quizComplete
                    ? "Profile unlocked. Review your score and choose your next action."
                    : "Most users finish in about 2 minutes. Keep going to unlock your live estimate."}
                </p>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-brand-cream flex items-center justify-center text-brand-rose font-bold">★</span>
                <p className="text-brand-plum/55 font-bold uppercase tracking-wider text-sm">Live Estimate</p>
              </div>

              {quizResult && quizComplete && resultSkeletonActive ? (
                resultSkeleton ?? <DefaultQuizResultSkeleton />
              ) : null}

              {quizResult && quizComplete && !resultSkeletonActive ? (
                <div className="animate-fade-up">
                  <h3 className="text-3xl font-extrabold text-brand-plum mb-6 leading-tight">
                    {quizResult.restricted
                      ? "Alternative pathway review needed"
                      : `${quizResult.score} points estimated`}
                  </h3>
                  
                  {/* Traffic Light Status */}
                  <div className={`p-5 rounded-2xl mb-6 shadow-inner border-l-4 ${
                    quizResult.trafficLight === 'green' ? 'bg-brand-cream/60 border-brand-gold' :
                    quizResult.trafficLight === 'amber' ? 'bg-brand-gold/15 border-brand-gold' :
                    'bg-brand-rose/10 border-brand-rose'
                  }`}>
                    <strong className="block text-lg mb-1 text-brand-plum">{quizResult.trafficLightLabel}</strong>
                    <p className="text-sm text-brand-plum/75 leading-relaxed">{quizResult.trafficLightDescription}</p>
                  </div>

                  {quizResult.greenPrioritySector ? (
                    <p className="inline-block px-3 py-1.5 rounded-full bg-brand-gold/20 text-brand-plum font-bold text-xs mb-4">
                      2026 market · Green / priority occupation band
                    </p>
                  ) : null}
                  
                  {/* Info Row: Pathway and SID */}
                  <div className="space-y-3 mb-8 bg-brand-cream/45 p-4 rounded-xl border border-brand-plum/10">
                    <div>
                      <span className="text-brand-plum/55 text-sm font-semibold block">Pathway strength</span>
                      <strong className="text-brand-plum">{quizResult.pathwayStrengthLabel}</strong>
                    </div>
                    <div>
                      <span className="text-brand-plum/55 text-sm font-semibold block">SID Stream</span>
                      <strong className="text-brand-plum">
                        {quizResult.sidStreamLabel}
                        {quizResult.goldenTicketSector && !quizResult.priorityProcessingBadge
                          ? " (National priority)"
                          : ""}
                      </strong>
                    </div>
                  </div>

                  {/* Dynamic Action Required List */}
                  <ul className="space-y-2 mb-8">
                    {quizResult.messages.map((message) => (
                      <li key={message} className="flex items-start text-sm text-brand-plum/75 font-medium">
                        <span className="text-brand-rose mr-2 mt-0.5">•</span>
                        {message}
                      </li>
                    ))}
                  </ul>

                  {/* Market Insights */}
                  {quizResult.marketInsight ? (
                    <div className="mb-6 p-4 bg-brand-cream/50 rounded-xl border border-brand-gold/30 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/10 rounded-bl-full -z-10"></div>
                      <span className="block text-brand-rose font-bold text-xs uppercase mb-2">2026 Market Insight</span>
                      <p className="text-sm text-brand-plum/80 font-medium">{quizResult.marketInsight}</p>
                    </div>
                  ) : null}

                  <hr className="my-6 border-brand-plum/15" />

                  <div className="mb-8 rounded-2xl border border-brand-plum/15 bg-white p-4">
                    <button
                      type="button"
                      className="flex w-full min-h-[48px] items-center justify-between text-left"
                      onClick={() => setShowBreakdown((current) => !current)}
                      aria-expanded={showBreakdown}
                    >
                      <h4 className="text-lg font-bold text-brand-plum">Points Breakdown</h4>
                      <span className="text-sm font-semibold text-brand-rose">
                        {showBreakdown ? "Hide details" : "Show details"}
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {showBreakdown ? (
                        <motion.ul
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 14 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-3 overflow-hidden"
                        >
                          {quizResult.pointsBreakdown.map((item) => (
                            <li key={item.label} className="flex items-center justify-between text-sm">
                              <span className="text-brand-plum/70">{item.label}</span>
                              <strong className="rounded-md bg-brand-cream px-2 py-1 text-brand-plum">{item.points} pts</strong>
                            </li>
                          ))}
                        </motion.ul>
                      ) : null}
                    </AnimatePresence>
                  </div>

                  <div className="mb-8 rounded-2xl border border-brand-plum/10 bg-brand-plum/[0.03] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-plum/60">Social proof</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-plum shadow-sm">
                        Structured flow used daily
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-plum shadow-sm">
                        Consultation-ready summary export
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-plum shadow-sm">
                        Official-source first guidance
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full min-h-[48px] py-4 bg-brand-plum text-white font-bold rounded-xl shadow-lg shadow-brand-plum/30 hover:-translate-y-1 hover:bg-brand-rose transition-all duration-300 mb-4"
                    onClick={() => {
                      trackEvent("quiz_get_full_report_clicked", { points_score: quizResult?.score || 0 });
                      onGoToContact?.();
                    }}
                  >
                    Discuss these results with us
                  </button>

                  <div className="flex gap-2">
                    <button 
                      className="w-1/2 min-h-[48px] py-2.5 text-brand-plum/75 font-semibold bg-brand-cream/70 hover:bg-brand-cream rounded-lg transition-colors text-sm"
                      onClick={() => copySummaryToClipboard()}
                    >
                      {copySummaryState === "copied" ? "✓ Copied" : "Copy text"}
                    </button>
                    <button 
                      className="w-1/2 min-h-[48px] py-2.5 text-brand-rose font-semibold bg-brand-rose/10 hover:bg-brand-rose/20 rounded-lg transition-colors text-sm"
                      onClick={() => downloadSummaryFile()}
                    >
                      Save summary (.txt)
                    </button>
                  </div>
                  <p className="text-xs text-center text-brand-plum/45 mt-4 leading-relaxed">
                    Records are prefilled when contacting us. Not official migration advice.
                  </p>
                </div>
              ) : !quizComplete ? (
                <div className="text-center py-10 opacity-70">
                  <div className="w-16 h-16 mx-auto bg-brand-cream rounded-full flex items-center justify-center mb-4">
                     <span className="text-2xl opacity-30">🔒</span>
                  </div>
                  <h3 className="text-xl font-bold text-brand-plum mb-2">Build your profile</h3>
                  <p className="text-sm text-brand-plum/60 leading-relaxed max-w-xs mx-auto">
                    Complete each step on the left to unlock your estimated points, Skills in Demand context, and a 2026 market insight.
                  </p>
                </div>
              ) : null}

            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
