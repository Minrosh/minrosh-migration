"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  buildNavigatorRecommendation,
  navigatorSteps,
  navigatorSummaryText,
} from "../lib/navigator";
import { persistNavigatorSummary } from "@/lib/navigator-session";
import { trackEvent } from "@/lib/client-analytics";

export function SmartNavigator({
  title = "Answer a few questions and get routed to the most relevant next step",
  description = "This guided assessment uses your goal, timing, and support preference to point you toward the right MinRosh pathway before consultation.",
  primaryLabel = "Continue",
  finalHref = "/book-consultation",
}) {
  const searchParams = useSearchParams();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [intentHint, setIntentHint] = useState("");
  const [dailyUsageCount, setDailyUsageCount] = useState(null);

  const currentStep = navigatorSteps[stepIndex];
  const progress = ((stepIndex + 1) / (navigatorSteps.length + 1)) * 100;
  const complete = navigatorSteps.every((step) => answers[step.id]) && Boolean(answers.email);
  const recommendation = useMemo(
    () => (complete ? buildNavigatorRecommendation(answers) : null),
    [answers, complete]
  );

  useEffect(() => {
    // Track when the navigator is first viewed
    trackEvent("ai_navigator_started", { path: window.location.pathname });
    setDailyUsageCount(14);
  }, []);

  useEffect(() => {
    const query = String(searchParams?.get("q") || "").trim();
    if (!query) return;
    setIntentHint(query);
    setStepIndex((current) => (current === 0 ? 1 : current));
  }, [searchParams]);

  useEffect(() => {
    if (!recommendation || typeof window === "undefined") {
      return;
    }

    const summary = navigatorSummaryText(answers, recommendation);
    const quizSummaryShort = `Smart Navigator: ${answers.country} · ${answers.goal} · ${answers.timeline} · ${recommendation.mainNeed}.`;
    const detail = {
      summary,
      quizSummaryShort,
      preferredCountry: answers.country,
      mainNeed: recommendation.mainNeed,
    };
    persistNavigatorSummary(detail);
    window.dispatchEvent(new CustomEvent("minrosh:navigator-summary", { detail }));
    
    // Track when results are successfully generated
    trackEvent("ai_navigator_results_generated", {
      main_need: recommendation.mainNeed,
      confidence: recommendation.confidenceScore
    });
  }, [answers, recommendation]);

  function selectAnswer(value) {
    const stepId = currentStep.id;
    setAnswers((current) => ({ ...current, [stepId]: value }));
    trackEvent("ai_navigator_step_completed", { step: stepId, value });
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    const email = new FormData(e.target).get("email");
    if (email) {
      const emailStr = String(email);
      setAnswers((current) => ({ ...current, email: emailStr }));
      trackEvent("ai_navigator_email_captured", { 
        email: emailStr, 
        country: answers.country, 
        goal: answers.goal 
      });
      trackEvent("ai_funnel_lead_captured", { email: emailStr, country: answers.country, goal: answers.goal });

      // Persist lead to CRM
      try {
        fetch("/api/ai-funnel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailStr,
            country: answers.country,
            goal: answers.goal,
            answers: answers,
            insights: {
              why: recommendation?.why,
              risks: recommendation?.risks,
              timelineExpectation: recommendation?.timelineExpectation
            }
          })
        });
      } catch (err) {
        console.error("Failed to persist lead:", err);
      }
    }
  }

  const isEmailStep = stepIndex === navigatorSteps.length;

  return (
    <section className="navigator-section">
      <div className="section-head">
        <div>
          <p className="section-label">Visa Decision Engine</p>
          <h2>{title}</h2>
        </div>
        <p className="process-section__lead">{description}</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-xs font-bold text-brand-plum/60 uppercase tracking-wider">
            {(dailyUsageCount ?? 0) > 0
              ? `${dailyUsageCount} people used this navigator today`
              : "Navigator activity updates after load"}
          </p>
        </div>
      </div>
      {intentHint ? (
        <p className="mt-2 rounded-xl border border-brand-rose/25 bg-brand-rose/10 px-3 py-2 text-sm text-brand-plum/80">
          Analysing intent: <strong>{intentHint}</strong>
        </p>
      ) : null}

      <div className="quiz-shell">
        <div className="rounded-[2rem] border border-white/60 bg-white/75 backdrop-blur-md shadow-xl p-3 sm:p-4">
          <section className="quiz-card bento-hover">
          <div className="quiz-wizard__meta">
            <div>
              <p className="section-label">Step {stepIndex + 1}</p>
              <h3>{isEmailStep ? "Where should we send your pathway results?" : currentStep.title}</h3>
            </div>
            <span className="quiz-wizard__count">
              {stepIndex + 1} / {navigatorSteps.length + 1}
            </span>
          </div>

          <div className="quiz-progress" aria-hidden="true">
            <span className="quiz-progress__bar" style={{ width: `${progress}%` }} />
          </div>

          {!isEmailStep ? (
            <div className="quiz-options">
              {currentStep.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`quiz-option ${answers[currentStep.id] === option ? "is-selected" : ""}`}
                  onClick={() => selectAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="my-6">
              <div className="mb-6 p-4 rounded-2xl bg-brand-plum/5 border border-brand-plum/10 border-dashed text-center">
                 <p className="text-[0.6rem] uppercase tracking-widest font-bold text-brand-plum/40 mb-2">Preliminary Assessment</p>
                 <p className="text-sm font-bold text-brand-plum mb-1">
                   Primary Pathway identified: <span className="text-brand-rose">{recommendation?.title || "Calculating..."}</span>
                 </p>
                 <p className="text-xs text-brand-plum/60 italic">
                   We&apos;ve generated your confidence score and alternative roadmap.
                 </p>
              </div>
              <label className="block text-sm font-semibold text-brand-plum mb-2">
                Where should we send your full analysis?
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-brand-plum/20 bg-white/50 px-4 py-3 text-brand-plum focus:border-brand-rose focus:outline-none focus:ring-1 focus:ring-brand-rose"
                defaultValue={answers.email || ""}
              />
              <p className="text-xs text-brand-plum/60 mt-3">
                We&apos;ll securely send your personalised AI pathway analysis and confidence report.
              </p>
            </form>
          )}

          <div className="quiz-wizard__actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setStepIndex((current) => Math.max(current - 1, 0));
                trackEvent("ai_navigator_back_clicked", { from_step: stepIndex });
              }}
              disabled={stepIndex === 0}
            >
              Back
            </button>
            {!isEmailStep ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setStepIndex((current) => current + 1);
                  trackEvent("ai_navigator_next_clicked", { from_step: stepIndex });
                }}
                disabled={!answers[currentStep.id]}
              >
                Next
              </button>
            ) : !complete ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const form = document.querySelector('form');
                  if (form) form.requestSubmit();
                }}
              >
                See Results
              </button>
            ) : (
              <Link
                href={recommendation?.href || finalHref}
                className="btn btn-primary"
                onClick={() => trackEvent("ai_navigator_primary_cta_clicked", { need: recommendation?.mainNeed })}
              >
                {primaryLabel}
              </Link>
            )}
          </div>
          </section>
        </div>

        <div className="rounded-[2rem] border border-white/60 bg-white/75 backdrop-blur-md shadow-xl p-3 sm:p-4">
          <aside className="quiz-result bento-hover">
          <p className="section-label">Analysis Result</p>
          {recommendation ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="mb-0">{recommendation.title}</h3>
                <div className="flex flex-col items-end">
                  <span className="text-[0.65rem] uppercase tracking-wider font-bold text-brand-plum/40">Confidence</span>
                  <span className="text-xl font-display font-bold text-brand-rose">{recommendation.confidenceScore}%</span>
                </div>
              </div>
              
              <p>{recommendation.summary}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                <div className="p-3 rounded-xl border border-brand-plum/10 bg-brand-cream/20">
                  <span className="text-[0.65rem] uppercase tracking-wider font-bold text-brand-plum/50 block mb-1">Why this result?</span>
                  <ul className="text-[0.65rem] leading-tight space-y-1 text-brand-plum/70">
                    {recommendation.why.map((w) => <li key={w}>• {w}</li>)}
                  </ul>
                </div>
                <div className="p-3 rounded-xl border border-brand-rose/10 bg-brand-rose/5">
                  <span className="text-[0.65rem] uppercase tracking-wider font-bold text-brand-rose/60 block mb-1">Risk Factors</span>
                  <ul className="text-[0.65rem] leading-tight space-y-1 text-brand-rose/80">
                    {recommendation.risks.map((r) => <li key={r}>• {r}</li>)}
                  </ul>
                </div>
              </div>

              {recommendation.alternative && (
                <div className="mt-3 p-3 rounded-xl border border-brand-plum/10 bg-white/50">
                  <span className="text-[0.65rem] uppercase tracking-wider font-bold text-brand-plum/50 block mb-1">Alternative Pathway</span>
                  <p className="text-[0.7rem] font-semibold text-brand-plum mb-0">
                    {recommendation.alternative.need} <span className="font-normal text-brand-plum/60">— {recommendation.alternative.reason}</span>
                  </p>
                </div>
              )}

              <div className="mt-3 p-3 rounded-xl border border-brand-plum/10 bg-brand-plum/5">
                <span className="text-[0.65rem] uppercase tracking-wider font-bold text-brand-plum/50 block mb-1">Adaptive Strategy (AI v3)</span>
                <p className="text-[0.7rem] font-bold text-brand-plum mb-1">
                  Hybrid: <span className="font-normal">{recommendation.hybridPathway}</span>
                </p>
                <p className="text-[0.7rem] font-bold text-brand-plum mb-0">
                  Backup: <span className="font-normal">{recommendation.backupStrategy.need} ({recommendation.backupStrategy.reason})</span>
                </p>
              </div>

              <div className="insight-card mt-6">
                <span className="insight-card__badge">Urgency & Timeline</span>
                <p className="font-bold text-brand-plum mb-1">{recommendation.urgency}</p>
                <p className="text-[0.7rem] text-brand-plum/60">Estimated: {recommendation.timelineExpectation}</p>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 opacity-40">
                 <span className="h-1.5 w-1.5 rounded-full bg-brand-plum" />
                 <span className="text-[0.6rem] uppercase tracking-tighter font-bold">Calibration Active</span>
              </div>
              
              <div className="navigator-result__notes">
                <p>{recommendation.profileNote}</p>
                <p>{recommendation.supportNote}</p>
              </div>

              <div className="points-breakdown">
                <h4>Prepare before you speak with us</h4>
                <ul>
                  {recommendation.prep.map((item) => (
                    <li key={item}>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="navigator-result__next">{recommendation.next}</p>
              <div className="content-aside-card__actions">
                <Link href={recommendation.href} className="btn btn-primary" onClick={() => trackEvent("ai_navigator_view_pathway_clicked")}>
                  {recommendation.cta}
                </Link>
                <Link href={finalHref} className="btn btn-ghost" onClick={() => trackEvent("ai_navigator_book_consult_clicked")}>
                  Book Consultation
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3>Build your pathway summary</h3>
              <p>
                The Visa Decision Engine uses your profile, timeline, and goals to generate a 
                confidence-scored migration roadmap.
              </p>
              <div className="mt-8 space-y-4 opacity-40 grayscale pointer-events-none">
                 <div className="h-4 w-3/4 bg-brand-plum/10 rounded" />
                 <div className="h-4 w-1/2 bg-brand-plum/10 rounded" />
                 <div className="h-24 bg-brand-plum/5 rounded-2xl" />
              </div>
            </>
          )}
          </aside>
        </div>
      </div>
    </section>
  );
}
