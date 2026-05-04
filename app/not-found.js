import Link from "next/link";

function SkylineSilhouette() {
  return (
    <svg
      className="not-found-premium__skyline"
      viewBox="0 0 520 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="nf-sky" x1="0" y1="0" x2="520" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(139,29,65,0.15)" />
          <stop offset="1" stopColor="rgba(74,24,48,0.06)" />
        </linearGradient>
      </defs>
      <rect width="520" height="120" fill="url(#nf-sky)" />
      <path
        fill="rgba(74,24,48,0.35)"
        d="M0 118 L0 72 L28 58 L44 64 L62 48 L88 56 L104 38 L132 52 L156 34 L184 48 L210 28 L238 44 L268 22 L302 46 L328 30 L354 50 L382 36 L410 54 L438 40 L468 58 L492 44 L520 62 L520 118 Z"
      />
      <path fill="rgba(74,24,48,0.22)" d="M0 118 L0 88 L520 78 L520 118 Z" />
    </svg>
  );
}

export default function NotFound() {
  return (
    <main className="not-found-premium">
      <div className="not-found-premium__card">
        <SkylineSilhouette />
        <p className="not-found-premium__404" aria-hidden="true">
          404
        </p>
        <p className="section-label">Page not found</p>
        <h1>That page isn&apos;t available right now.</h1>
        <p>
          Return to the MinRosh portal to continue with the pathway questionnaire, visa hubs, or contact options.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary min-h-[48px] rounded-full px-6">
            Go to homepage
          </Link>
          <Link href="/contact" className="btn btn-ghost min-h-[48px] rounded-full px-6">
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}
