export default function DestinationsLoading() {
  return (
    <div className="loading-screen" role="status" aria-live="polite" aria-busy="true">
      <section className="loading-screen__card">
        <div className="loading-screen__copy">
          <p className="loading-screen__eyebrow">Global pathways</p>
          <p className="loading-screen__title">Preparing destination guidance</p>
          <p>Loading route-specific migration content, official resources, and next-step actions.</p>
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
