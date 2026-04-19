import Link from "next/link";

const PATHWAY_PILLS = [
  { label: "Skilled", href: "/skilled-migration" },
  { label: "Employer-sponsored", href: "/employer-sponsored-visas" },
  { label: "Student", href: "/student-visa-australia" },
  { label: "Partner & family", href: "/partner-visa-australia" },
  { label: "Visitor", href: "/visitor-visas" },
  { label: "Official visa list", href: "/australian-visas-official-sources" },
];

const TRUST_CHIPS = [
  { label: "Verify on Home Affairs", href: "/australian-visas-official-sources" },
  { label: "Structured sequencing", href: "/#pathways" },
  { label: "Consultation-ready", href: "/book-consultation" },
];

/**
 * Trip Zant–inspired discovery band: headline, horizontal category pills, and a single
 * elevated “search” card — adapted for migration pathways (not travel booking).
 */
export function HomeDiscoverStrip() {
  return (
    <section
      className="relative isolate overflow-hidden border-b border-brand-plum/8 bg-gradient-to-b from-white via-zinc-50/80 to-brand-cream/50 px-4 py-10 sm:px-6 md:py-14"
      aria-labelledby="home-discover-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(155,74,108,0.08),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_50%,rgba(202,166,77,0.06),transparent_50%)]"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-rose">Explore pathways</p>
          <h2
            id="home-discover-heading"
            className="text-balance text-3xl font-extrabold tracking-tight text-brand-plum sm:text-4xl md:text-5xl"
          >
            Discover your clearest next step
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-brand-plum/75 sm:text-lg">
            Browse visa topics the way a travel hub surfaces flights and stays — then match your situation with the Smart
            Navigator or book a consultation.
          </p>
        </div>

        <nav className="mt-8 flex flex-wrap justify-center gap-2 md:mt-10" aria-label="Popular visa topics">
          {PATHWAY_PILLS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-[40px] items-center rounded-full border border-brand-plum/12 bg-white/95 px-4 py-2 text-sm font-semibold text-brand-plum/90 shadow-sm shadow-brand-plum/5 outline-none ring-offset-2 ring-offset-white transition hover:-translate-y-0.5 hover:border-brand-rose/35 hover:bg-brand-cream/80 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-rose/40"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mx-auto mt-10 max-w-3xl md:mt-12">
          <div className="rounded-[1.75rem] border border-brand-plum/10 bg-white p-1 shadow-[0_24px_64px_-14px_rgba(61,36,50,0.14)] sm:p-1.5">
            <div className="flex rounded-[1.35rem] bg-zinc-100/90 p-1 sm:mx-0">
              <Link
                href="/#quiz"
                className="flex-1 rounded-[1.1rem] bg-white px-3 py-2.5 text-center text-sm font-bold text-brand-plum shadow-sm outline-none ring-offset-2 ring-offset-white transition hover:text-brand-rose focus-visible:ring-2 focus-visible:ring-brand-rose/40 sm:py-3"
              >
                Pathway quiz
              </Link>
              <Link
                href="/assessment"
                className="flex-1 rounded-[1.1rem] px-3 py-2.5 text-center text-sm font-semibold text-brand-plum/65 outline-none ring-offset-2 ring-offset-zinc-100 transition hover:bg-white/70 hover:text-brand-plum focus-visible:ring-2 focus-visible:ring-brand-rose/40 sm:py-3"
              >
                Free assessment
              </Link>
            </div>

            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
              <div className="flex min-h-[52px] flex-1 items-center gap-3 rounded-2xl border border-brand-plum/10 bg-brand-cream/40 px-4 py-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-rose shadow-inner"
                  aria-hidden
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                  </svg>
                </span>
                <p className="text-left text-sm leading-snug text-brand-plum/70">
                  <span className="font-semibold text-brand-plum">Try:</span>{" "}
                  <span className="italic">&ldquo;Skilled visa after study in Australia&rdquo;</span> or{" "}
                  <span className="italic">&ldquo;Partner onshore with a previous refusal&rdquo;</span>
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
                <Link
                  href="/#smart-navigator"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-center text-sm font-semibold text-white no-underline shadow-md shadow-orange-500/25 outline-none ring-offset-2 ring-offset-white transition hover:bg-orange-400 hover:no-underline focus-visible:ring-2 focus-visible:ring-orange-300"
                >
                  Run Smart Navigator
                </Link>
                <Link
                  href="/book-consultation"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-brand-plum/15 bg-white px-5 py-3 text-center text-sm font-semibold text-brand-plum no-underline outline-none ring-offset-2 ring-offset-white transition hover:border-brand-rose/30 hover:bg-brand-cream focus-visible:ring-2 focus-visible:ring-brand-rose/40"
                >
                  Book consultation
                </Link>
              </div>
            </div>
          </div>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-brand-plum/55 md:mt-10">
          {TRUST_CHIPS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="underline-offset-4 transition hover:text-brand-rose hover:underline">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
