/**
 * Placeholder UI while the quiz “finishes computing” — improves perceived responsiveness.
 */
export function QuizResultSkeleton() {
  return (
    <div className="quiz-result-skeleton" aria-busy="true" aria-label="Calculating your result">
      <div className="quiz-result-skeleton__pulse quiz-result-skeleton__title" />
      <div className="quiz-result-skeleton__traffic" aria-hidden="true">
        <div className="quiz-result-skeleton__pulse quiz-result-skeleton__traffic-dot" />
        <div className="quiz-result-skeleton__traffic-copy">
          <div className="quiz-result-skeleton__pulse quiz-result-skeleton__line quiz-result-skeleton__line--mid" />
          <div className="quiz-result-skeleton__pulse quiz-result-skeleton__line quiz-result-skeleton__line--short" />
        </div>
      </div>
      <div className="quiz-result-skeleton__lines">
        <div className="quiz-result-skeleton__pulse quiz-result-skeleton__line" />
        <div className="quiz-result-skeleton__pulse quiz-result-skeleton__line quiz-result-skeleton__line--mid" />
        <div className="quiz-result-skeleton__pulse quiz-result-skeleton__line quiz-result-skeleton__line--short" />
      </div>
      <div className="quiz-result-skeleton__breakdown">
        <div className="quiz-result-skeleton__pulse quiz-result-skeleton__bar" />
        <div className="quiz-result-skeleton__pulse quiz-result-skeleton__bar" />
        <div className="quiz-result-skeleton__pulse quiz-result-skeleton__bar quiz-result-skeleton__bar--short" />
      </div>
    </div>
  );
}
