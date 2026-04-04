"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateQuizResult, quizOptions } from "@/lib/quiz";
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

  const quizResult = useMemo(() => calculateQuizResult(quizForm), [quizForm]);
  const currentQuizStep = quizSteps[quizStepIndex];
  const quizStepProgress = ((quizStepIndex + 1) / quizSteps.length) * 100;
  const canAdvance = currentQuizStep.fields.every((field) => fieldIsComplete(field, quizForm));
  const quizComplete = quizSteps.every((step) =>
    step.fields.every((field) => fieldIsComplete(field, quizForm))
  );

  useEffect(() => {
    if (!quizComplete) {
      setResultSkeletonActive(false);
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
      window.dispatchEvent(
        new CustomEvent("minrosh:navigator-summary", {
          detail: {
            summary,
            preferredCountry: "Australia",
            mainNeed: "Skilled Migration",
            quizSummaryShort: `Estimated points: ${quizResult.score}. ${quizResult.pointBreakdownText}. SID: ${quizResult.sidStreamLabel}.`,
          },
        })
      );
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

  return (
    <section id="quiz" className={`tab-panel ${isActive ? "is-active" : ""}`}>
      <div className="panel-hero">
        <div>
          <p className="section-label">2026 Points Wizard</p>
          <h2>Work through your profile in a ten-step assessment</h2>
          <p>
            This wizard is designed to feel closer to a real intake review while still remaining
            preliminary guidance. Always confirm points and eligibility against current Department of
            Home Affairs rules.
          </p>
        </div>
        <div className="current-step">
          <span>Active quiz step</span>
          <strong>{currentQuizStep.title}</strong>
          <p className="current-step__hint">
            This box mirrors the step on the left so you can see where you are in the sequence at a
            glance. It is not a separate question — it updates as you use Previous and Next.
          </p>
        </div>
      </div>

      <div className="quiz-shell">
        <section className="quiz-card bento-hover">
          <div className="quiz-wizard__meta">
            <div>
              <p className="section-label">{currentQuizStep.label}</p>
              <h3>{currentQuizStep.title}</h3>
            </div>
            <span className="quiz-wizard__count">
              {quizStepIndex + 1} / {quizSteps.length}
            </span>
          </div>

          <div className="quiz-progress" aria-hidden="true">
            <span className="quiz-progress__bar" style={{ width: `${quizStepProgress}%` }} />
          </div>

          <div className="quiz-step">
            <p className="quiz-step__prompt">{currentQuizStep.description}</p>

            {currentQuizStep.id === "basics" ? (
              <div className="quiz-step__stack">
                <label className="quiz-step__field">
                  <span>Occupation / Field</span>
                  <input
                    type="text"
                    value={quizForm.occupationName}
                    onChange={(event) => setQuizValue("occupationName", event.target.value)}
                    placeholder="e.g. Software Engineer"
                  />
                </label>
                <label className="quiz-step__field">
                  <span>Age</span>
                  <select
                    value={quizForm.age}
                    onChange={(event) => setQuizValue("age", event.target.value)}
                  >
                    <option value="">Choose one</option>
                    {quizOptions.age.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="quiz-options">
                  {quizOptions.occupationStatus.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`quiz-option ${
                        quizForm.occupation === option.value ? "is-selected" : ""
                      }`}
                      onClick={() => setQuizValue("occupation", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="quiz-step__prompt" style={{ marginTop: 20, marginBottom: 12 }}>
                  Which sector best describes your main occupation or training?
                </p>
                <div className="quiz-options">
                  {quizOptions.occupationSector.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`quiz-option ${
                        quizForm.occupationSector === option.value ? "is-selected" : ""
                      }`}
                      onClick={() => setQuizValue("occupationSector", option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {currentQuizStep.id === "english" ? (
              <div className="quiz-options">
                {quizOptions.english.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-option ${quizForm.english === option.value ? "is-selected" : ""}`}
                    onClick={() => setQuizValue("english", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {currentQuizStep.id === "work" ? (
              <div className="quiz-options">
                {quizOptions.overseasExperience.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-option ${
                      quizForm.overseasExperience === option.value ? "is-selected" : ""
                    }`}
                    onClick={() => setQuizValue("overseasExperience", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {currentQuizStep.id === "education" ? (
              <div className="quiz-options">
                {quizOptions.education.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-option ${quizForm.education === option.value ? "is-selected" : ""}`}
                    onClick={() => setQuizValue("education", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {currentQuizStep.id === "hybrid" ? (
              <div className="quiz-options">
                {quizOptions.hybridCapability.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-option ${
                      quizForm.hybridCapability === option.value ? "is-selected" : ""
                    }`}
                    onClick={() => setQuizValue("hybridCapability", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {currentQuizStep.id === "partner" ? (
              <div className="quiz-options">
                {quizOptions.partner.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-option ${quizForm.partner === option.value ? "is-selected" : ""}`}
                    onClick={() => setQuizValue("partner", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {currentQuizStep.id === "australiaWork" ? (
              <div className="quiz-options">
                {quizOptions.australianSkilled.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-option ${
                      quizForm.australianSkilled === option.value ? "is-selected" : ""
                    }`}
                    onClick={() => setQuizValue("australianSkilled", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {currentQuizStep.id === "readiness" ? (
              <div className="quiz-options">
                {quizOptions.skillsReadiness.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-option ${
                      quizForm.skillsReadiness === option.value ? "is-selected" : ""
                    }`}
                    onClick={() => setQuizValue("skillsReadiness", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {currentQuizStep.id === "sid" ? (
              <div className="quiz-options">
                {quizOptions.sidStream.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-option ${
                      quizForm.sidStream === option.value ? "is-selected" : ""
                    }`}
                    onClick={() => setQuizValue("sidStream", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {currentQuizStep.id === "planning" ? (
              <div className="quiz-options">
                {quizOptions.pathwayFocus.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`quiz-option ${
                      quizForm.pathwayFocus === option.value ? "is-selected" : ""
                    }`}
                    onClick={() => setQuizValue("pathwayFocus", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="quiz-wizard__actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={goToPreviousQuizStep}
              disabled={quizStepIndex === 0}
            >
              Previous
            </button>
            {quizStepIndex < quizSteps.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={goToNextQuizStep}
                disabled={!canAdvance}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onGoToContact?.()}
                disabled={!quizComplete}
              >
                Continue to Full Report
              </button>
            )}
          </div>
        </section>

        <aside
          className={`quiz-result bento-hover${quizResult && quizComplete && !resultSkeletonActive ? " quiz-result--revealed" : ""}`}
        >
          <p className="section-label">Result</p>
          {quizResult && quizComplete && resultSkeletonActive ? (
            resultSkeleton ?? <DefaultQuizResultSkeleton />
          ) : null}
          {quizResult && quizComplete && !resultSkeletonActive ? (
            <>
              <h3>
                {quizResult.restricted
                  ? "Alternative pathway review needed"
                  : `${quizResult.score} points estimated`}
              </h3>
              <div
                className={`quiz-traffic-light quiz-traffic-light--${quizResult.trafficLight}`}
                role="status"
                aria-label={`Priority status: ${quizResult.trafficLightLabel}`}
              >
                <span className="quiz-traffic-light__dot" aria-hidden="true" />
                <div>
                  <strong className="quiz-traffic-light__title">{quizResult.trafficLightLabel}</strong>
                  <p className="quiz-traffic-light__desc">{quizResult.trafficLightDescription}</p>
                </div>
              </div>
              {quizResult.greenPrioritySector ? (
                <p className="quiz-priority-badge" role="status">
                  2026 market · Green / priority occupation band
                </p>
              ) : null}
              <div
                className={`quiz-pathway-strength quiz-pathway-strength--${quizResult.pathwayStrengthBand}`}
                role="group"
                aria-label="Pathway strength indicator"
              >
                <span className="insight-card__badge">Pathway strength (illustrative)</span>
                <div className="quiz-pathway-strength__meter" aria-hidden="true">
                  <span
                    className="quiz-pathway-strength__fill"
                    style={{
                      width:
                        quizResult.pathwayStrengthBand === "elevated"
                          ? "92%"
                          : quizResult.pathwayStrengthBand === "strong"
                            ? "78%"
                            : quizResult.pathwayStrengthBand === "review"
                              ? "32%"
                              : "52%",
                    }}
                  />
                </div>
                <p className="quiz-pathway-strength__copy">{quizResult.pathwayStrengthLabel}</p>
              </div>
              <span className="quiz-sid-tag">
                SID: {quizResult.sidStreamLabel}
                {quizResult.goldenTicketSector && !quizResult.priorityProcessingBadge
                  ? " · National workforce priority sector"
                  : ""}
              </span>
              <ul className="result-list">
                {quizResult.messages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
              {quizResult.marketInsight ? (
                <div className="insight-card">
                  <span className="insight-card__badge">2026 Market Insight</span>
                  <p>{quizResult.marketInsight}</p>
                </div>
              ) : null}
              {quizResult.occupationRealismNote ? (
                <div className="insight-card insight-card--ict">
                  <span className="insight-card__badge">ICT invitation realism</span>
                  <p>{quizResult.occupationRealismNote}</p>
                </div>
              ) : null}
              <div className="points-breakdown">
                <h4>Points Breakdown</h4>
                <ul>
                  {quizResult.pointsBreakdown.map((item) => (
                    <li key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.points} pts</strong>
                    </li>
                  ))}
                </ul>
              </div>
              {quizResult.boosters.length ? (
                <div className="booster-card">
                  <h4>Path to PR</h4>
                  <ul className="result-list">
                    {quizResult.boosters.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {quizResult.scoreBoostChecklist?.length ? (
                <div className="booster-card booster-card--checklist">
                  <h4>Boost your indicative score</h4>
                  <p className="booster-card__note">
                    Illustrative only — confirm every item against current Department of Home Affairs rules and your
                    circumstances.
                  </p>
                  <ul className="result-list">
                    {quizResult.scoreBoostChecklist.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <button type="button" className="btn btn-primary" onClick={() => onGoToContact?.()}>
                Get Full Report
              </button>
            </>
          ) : !quizComplete ? (
            <>
              <h3>Build your profile</h3>
              <p>
                Complete each step to reveal your score, Skills in Demand (SID) context, a 2026 market
                insight, and a pathway improvement checklist.
              </p>
            </>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
