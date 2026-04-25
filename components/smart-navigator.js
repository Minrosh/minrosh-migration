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

  const currentStep = navigatorSteps[stepIndex];
  const progress = ((stepIndex + 1) / (navigatorSteps.length + 1)) * 100;
  const complete = navigatorSteps.every((step) => answers[step.id]) && Boolean(answers.email);
  const recommendation = useMemo(
    () => (complete ? buildNavigatorRecommendation(answers) : null),
    [answers, complete]
  );

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
  }, [answers, recommendation]);

  function selectAnswer(value) {
    setAnswers((current) => ({ ...current, [currentStep.id]: value }));
  }

  function handleEmailSubmit(e) {
    e.preventDefault();
    const email = new FormData(e.target).get("email");
    if (email) {
      const emailStr = String(email);
      setAnswers((current) => ({ ...current, email: emailStr }));
      trackEvent("ai_funnel_lead_captured", { email: emailStr, country: answers.country, goal: answers.goal });
    }
  }

  const isEmailStep = stepIndex === navigatorSteps.length;

  return (
    <section className="navigator-section">
      <div className="section-head">
        <div>
          <p className="section-label">Smart Navigator</p>
          <h2>{title}</h2>
        </div>
        <p className="process-section__lead">{description}</p>
      </div>
      {intentHint ? (
        <p className="mt-2 rounded-xl border border-brand-rose/25 bg-brand-rose/10 px-3 py-2 text-sm text-brand-plum/80">
          Using your typed intent: <strong>{intentHint}</strong>
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
              <label className="block text-sm font-semibold text-brand-plum mb-2">
                Your Email Address
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
                We&apos;ll securely send you a copy of your personalised AI pathway analysis.
              </p>
            </form>
          )}

          <div className="quiz-wizard__actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
              disabled={stepIndex === 0}
            >
              Back
            </button>
            {!isEmailStep ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  setStepIndex((current) => current + 1)
                }
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
              >
                {primaryLabel}
              </Link>
            )}
          </div>
          </section>
        </div>

        <div className="rounded-[2rem] border border-white/60 bg-white/75 backdrop-blur-md shadow-xl p-3 sm:p-4">
          <aside className="quiz-result bento-hover">
          <p className="section-label">Personalised result</p>
          {recommendation ? (
            <>
              <h3>{recommendation.title}</h3>
              <p>{recommendation.summary}</p>
              <div className="insight-card">
                <span className="insight-card__badge">Urgency</span>
                <p>{recommendation.urgency}</p>
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
                <Link href={recommendation.href} className="btn btn-primary">
                  {recommendation.cta}
                </Link>
                <Link href={finalHref} className="btn btn-ghost">
                  Book Consultation
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3>Build your pathway summary</h3>
              <p>
                This expanded navigator now looks at country, goal, timing, support preference, and
                profile confidence to recommend the strongest next step.
              </p>
            </>
          )}
          </aside>
        </div>
      </div>
    </section>
  );
}
