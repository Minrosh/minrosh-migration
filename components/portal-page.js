"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PublicFileImg } from "./public-file-img";
import { SiteTopbar } from "./site-topbar";
import { ContactChatPanel } from "./home/contact-chat-panel";
import { QuizWizardPanel } from "./home/quiz-wizard-panel";
import { QuizResultSkeleton } from "./home/quiz-result-skeleton";
import { StoriesCarouselPanel } from "./home/stories-carousel-panel";

const tabs = [
  { id: "home", label: "Home" },
  { id: "quiz", label: "Visa Quiz" },
  { id: "pathways", label: "PR Pathways" },
  { id: "services", label: "Services" },
  { id: "stories", label: "Success Stories" },
  { id: "contact", label: "Contact" },
];

/**
 * @param {{ siteData: object, newsData: object, footerStats: object, homeTab: import("react").ReactNode }} props
 */
export function PortalPage({ siteData, homeTab, footer }) {
  const [activeTab, setActiveTab] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerCompact, setHeaderCompact] = useState(false);
  const [selectedPathwayIndex, setSelectedPathwayIndex] = useState(0);
  const menuToggleRef = useRef(null);

  useEffect(() => {
    document.body.dataset.menu = menuOpen ? "open" : "closed";
    return () => {
      document.body.dataset.menu = "closed";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const first = document.getElementById("tab-home");
    window.requestAnimationFrame(() => first?.focus?.());
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        menuToggleRef.current?.focus?.();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    function handleScroll() {
      setHeaderCompact(window.scrollY > 18);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function syncTabWithHash() {
      const nextTab = window.location.hash.replace("#", "");
      if (tabs.some((tab) => tab.id === nextTab)) {
        setActiveTab(nextTab);
      }
    }

    syncTabWithHash();
    window.addEventListener("hashchange", syncTabWithHash);
    return () => window.removeEventListener("hashchange", syncTabWithHash);
  }, []);

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setMenuOpen(false);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/#${tabId}`);
    }
  }

  const pathwaysTab = (
    <section id="pathways" className={`tab-panel ${activeTab === "pathways" ? "is-active" : ""}`}>
      <div className="panel-hero">
        <div>
          <p className="section-label">5-Step Pathway to PR</p>
          <h2>A clearer journey from first review to visa lodgement</h2>
          <p className="panel-hero__sub">
            Select a step below to highlight it. Open “Read more” for longer on-page guidance (helpful
            for reading and search engines).
          </p>
        </div>
        <div className="current-step">
          <span>Highlighted pathway step</span>
          <strong>{siteData.pathwaySteps[selectedPathwayIndex]?.title}</strong>
          <p className="current-step__hint">
            This summary tracks whichever timeline card you last selected — use the numbered boxes to
            compare stages.
          </p>
        </div>
      </div>
      <div className="timeline">
        {siteData.pathwaySteps.map((step, index) => (
          <article
            key={step.title}
            className={`timeline-step bento-hover ${index === selectedPathwayIndex ? "is-current" : ""}`}
          >
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
    </section>
  );

  const servicesTab = (
    <section id="services" className={`tab-panel ${activeTab === "services" ? "is-active" : ""}`}>
      <div className="panel-hero">
        <div>
          <p className="section-label">Services</p>
          <h2>Support shaped around real migration decisions</h2>
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
    <div className="portal-shell">
      <SiteTopbar siteData={siteData} />
      <header
        className={`site-header site-header--backdrop site-header--backdrop-au ${headerCompact ? "is-compact" : ""}`}
      >
        <div className="site-header__inner">
          <button type="button" className="brand" onClick={() => handleTabChange("home")} aria-label="Open home tab">
            <span className="brand__mark" aria-hidden="true">
              <PublicFileImg src="/images/minrosh-logo.jpg" alt="" width={46} height={46} priority />
            </span>
            <span className="brand__text">
              <strong>{siteData.brand.name}</strong>
            </span>
          </button>
          <button
            ref={menuToggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen ? "true" : "false"}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() =>
              setMenuOpen((current) => {
                const next = !current;
                if (!next) {
                  window.requestAnimationFrame(() => menuToggleRef.current?.focus?.());
                }
                return next;
              })
            }
          >
            <span />
            <span />
          </button>
          <nav className={`site-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary">
            <div className="site-nav__group site-nav__group--main" role="tablist" aria-label="Site sections">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  className={`site-nav__link ${activeTab === tab.id ? "is-active" : ""}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="site-nav__group site-nav__group--actions">
              <button type="button" className="btn btn-primary site-nav__cta" onClick={() => handleTabChange("quiz")}>
                Check Eligibility
              </button>
              <Link href="/tools" className="btn btn-ghost site-nav__cta" onClick={() => setMenuOpen(false)}>
                Client tools
              </Link>
              <Link href="/book-consultation" className="btn btn-ghost site-nav__cta" onClick={() => setMenuOpen(false)}>
                Book consultation
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main id="main-content" className="portal-main">
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
        >
          {activeTab === "home" && homeTab}
          {activeTab === "quiz" && (
            <QuizWizardPanel
              isActive
              resultSkeleton={<QuizResultSkeleton />}
              onGoToContact={() => handleTabChange("contact")}
            />
          )}
          {activeTab === "pathways" && pathwaysTab}
          {activeTab === "services" && servicesTab}
          {activeTab === "stories" && (
            <StoriesCarouselPanel siteData={siteData} isActive />
          )}
          {activeTab === "contact" && <ContactChatPanel siteData={siteData} isActive />}
        </div>
      </main>

      {footer}

      <button type="button" className="mobile-sticky-cta" onClick={() => handleTabChange("quiz")}>
        Check Eligibility
      </button>
    </div>
  );
}
