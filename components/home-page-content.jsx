"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { QuizWizardPanel } from "./home/quiz-wizard-panel";
import { QuizResultSkeleton } from "./home/quiz-result-skeleton";
import { StoriesCarouselPanel } from "./home/stories-carousel-panel";

const TAB_IDS = new Set(["home", "quiz", "pathways", "services", "stories"]);

function tabFromHash(hash) {
  if (!hash || hash === "#" || hash === "#home") return "home";
  const id = hash.replace(/^#/, "");
  return TAB_IDS.has(id) ? id : "home";
}

/**
 * Homepage body: hash-driven tab panels so global {@link SiteHeaderNav} links like /#quiz work.
 * Rendered inside {@link SiteShell} (single global header on all routes).
 */
export function HomePageContent({ siteData, homeTab }) {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedPathwayIndex, setSelectedPathwayIndex] = useState(0);

  useLayoutEffect(() => {
    function sync() {
      const h = typeof window !== "undefined" ? window.location.hash : "";
      const tab = tabFromHash(h);
      setActiveTab(tab);
      if (typeof window === "undefined") return;
      const rawId = h.replace(/^#/, "");
      const anchorEl = rawId ? document.getElementById(rawId) : null;
      window.requestAnimationFrame(() => {
        if (rawId && anchorEl && !TAB_IDS.has(rawId)) {
          anchorEl.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        const id = tab === "home" ? "home" : tab;
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("minrosh-hashnav", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("minrosh-hashnav", sync);
    };
  }, []);

  const pathwaysPanel = (
    <section
      id="pathways"
      className={`tab-panel pathways-panel-dark bg-brand-plum pt-32 text-white ${activeTab === "pathways" ? "is-active" : ""}`}
      aria-hidden={activeTab !== "pathways"}
    >
      <div className="pathways-z-layout mx-auto max-w-7xl px-4 py-12 md:py-24 lg:grid-cols-[2fr_3fr]">
        <div className="pathways-z-layout__copy pathways-z-layout__copy--sticky">
          <p className="section-label pathways-panel-dark__label">
            5-Step Pathway to <span className="text-brand-gold">PR</span>
          </p>
          <h2>
            A clearer journey from <span className="text-brand-gold">first review</span> to visa lodgement
          </h2>
          <p className="panel-hero__sub pathways-panel-dark__sub">
            Select a step below to highlight it. Open “Read more” for longer on-page guidance (helpful for reading and
            search engines).
          </p>
          <Link
            href="/book-consultation"
            className="pathways-z-layout__cta inline-flex items-center gap-2 rounded-full border border-brand-gold/55 bg-white/10 px-5 py-2.5 text-sm font-extrabold text-brand-gold transition hover:bg-white/15"
          >
            Learn more <span aria-hidden>→</span>
          </Link>
          <div className="current-step pathways-panel-dark__current mt-8">
            <span>Highlighted pathway step</span>
            <strong>{siteData.pathwaySteps[selectedPathwayIndex]?.title}</strong>
            <p className="current-step__hint pathways-panel-dark__hint">
              This summary tracks whichever timeline card you last selected — use the numbered boxes to compare stages.
            </p>
          </div>
        </div>
        <div className="pathways-z-layout__rail">
          <div className="timeline pathways-panel-dark__timeline">
            {siteData.pathwaySteps.map((step, index) => (
              <article
                key={step.title}
                className={`timeline-step bento-hover ${index === selectedPathwayIndex ? "is-current" : ""}`}
              >
                <span className="timeline-step__bg-number" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  className="timeline-step__hit"
                  onClick={() => setSelectedPathwayIndex(index)}
                  aria-current={index === selectedPathwayIndex ? "step" : undefined}
                >
                  <span className="timeline-step__number">{index + 1}</span>
                  <span className="timeline-step__text">
                    <span className="timeline-step__title">{step.title}</span>
                    <span className="timeline-step__desc">{step.description}</span>
                  </span>
                </button>
                {step.detail ? (
                  <details className="timeline-step__details">
                    <summary className="timeline-step__summary">Read more about this stage</summary>
                    <div className="timeline-step__expanded">
                      <p>{step.detail}</p>
                      {step.officialHref ? (
                        <p className="timeline-step__official">
                          <a href={step.officialHref} target="_blank" rel="noreferrer">
                            {step.officialLabel || "Official information"}
                          </a>
                        </p>
                      ) : null}
                    </div>
                  </details>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const servicesPanel = (
    <section
      id="services"
      className={`tab-panel bg-white px-4 py-12 md:py-24 ${activeTab === "services" ? "is-active" : ""}`}
      aria-hidden={activeTab !== "services"}
    >
      <div className="panel-hero">
        <div>
          <p className="section-label">Services</p>
          <h2>
            Support shaped around real migration <span className="text-brand-gold">decisions</span>
          </h2>
        </div>
      </div>
      <div className="services-layout">
        {siteData.services.map((service) => (
          <Link key={service.title} href={service.href} className="service-block bento-hover service-block__link">
            <span className="service-block__eyebrow">Specialist Pathway</span>
            <h3>{service.title}</h3>
            <p>{service.summary}</p>
            <ul className="feature-list">
              {service.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <span className="service-block__linkline">
              Learn more <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <div className="portal-main bg-brand-cream/40">
      <section
        id="home"
        className={`tab-panel ${activeTab === "home" ? "is-active" : ""}`}
        aria-hidden={activeTab !== "home"}
      >
        {homeTab}
      </section>

      <QuizWizardPanel
        isActive={activeTab === "quiz"}
        resultSkeleton={<QuizResultSkeleton />}
        onGoToContact={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/contact";
          }
        }}
      />

      {pathwaysPanel}
      {servicesPanel}

      <StoriesCarouselPanel siteData={siteData} isActive={activeTab === "stories"} />
    </div>
  );
}
