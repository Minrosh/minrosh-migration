"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

const CITIZENSHIP_OPTIONS = [
  { id: "au", label: "Australia (citizen / PR)" },
  { id: "nz", label: "New Zealand" },
  { id: "uk", label: "United Kingdom" },
  { id: "ca", label: "Canada" },
  { id: "lk_sa", label: "Sri Lanka & South Asia" },
  { id: "other", label: "Other / multiple passports" },
];

const GOAL_OPTIONS = [
  { id: "skilled", label: "Skilled migration", href: "/skilled-migration" },
  { id: "employer", label: "Employer-sponsored", href: "/employer-sponsored-visas" },
  { id: "student", label: "Study in Australia", href: "/student-visa-australia" },
  { id: "partner", label: "Partner & family", href: "/partner-visa-australia" },
  { id: "visitor", label: "Visitor visa", href: "/visitor-visas" },
  { id: "unsure", label: "Not sure yet", href: null },
];

const TIMING_OPTIONS = [
  { id: "soon", label: "Ready to move within a month" },
  { id: "quarter", label: "Roughly 1–3 months" },
  { id: "explore", label: "Still exploring options" },
  { id: "private", label: "Prefer not to say" },
];

const TRUST_CHIPS = [
  { label: "Verify on Home Affairs", href: "/australian-visas-official-sources" },
  { label: "Structured sequencing", href: "/#pathways" },
  { label: "Consultation-ready", href: "/book-consultation" },
];

const LAST_QUESTION_STEP = 3;
const RESULT_STEP = 4;

/**
 * Glass eligibility card overlapping the dark hero and the light band below.
 */
export function HomeEligibilityWizard() {
  const [step, setStep] = useState(0);
  const [citizenship, setCitizenship] = useState("");
  const [goal, setGoal] = useState("");
  const [timing, setTiming] = useState("");

  const goalMeta = useMemo(() => GOAL_OPTIONS.find((g) => g.id === goal), [goal]);
  const citizenshipLabel = useMemo(
    () => CITIZENSHIP_OPTIONS.find((c) => c.id === citizenship)?.label ?? "",
    [citizenship]
  );
  const timingLabel = useMemo(() => TIMING_OPTIONS.find((t) => t.id === timing)?.label ?? "", [timing]);

  const goNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, RESULT_STEP));
  }, []);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setStep(0);
    setCitizenship("");
    setGoal("");
    setTiming("");
  }, []);

  const goToSmartNavigator = useCallback((event) => {
    event.preventDefault();
    const href = "/#smart-navigator";
    if (window.location.pathname !== "/") {
      window.location.href = href;
      return;
    }
    window.history.replaceState(null, "", href);
    window.dispatchEvent(new CustomEvent("minrosh-hashnav"));
    document.getElementById("smart-navigator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="home-eligibility-wizard" aria-labelledby="home-eligibility-wizard-title">
      <div className="home-eligibility-wizard__card">
        <div className="home-eligibility-wizard__card-inner">
          <div className="home-eligibility-wizard__top">
            <p className="home-eligibility-wizard__eyebrow">Check eligibility & direction</p>
            <h2 id="home-eligibility-wizard-title" className="home-eligibility-wizard__title">
              {step === 0 ? "Discover your clearest next step" : step === RESULT_STEP ? "Your next moves" : "A few quick questions"}
            </h2>
            <p className="home-eligibility-wizard__subtitle">
              {step === 0
                ? "No long forms — three quick choices, then we suggest the best next page or tool."
                : step === RESULT_STEP
                  ? "General guidance only — confirm everything on official sources before you lodge."
                  : `Question ${step} of ${LAST_QUESTION_STEP}`}
            </p>
            {step > 0 && step <= LAST_QUESTION_STEP ? (
              <div className="home-eligibility-wizard__progress" aria-hidden>
                {Array.from({ length: LAST_QUESTION_STEP }).map((_, i) => (
                  <span
                    key={i}
                    className={`home-eligibility-wizard__dot ${step > i + 1 ? "is-done" : ""} ${step === i + 1 ? "is-current" : ""}`}
                  />
                ))}
              </div>
            ) : step === RESULT_STEP ? (
              <div className="home-eligibility-wizard__progress home-eligibility-wizard__progress--done" aria-hidden>
                {Array.from({ length: LAST_QUESTION_STEP }).map((_, i) => (
                  <span key={i} className="home-eligibility-wizard__dot is-done" />
                ))}
              </div>
            ) : (
              <div className="home-eligibility-wizard__progress" aria-hidden>
                {Array.from({ length: LAST_QUESTION_STEP }).map((_, i) => (
                  <span key={i} className="home-eligibility-wizard__dot" />
                ))}
              </div>
            )}
          </div>

          <div className="home-eligibility-wizard__body">
            {step === 0 ? (
              <div className="home-eligibility-wizard__step">
                <p className="home-eligibility-wizard__question">What would you like to do first?</p>
                <div className="home-eligibility-wizard__actions-row">
                  <button type="button" className="home-eligibility-wizard__btn-primary" onClick={() => setStep(1)}>
                    Start eligibility check
                  </button>
                  <Link href="/#smart-navigator" onClick={goToSmartNavigator} className="home-eligibility-wizard__btn-secondary">
                    Jump to Smart Navigator
                  </Link>
                </div>
                <p className="home-eligibility-wizard__hint text-center">
                  Or go straight to{" "}
                  <Link href="/assessment" className="home-eligibility-wizard__link">
                    Free assessment
                  </Link>{" "}
                  /{" "}
                  <Link href="/#quiz" className="home-eligibility-wizard__link">
                    Pathway quiz
                  </Link>
                  .
                </p>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="home-eligibility-wizard__step">
                <p className="home-eligibility-wizard__question" id="q-citizenship">
                  What is your main citizenship or passport region?
                </p>
                <p className="home-eligibility-wizard__helper" id="q-citizenship-h">
                  Used for orientation only — eligibility always depends on your full profile and current rules.
                </p>
                <div className="home-eligibility-wizard__chip-grid" role="group" aria-labelledby="q-citizenship" aria-describedby="q-citizenship-h">
                  {CITIZENSHIP_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`home-eligibility-wizard__chip ${citizenship === opt.id ? "is-selected" : ""}`}
                      onClick={() => setCitizenship(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="home-eligibility-wizard__step">
                <p className="home-eligibility-wizard__question" id="q-goal">
                  What is your main migration goal right now?
                </p>
                <div className="home-eligibility-wizard__chip-grid" role="group" aria-labelledby="q-goal">
                  {GOAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`home-eligibility-wizard__chip ${goal === opt.id ? "is-selected" : ""}`}
                      onClick={() => setGoal(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="home-eligibility-wizard__step">
                <p className="home-eligibility-wizard__question" id="q-timing">
                  How soon are you hoping to take the next step?
                </p>
                <div className="home-eligibility-wizard__chip-grid" role="group" aria-labelledby="q-timing">
                  {TIMING_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`home-eligibility-wizard__chip ${timing === opt.id ? "is-selected" : ""}`}
                      onClick={() => setTiming(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="home-eligibility-wizard__step home-eligibility-wizard__step--result">
                <p className="home-eligibility-wizard__result-lead">Here&apos;s a sensible sequence for you</p>
                <p className="home-eligibility-wizard__result-copy">
                  <strong>{citizenshipLabel}</strong>
                  {goalMeta ? (
                    <>
                      {" "}
                      · goal: <strong>{goalMeta.label}</strong>
                    </>
                  ) : null}
                  {timingLabel ? (
                    <>
                      {" "}
                      · timing: <strong>{timingLabel}</strong>
                    </>
                  ) : null}
                  . Use the navigator for a shortlist, the quiz if points are in scope, assessment for a fuller picture, or
                  book when you want a case conversation.
                </p>
                <div className="home-eligibility-wizard__result-ctas">
                  <Link
                    href="/#smart-navigator"
                    onClick={goToSmartNavigator}
                    className="home-eligibility-wizard__cta home-eligibility-wizard__cta--primary"
                  >
                    Run Smart Navigator
                  </Link>
                  <Link href="/#quiz" className="home-eligibility-wizard__cta home-eligibility-wizard__cta--ghost">
                    Open pathway quiz
                  </Link>
                  <Link href="/assessment" className="home-eligibility-wizard__cta home-eligibility-wizard__cta--ghost">
                    Free assessment
                  </Link>
                  <Link href="/book-consultation" className="home-eligibility-wizard__cta home-eligibility-wizard__cta--ghost">
                    Book consultation
                  </Link>
                </div>
                {goalMeta?.href ? (
                  <p className="home-eligibility-wizard__result-page">
                    <Link href={goalMeta.href} className="home-eligibility-wizard__link">
                      Read the full {goalMeta.label} page →
                    </Link>
                  </p>
                ) : null}
                <ul className="home-eligibility-wizard__trust" aria-label="Quick trust links">
                  {TRUST_CHIPS.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
                <button type="button" className="home-eligibility-wizard__restart" onClick={reset}>
                  Start over
                </button>
              </div>
            ) : null}
          </div>

          {step > 0 && step < RESULT_STEP ? (
            <div className="home-eligibility-wizard__footer">
              <button type="button" className="home-eligibility-wizard__nav-btn" onClick={goBack}>
                Back
              </button>
              <button
                type="button"
                className="home-eligibility-wizard__nav-btn home-eligibility-wizard__nav-btn--next"
                onClick={goNext}
                disabled={(step === 1 && !citizenship) || (step === 2 && !goal) || (step === 3 && !timing)}
              >
                Continue
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
