import Link from "next/link";
import { PublicFileImg } from "./public-file-img";

/** Stable hub order for international positioning */
const DESTINATION_KEYS = ["australia", "canada", "uk", "nz"];

/** Landmark-forward art direction — reuse strip crops where dedicated shots are not stored yet */
const CARD_MEDIA = {
  australia: {
    src: "/images/hero-sydney-real.v2.webp",
    alt: "Sydney Harbour including the Opera House and waterfront",
    imgClass: "object-cover object-[center_58%]",
  },
  canada: {
    src: "/images/visual-strip-destinations.jpg",
    alt: "Urban skylines representing Canadian destinations",
    imgClass: "object-cover object-[18%_center]",
  },
  uk: {
    src: "/images/visual-strip-destinations.jpg",
    alt: "Urban skylines representing United Kingdom destinations",
    imgClass: "object-cover object-[52%_center]",
  },
  nz: {
    src: "/images/visual-strip-destinations.jpg",
    alt: "Coastal city skylines representing New Zealand destinations",
    imgClass: "object-cover object-[88%_center]",
  },
};

export function HomeDestinationCards({ countries }) {
  const cards = DESTINATION_KEYS.map((key) => {
    const c = countries?.[key];
    if (!c?.hubHref) return null;
    return { key, title: c.title, copy: c.copy, href: c.hubHref };
  }).filter(Boolean);

  return (
    <section className="home-section bg-[#FBF6F4]/80" aria-labelledby="home-destinations-heading">
      <div className="mx-auto min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.28em] text-brand-rose">
          Pathways to your future
        </p>
        <h2
          id="home-destinations-heading"
          className="mt-3 text-center text-2xl font-bold tracking-tight text-[#1f1020] sm:text-3xl md:text-[2.15rem]"
          style={{ fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif" }}
        >
          Destinations we help you reach
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-center text-sm font-medium leading-relaxed text-[#1f1020]/72 sm:text-base">
          Structured hubs for Australia, Canada, the United Kingdom and New Zealand—whether you are in South Asia,
          elsewhere offshore or already in-country. Always verify current rules on each government immigration site.
        </p>

        <ul className="mt-10 grid min-w-0 list-none grid-cols-1 gap-7 pl-0 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {cards.map((card) => {
            const media = CARD_MEDIA[card.key];
            return (
              <li key={card.key} className="min-w-0">
                <Link
                  href={card.href}
                  className="group flex h-full min-h-[48px] flex-col overflow-hidden rounded-[1.75rem] border border-brand-plum/10 bg-white shadow-[var(--shadow-lux)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-rose/25 hover:shadow-[var(--shadow-lux-lg)]"
                >
                  <div className="relative aspect-[4/3] w-full min-h-[11rem] overflow-hidden bg-zinc-100">
                    <PublicFileImg
                      src={media.src}
                      alt={media.alt}
                      width={800}
                      height={600}
                      className={`absolute inset-0 h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04] ${media.imgClass}`}
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-[#1f1020]/55 via-transparent to-transparent opacity-80"
                      aria-hidden
                    />
                    <p className="absolute bottom-3 left-4 right-4 text-lg font-bold text-white drop-shadow-sm">
                      {card.title}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="flex-1 text-sm font-medium leading-relaxed text-[#1f1020]/72">{card.copy}</p>
                    <span className="mt-5 inline-flex min-h-[44px] items-center text-sm font-bold text-[#881337] underline decoration-2 underline-offset-[6px] transition-colors group-hover:text-[#6f0f2d]">
                      Explore hub <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
