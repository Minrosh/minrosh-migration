import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <div className="not-found__card">
        <p className="section-label">Page not found</p>
        <h1>That page isn&apos;t available right now.</h1>
        <p>
          Return to the MinRosh portal to continue with the visa quiz, pathway overview, or
          contact form.
        </p>
        <Link href="/" className="btn btn-primary">
          Go to homepage
        </Link>
      </div>
    </main>
  );
}
