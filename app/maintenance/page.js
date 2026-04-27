import Link from "next/link";

export const metadata = {
  title: "Upgrading for a better experience",
  description:
    "MinRosh Migration is briefly upgrading the website. Please check back shortly or contact the team directly.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#fbf8f4] px-6 py-16 text-[#241033] sm:px-10"
    >
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#8f2f64]">
          MinRosh Migration
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Upgrading for a better experience
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4c344d]">
          We are making a short website update. The site should be available again soon, and your
          migration planning can continue from the same pages once the update is complete.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="tel:+61478100542"
            className="rounded-lg bg-[#4b1640] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#36102e] focus:outline-none focus:ring-2 focus:ring-[#8f2f64] focus:ring-offset-2"
          >
            Call 0478 100 542
          </Link>
          <Link
            href="mailto:info@minroshmigration.com.au"
            className="rounded-lg border border-[#8f2f64] px-5 py-3 text-sm font-semibold text-[#4b1640] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#8f2f64] focus:ring-offset-2"
          >
            Email the team
          </Link>
        </div>
        <p className="mt-8 text-sm leading-6 text-[#6c5969]">
          If you were submitting a form, please wait a minute and try again so your information is
          saved correctly.
        </p>
      </section>
    </main>
  );
}
