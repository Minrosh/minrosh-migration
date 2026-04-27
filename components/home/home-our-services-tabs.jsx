"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import decisionSignals from "../../data/home-services-decision-signals.json";

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
  const [expandedHref, setExpandedHref] = useState("");

  const list = useMemo(() => (Array.isArray(services) ? services : []), [services]);

  const highlights = Array.isArray(visualHighlights) ? visualHighlights : [];
  const confidenceStrip = Array.isArray(decisionSignals?.confidenceStrip) ? decisionSignals.confidenceStrip : [];
  const disclosureStages = Array.isArray(decisionSignals?.disclosureStages) ? decisionSignals.disclosureStages : [];
  const expandedIndex = list.findIndex((item) => item.href === expandedHref);
  const stageIndex = expandedIndex >= 0 ? 2 : 0;
  const activeStage = disclosureStages[stageIndex] || disclosureStages[0];

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

      <div className="home-our-services-tabs__panels">
        <div className="home-our-services-tabs__panel-inner">
          {confidenceStrip.length ? (
            <div className="mb-4 grid gap-2 sm:grid-cols-3" aria-label="Service decision confidence signals">
              {confidenceStrip.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-brand-plum/15 bg-white/75 px-4 py-3 shadow-sm backdrop-blur"
                >
                  <p className="text-sm font-bold text-brand-plum">{item.value}</p>
                  <p className="text-xs text-brand-ink/80">{item.label}</p>
                </div>
              ))}
            </div>
          ) : null}
          {activeStage ? (
            <div className="mb-5 rounded-2xl border border-brand-gold/30 bg-brand-gold/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-plum">Progressive disclosure</p>
              <p className="mt-1 text-sm font-semibold text-brand-ink">{activeStage.title}</p>
              <p className="mt-1 text-sm text-brand-ink/80">{activeStage.description}</p>
            </div>
          ) : null}
          {list.length ? (
            <div className="home-our-services-tabs__grid">
              {list.map((service) => {
                const idx = Math.max(0, list.findIndex((s) => s.href === service.href));
                const mod = highlights.length ? idx % highlights.length : 0;
                const highlight = highlights[mod] ?? highlights[0];
                if (!highlight) return null;
                return (
                  <article
                    key={service.href}
                    className="group relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl border border-white/30 bg-white/40 shadow-xl shadow-brand-plum/20 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-brand-gold/60 hover:shadow-2xl hover:shadow-brand-plum/30"
                  >
                    <Link
                      href={service.href}
                      className="relative z-0 flex h-full min-h-0 flex-1 flex-col rounded-3xl no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cream"
                    >
                        <div className="absolute inset-0 z-0 overflow-hidden">
                        <Image
                          src={highlight.src}
                          alt={highlight.alt}
                          width={1400}
                          height={1000}
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="h-full w-full object-cover blur-[2px] transition duration-500 ease-out group-hover:scale-105 group-hover:blur-0"
                        />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/65 to-black/20" aria-hidden />
                      </div>
                      <div className="relative h-52 shrink-0 overflow-hidden">
                        <span
                          className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 text-xl shadow-md transition duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-1"
                          aria-hidden
                        >
                          {iconForHref(service.href)}
                        </span>
                      </div>

                      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between p-6 sm:p-7">
                        <div className="min-h-0 flex-1">
                          <div className="rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-sm">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-gold">{highlight.title}</p>
                          <h3 className="mb-3 text-xl font-extrabold leading-snug tracking-tight text-white sm:text-2xl">
                            {service.title}
                          </h3>
                          <p className="mb-4 rounded-r-lg border-l-2 border-brand-gold bg-black/35 py-1 pl-3 text-sm italic leading-relaxed text-white/90">
                            &ldquo;{highlight.caption}&rdquo;
                          </p>
                          <p className="text-[0.94rem] font-normal leading-relaxed text-white/90">{service.summary}</p>
                          <button
                            type="button"
                            className="mt-3 min-h-[48px] rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-brand-gold transition hover:bg-black/40"
                            onClick={(event) => {
                              event.preventDefault();
                              setExpandedHref((current) => (current === service.href ? "" : service.href));
                            }}
                          >
                            {expandedHref === service.href ? "Hide deep details" : "Reveal deep details"}
                          </button>
                          {expandedHref === service.href ? (
                            <ul className="mt-2 space-y-1 text-sm text-white/85">
                              {service.highlights.slice(0, 4).map((item) => (
                                <li key={item}>• {item}</li>
                              ))}
                            </ul>
                          ) : null}
                          </div>
                        </div>
                        <div className="mt-auto flex items-center pt-5 text-sm font-bold tracking-wide text-brand-gold transition group-hover:text-white">
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
