import Link from "next/link";
import siteData from "../../data/site.json";
import { SiteShell } from "../../components/site-shell";
import { buildMetadata } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Thank you | MinRosh Migration",
  description:
    "Your enquiry or subscription was received. The MinRosh Migration team will follow up during business hours.",
  path: "/thank-you",
  robots: { index: false, follow: true },
});

export default function ThankYouPage() {
  return (
    <SiteShell siteData={siteData} currentPath="/thank-you" headerBackdrop="neutral">
      <div className="thank-you-page">
        <div className="thank-you-page__card">
          <div className="thank-you-page__check" aria-hidden>
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
          <h1>Thank you</h1>
          <p>
            We&apos;ve received your message. If you requested a response, our team will reply during business hours
            (AEST). For urgent matters you can still reach us via the phone number in the site footer.
          </p>
          <Link href="/" className="btn btn-primary inline-flex min-h-[48px] items-center justify-center rounded-full px-8">
            Back to home
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
