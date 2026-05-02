import Link from "next/link";

/** Stable hub order for international positioning */
const DESTINATION_KEYS = ["australia", "canada", "uk", "nz"];

export function HomeDestinationCards({ countries }) {
  const cards = DESTINATION_KEYS.map((key) => {
    const c = countries?.[key];
    if (!c?.hubHref) return null;
    return { key, title: c.title, copy: c.copy, href: c.hubHref };
  }).filter(Boolean);

  return (
    <section className="home-section bg-white" aria-labelledby="home-destinations-heading">
      <div className="mx-auto min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="home-destinations-heading"
          className="text-center text-2xl font-black tracking-tight text-brand-plum sm:text-3xl md:text-4xl"
        >
          Four destination hubs
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-sm font-medium leading-relaxed text-brand-plum/70 sm:text-base">
          Structured guidance for Australia, Canada, the United Kingdom and New Zealand—whether you are in South Asia,
          elsewhere offshore or already in-country. Always verify current rules on each country&apos;s official
          immigration websites.
        </p>

        <ul className="mt-8 grid min-w-0 list-none grid-cols-1 gap-6 pl-0 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {cards.map((card) => (
            <li key={card.key} className="min-w-0">
              <Link
                href={card.href}
                className="group flex h-full min-h-[48px] flex-col rounded-2xl border border-brand-plum/10 bg-brand-cream/25 p-6 shadow-sm transition-all hover:border-brand-rose/25 hover:bg-brand-cream/40 hover:shadow-md sm:p-6"
              >
                <h3 className="text-lg font-black text-brand-plum group-hover:text-brand-rose">{card.title}</h3>
                <p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-brand-plum/65">{card.copy}</p>
                <span className="mt-5 inline-flex min-h-[48px] items-center font-black text-brand-plum underline decoration-2 underline-offset-4 group-hover:text-brand-rose">
                  Open hub <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
