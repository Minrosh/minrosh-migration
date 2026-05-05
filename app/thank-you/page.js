import Link from "next/link";
import siteData from "../../data/site.json";
import { SiteShell } from "../../components/site-shell";
import { buildMetadata } from "../../lib/seo";
import "../home.css";
import { CONVERSION_PREMIUM_PRIMARY_CTA_CLASS } from "@/lib/conversion-premium-cta-class";

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
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(139,29,65,0.12),transparent_55%),radial-gradient(circle_at_18%_28%,rgba(139,29,65,0.09),transparent_46%),radial-gradient(circle_at_82%_22%,rgba(202,166,77,0.14),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(251,246,244,0.9),transparent_48%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/55 to-transparent"
          aria-hidden
        />

        <div className="relative z-[1] mx-auto w-full max-w-lg text-center">
          <div
            className="glass-card rounded-[var(--radius-xl)] border-white/55 px-8 py-10 shadow-[var(--shadow-lux-lg)] backdrop-blur-[20px] backdrop-saturate-150 sm:px-12 sm:py-12"
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
            <h1 className="mb-3 text-balance font-bold tracking-[-0.035em] text-[var(--ink)] [font-family:var(--font-display),Georgia,serif] [font-size:clamp(1.55rem,3vw,2rem)]">
              Thank you
            </h1>
            <p className="mb-8 text-pretty leading-relaxed text-[var(--muted)]">
              We&apos;ve received your message. Our Brisbane-based registered migration team will reply during business
              hours (AEST) when you asked for a response. For urgent matters, use the phone number in the site footer.
            </p>
            <Link
              href="/"
              className={`${CONVERSION_PREMIUM_PRIMARY_CTA_CLASS} mx-auto w-full min-h-[52px] sm:min-w-[280px]`}
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
