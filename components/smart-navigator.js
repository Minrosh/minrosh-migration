"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  buildNavigatorRecommendation,
  navigatorSteps,
  navigatorSummaryText,
} from "../lib/navigator";

export function SmartNavigator({
  title = "Answer a few questions and get routed to the most relevant next step",
  description = "This guided assessment uses your goal, timing, and support preference to point you toward the right MinRosh pathway before consultation.",
  primaryLabel = "Continue",
  finalHref = "/book-consultation",
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentStep = navigatorSteps[stepIndex];
  const progress = ((stepIndex + 1) / navigatorSteps.length) * 100;
  const complete = navigatorSteps.every((step) => answers[step.id]);
  const recommendation = useMemo(
    () => (complete ? buildNavigatorRecommendation(answers) : null),
    [answers, complete]
  );

  useEffect(() => {
    if (!recommendation || typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("minrosh:navigator-summary", {
        detail: {
          summary: navigatorSummaryText(answers, recommendation),
          preferredCountry: answers.country,
          mainNeed: recommendation.mainNeed,
        },
      })
    );
  }, [answers, recommendation]);

  function selectAnswer(value) {
    setAnswers((current) => ({ ...current, [currentStep.id]: value }));
  }

  return (
    <section className="navigator-section">
      <div className="section-head">
        <div>
          <p className="section-label">Smart Navigator</p>
          <h2>{title}</h2>
        </div>
        <p className="process-section__lead">{description}</p>
      </div>

      <div className="quiz-shell">
        <section className="quiz-card bento-hover">
          <div className="quiz-wizard__meta">
            <div>
              <p className="section-label">Step {stepIndex + 1}</p>
              <h3>{currentStep.title}</h3>
            </div>
            <span className="quiz-wizard__count">
              {stepIndex + 1} / {navigatorSteps.length}
            </span>
          </div>

          <div className="quiz-progress" aria-hidden="true">
            <span className="quiz-progress__bar" style={{ width: `${progress}%` }} />
          </div>

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

          <div className="quiz-wizard__actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
              disabled={stepIndex === 0}
            >
              Back
            </button>
            {stepIndex < navigatorSteps.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  setStepIndex((current) => Math.min(current + 1, navigatorSteps.length - 1))
                }
                disabled={!answers[currentStep.id]}
              >
                Next
              </button>
            ) : (
              <Link
                href={complete ? recommendation.href : finalHref}
                className={`btn btn-primary ${!complete ? "is-disabled" : ""}`}
                aria-disabled={!complete}
                onClick={(event) => {
                  if (!complete) {
                    event.preventDefault();
                  }
                }}
              >
                {primaryLabel}
              </Link>
            )}
          </div>
        </section>

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
    </section>
  );
}
