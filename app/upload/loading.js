export default function UploadLoading() {
  return (
    <main className="loading-screen" aria-label="Loading secure upload portal">
      <section className="loading-screen__card">
        <div className="loading-screen__copy">
          <p className="loading-screen__eyebrow">Secure upload</p>
          <h1>Preparing your document portal</h1>
          <p>Setting up secure token validation and upload workflows.</p>
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
