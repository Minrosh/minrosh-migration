export default function ImmigrationNewsLoading() {
  return (
    <main id="main-content" className="loading-screen" aria-label="Loading immigration news">
      <section className="loading-screen__card">
        <div className="loading-screen__copy">
          <p className="loading-screen__eyebrow">Immigration news</p>
          <h1>Loading latest policy updates</h1>
          <p>Fetching curated migration updates, timelines, and official references.</p>
        </div>
        <div className="loading-screen__skeleton" aria-hidden="true">
          <span className="loading-screen__line loading-screen__line--lg" />
          <span className="loading-screen__line loading-screen__line--md" />
          <span className="loading-screen__line loading-screen__line--sm" />
        </div>
      </section>
    </main>
  );
}
