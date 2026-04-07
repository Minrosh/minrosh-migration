import { PublicFileImg } from "../components/public-file-img";

export default function Loading() {
  return (
    <main className="loading-screen" aria-label="Loading MinRosh Migration">
      <section className="loading-screen__card">
        <div className="loading-screen__mark">
          <PublicFileImg
            src="/images/minrosh-logo.svg"
            alt="MinRosh Migration logo"
            width={72}
            height={72}
            priority
          />
        </div>
        <div className="loading-screen__copy">
          <p className="loading-screen__eyebrow">MinRosh Migration</p>
          <h1>Preparing your migration portal</h1>
          <p>
            Loading guidance, pathways, and consultation tools so the page feels complete before
            you begin.
          </p>
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
