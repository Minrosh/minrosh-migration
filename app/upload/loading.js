export default function UploadLoading() {
  return (
    <div className="loading-screen" role="status" aria-live="polite" aria-busy="true">
      <section className="loading-screen__card">
        <div className="loading-screen__copy">
          <p className="loading-screen__eyebrow">Secure upload</p>
          <p className="loading-screen__title">Preparing your document portal</p>
          <p>Setting up secure token validation and upload workflows.</p>
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
