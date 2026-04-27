import Link from "next/link";
import { NewsletterUnsubscribeClient } from "@/components/newsletter-unsubscribe-client";

export const metadata = {
  title: "Unsubscribe | MinRosh Migration",
  robots: { index: false, follow: false },
};

export default async function NewsletterUnsubscribePage({ searchParams }) {
  const sp = await searchParams;
  const ok = sp?.ok === "1";
  const already = sp?.already === "1";
  const err = sp?.error === "1";
  const reason = String(sp?.reason || "");

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Marketing emails</h1>
      {ok ? (
        already ? (
          <p className="mt-4 text-muted-foreground">
            This email was already unsubscribed from our marketing list. No further newsletter-style messages will be
            sent unless you subscribe again.
          </p>
        ) : (
          <p className="mt-4 text-muted-foreground">
            You have been removed from our marketing list. You will not receive further newsletter-style messages
            unless you subscribe again.
          </p>
        )
      ) : err ? (
        reason === "rate_limited" ? (
          <p className="mt-4 text-muted-foreground">
            Too many unsubscribe attempts were detected from your connection. Please wait a few minutes and try the
            link again.
          </p>
        ) : reason === "missing_token" ? (
          <p className="mt-4 text-muted-foreground">
            This unsubscribe link is incomplete. Please open the full link from your email, or paste the token below.
          </p>
        ) : (
          <p className="mt-4 text-muted-foreground">
            That unsubscribe link is invalid or has already been used. If you still receive emails, please contact us.
          </p>
        )
      ) : (
        <p className="mt-4 text-muted-foreground">
          Use the link in your email, or enter the unsubscribe token from that link below.
        </p>
      )}
      <NewsletterUnsubscribeClient />
      <p className="mt-8 text-sm text-muted-foreground">
        This applies to newsletter/marketing messages only — not personal correspondence about a visa matter you have
        already started with us.
      </p>
      <p className="mt-4 text-sm">
        <Link href="/" className="underline">
          Back to home
        </Link>
      </p>
    </main>
  );
}
