export default function DestinationsLoading() {
  return (
    <main id="main-content" className="loading-screen" aria-label="Loading destination content">
      <section className="loading-screen__card">
        <div className="loading-screen__copy">
          <p className="loading-screen__eyebrow">Global pathways</p>
          <h1>Preparing destination guidance</h1>
          <p>Loading route-specific migration content, official resources, and next-step actions.</p>
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
