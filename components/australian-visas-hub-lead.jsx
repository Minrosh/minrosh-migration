import Link from "next/link";

const PATHWAY_LINKS = [
  {
    href: "/skilled-migration",
    title: "Skilled migration",
    body: "Points-tested subclasses (189/190/491), competitiveness and sequencing.",
  },
  {
    href: "/student-visa-australia",
    title: "Student visas",
    body: "Subclass 500 planning: Genuine Student factors and documents.",
  },
  {
    href: "/partner-visa-australia",
    title: "Partner & family",
    body: "Relationship evidence, onshore/offshore sequencing.",
  },
  {
    href: "/employer-sponsored-visas",
    title: "Employer-sponsored",
    body: "Sponsorship pathways where employer-backed routes fit.",
  },
  {
    href: "/visitor-visas",
    title: "Visitor visas",
    body: "Short stays with clear purpose and clean paperwork.",
  },
  {
    href: "/visa-services",
    title: "All visa services",
    body: "Overview of how MinRosh scopes each pathway type.",
  },
];

export function AustralianVisasHubLead() {
  return (
    <section
      className="rounded-[2rem] border border-brand-plum/10 bg-gradient-to-b from-brand-cream/95 via-[#fffefb] to-white px-5 py-8 shadow-[var(--shadow-soft)] sm:px-8 sm:py-10"
      aria-labelledby="aus-visas-pathways-heading"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-rose">Australian pathways</p>
          <h2
            id="aus-visas-pathways-heading"
            className="mt-2 text-2xl font-black tracking-tight text-brand-plum sm:text-3xl"
          >
            Choose your route — then verify on Home Affairs
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-brand-plum/70 sm:text-base">
            Official visa listings stay authoritative. These hubs explain sequencing and evidence in plain language before you lodge.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link
            href="/book-consultation"
            className="btn btn-primary inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-full px-5 text-center transition-all hover:-translate-y-0.5"
          >
            Book consultation
          </Link>
          <Link
            href="/assessment"
            className="btn btn-ghost inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-full px-5 text-center transition-all hover:-translate-y-0.5"
          >
            Free assessment
          </Link>
        </div>
      </div>

      <ul className="mt-8 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {PATHWAY_LINKS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex h-full min-h-[140px] flex-col rounded-2xl border border-brand-plum/10 bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#881337]/28 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#881337]/35 focus-visible:ring-offset-2 sm:p-6"
            >
              <span className="text-[11px] font-black uppercase tracking-wider text-[#881337]/85 transition-colors group-hover:text-[#881337]">
                Guide hub →
              </span>
              <span className="mt-2 text-lg font-black tracking-tight text-brand-plum">{item.title}</span>
              <span className="mt-2 flex-1 text-sm font-medium leading-relaxed text-brand-plum/65">{item.body}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
