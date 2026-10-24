export default function ImmigrationNewsLoading() {
  return (
    <div className="loading-screen" role="status" aria-live="polite" aria-busy="true">
      <section className="loading-screen__card">
        <div className="loading-screen__copy">
          <p className="loading-screen__eyebrow">Immigration news</p>
          <p className="loading-screen__title">Loading latest policy updates</p>
          <p>Fetching curated migration updates, timelines, and official references.</p>
        </div>
        <div className="loading-screen__skeleton" aria-hidden="true">
          <span className="loading-screen__line loading-screen__line--lg" />
          <span className="loading-screen__line loading-screen__line--md" />
          <span className="loading-screen__line loading-screen__line--sm" />
        </div>
      </section>
    </div>
  );
}
