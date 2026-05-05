import Link from "next/link";
import siteData from "../../data/site.json";
import { SiteShell } from "../../components/site-shell";
import { buildMetadata } from "../../lib/seo";

const PLUM_MID = "#8B1D41";

export const metadata = buildMetadata({
  title: "Thank you | MinRosh Migration",
  description:
    "Your enquiry or subscription was received. Brisbane-based MinRosh Migration will follow up during business hours.",
  path: "/thank-you",
  robots: { index: false, follow: true },
});

export default function ThankYouPage() {
  return (
    <SiteShell siteData={siteData} currentPath="/thank-you" headerBackdrop="neutral">
      <main className="relative flex min-h-[min(92vh,900px)] w-full flex-col items-center justify-center overflow-hidden bg-[var(--brand-cream)] px-5 py-16 sm:px-8 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(139,29,65,0.08),transparent_42%),radial-gradient(circle_at_82%_18%,rgba(202,166,77,0.1),transparent_38%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/50 to-transparent"
          aria-hidden
        />

        <div className="relative z-[1] mx-auto w-full max-w-lg text-center">
          <div
            className="rounded-[var(--radius-xl)] border border-white/60 bg-white/70 px-8 py-10 shadow-[var(--shadow-lux-lg)] backdrop-blur-[20px] backdrop-saturate-150 sm:px-12 sm:py-12"
            style={{ WebkitBackdropFilter: "blur(20px) saturate(160%)" }}
          >
            <div
              className="mx-auto mb-6 flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border-2 border-[rgba(139,29,65,0.18)] bg-[var(--premium-icon-bg)] text-[color:var(--brand-rose)]"
              aria-hidden
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 7L10 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="mb-3 text-balance font-bold tracking-[-0.035em] text-[var(--ink)] [font-size:clamp(1.55rem,3vw,2rem)]">
              Thank you
            </h1>
            <p className="mb-8 text-pretty leading-relaxed text-[var(--muted)]">
              We&apos;ve received your message. If you requested a response, our Brisbane team will reply during
              business hours (AEST). For urgent matters you can still reach us via the phone number in the site footer.
            </p>
            <Link
              href="/"
              className="home-hero-premium__cta inline-flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-white px-7 py-3.5 text-center text-base font-bold text-white shadow-[0_14px_36px_rgba(136,19,55,0.28)] outline-none ring-offset-2 ring-offset-[var(--brand-cream)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(136,19,55,0.35)] focus-visible:ring-2 focus-visible:ring-[#881337]/45 sm:mx-auto sm:w-auto sm:min-w-[280px]"
              style={{ backgroundColor: PLUM_MID }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
