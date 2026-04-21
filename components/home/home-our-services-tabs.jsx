"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const TABS = [
  { id: "all", label: "All pathways" },
  { id: "skilled", label: "Skilled & work" },
  { id: "life", label: "Study & family" },
  { id: "resources", label: "Official sources" },
];

function serviceMatchesTab(href, tabId) {
  if (tabId === "all") return true;
  if (tabId === "skilled") return href.includes("skilled-migration") || href.includes("employer-sponsored");
  if (tabId === "life")
    return (
      href.includes("student-visa") || href.includes("partner-visa") || href.includes("visitor-visas")
    );
  if (tabId === "resources") return href.includes("australian-visas-official");
  return true;
}

function iconForHref(href) {
  if (href.includes("skilled-migration")) return "🧭";
  if (href.includes("employer-sponsored")) return "🏢";
  if (href.includes("student-visa")) return "🎓";
  if (href.includes("partner-visa")) return "🤝";
  if (href.includes("visitor-visas")) return "✈️";
  return "📋";
}

/**
 * Premium “switchboard” for home service cards: tab strip + stable-height panels.
 */
export function HomeOurServicesTabs({ services, visualHighlights }) {
  const [active, setActive] = useState("all");

  const list = useMemo(
    () => (Array.isArray(services) ? services.filter((s) => serviceMatchesTab(s.href, active)) : []),
    [services, active]
  );

  const highlights = Array.isArray(visualHighlights) ? visualHighlights : [];

  return (
    <div className="home-our-services-tabs">
      <div className="home-our-services-tabs__intro-z grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className="home-our-services-tabs__intro max-w-4xl">
          <p className="home-our-services-tabs__eyebrow">How we help</p>
          <h2 className="home-our-services-tabs__title">
            Migration services in <span className="text-brand-gold">Brisbane</span> — structured for clarity
          </h2>
          <p className="home-our-services-tabs__lead home-prose-calm">
            Looking for a migration agent in Australia? We help you compare pathways, reduce refusal risk, and move with a
            clearer plan — with consultation-ready next steps.
          </p>
          <p className="home-our-services-tabs__sub home-prose-calm">
            Skilled, partner, student, employer-sponsored, visitor, and official-source guidance — filtered below without
            leaving the page.
          </p>
          <Link
            href="/book-consultation"
            className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-brand-rose underline decoration-brand-rose/35 underline-offset-4 transition hover:text-brand-plum hover:decoration-brand-plum/40"
          >
            Learn more <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="relative aspect-[4/3] min-h-[200px] w-full overflow-hidden rounded-2xl border border-brand-plum/10 shadow-lg lg:min-h-[260px]">
          <Image
            src="/images/brisbane-skyline.jpg"
            alt="Brisbane river and skyline"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </div>
      </div>

      <div className="home-our-services-tabs__tablist-wrap" role="tablist" aria-label="Filter services by topic">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`home-svc-tab-${tab.id}`}
              aria-controls={`home-svc-panel-${tab.id}`}
              className={`home-our-services-tabs__tab ${isActive ? "is-active" : ""}`}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className="home-our-services-tabs__panels"
        role="tabpanel"
        id={`home-svc-panel-${active}`}
        aria-labelledby={`home-svc-tab-${active}`}
      >
        <div className="home-our-services-tabs__panel-inner">
          {list.length ? (
            <div className="home-our-services-tabs__grid">
              {list.map((service) => {
                const idx = Math.max(0, services.findIndex((s) => s.href === service.href));
                const mod = highlights.length ? idx % highlights.length : 0;
                const highlight = highlights[mod] ?? highlights[0];
                if (!highlight) return null;
                return (
                  <article
                    key={service.href}
                    className="group relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-xl shadow-brand-plum/10 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-brand-gold/60 hover:shadow-2xl hover:shadow-brand-plum/20"
                  >
                    <Link
                      href={service.href}
                      className="relative z-0 flex h-full min-h-0 flex-1 flex-col rounded-3xl no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream"
                    >
                      <div className="relative h-52 shrink-0 overflow-hidden bg-brand-cream">
                        <span
                          className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 text-xl shadow-md transition duration-300 ease-out group-hover:scale-110"
                          aria-hidden
                        >
                          {iconForHref(service.href)}
                        </span>
                        <Image
                          src={highlight.src}
                          alt={highlight.alt}
                          width={1400}
                          height={1000}
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                        />
                      </div>

                      <div className="flex min-h-0 flex-1 flex-col justify-between p-6 sm:p-7">
                        <div className="min-h-0 flex-1">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-gold">{highlight.title}</p>
                          <h3 className="mb-3 text-xl font-extrabold leading-snug tracking-tight text-brand-plum sm:text-2xl">
                            {service.title}
                          </h3>
                          <p className="mb-4 rounded-r-lg border-l-2 border-brand-gold bg-brand-cream/60 py-1 pl-3 text-sm italic leading-relaxed text-brand-plum/60">
                            &ldquo;{highlight.caption}&rdquo;
                          </p>
                          <p className="text-[0.94rem] font-normal leading-relaxed text-brand-plum/65">{service.summary}</p>
                        </div>
                        <div className="mt-auto flex items-center pt-5 text-sm font-bold tracking-wide text-brand-rose transition group-hover:text-brand-plum">
                          Learn more
                          <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                            →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="home-prose-calm py-10 text-center">No services in this filter — try another tab.</p>
          )}
        </div>
      </div>
    </div>
  );
}
