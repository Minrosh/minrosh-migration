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
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-24">
        <p className="section-label text-brand-gold">Global pathways</p>
        <h2 className="text-white">
          Explore your migration direction with a <span className="text-brand-gold">quick strategic view</span>
        </h2>
        <p className="mt-4 max-w-3xl text-white/80">
          Start with a quick dashboard preview on home, then jump to the full global pathways deep-dive for detailed country strategy, timelines, and official links.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {siteData.pathwaySteps.slice(0, 3).map((step) => (
            <article key={step.title} className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-white/80">{step.description}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/global-pathways" className="btn btn-primary">
            View global strategy
          </Link>
          <Link href="/book-consultation" className="btn btn-ghost">
            Book consultation
          </Link>
        </div>
      </div>
    </section>
  );

  const servicesPanel = (
    <section
      id="services"
      className={`tab-panel bg-white py-12 md:py-24 ${activeTab === "services" ? "is-active" : ""}`}
      aria-hidden={activeTab !== "services"}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="panel-hero">
          <div>
          <p className="section-label">Services</p>
          <h2>
            Choose a pathway category, then <span className="text-brand-gold">explore the full guide</span>
          </h2>
          <p className="mt-4 max-w-3xl">
            High-level overview on home. Full subclass detail, evidence planning, and process guidance now live on dedicated pages.
          </p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              title: "Skilled",
              href: "/visa-services#skilled",
              image: "/images/brisbane-aerial.png",
            },
            {
              title: "Family",
              href: "/visa-services#family",
              image: "/images/brisbane-riverwalk.png",
            },
            {
              title: "Employer",
              href: "/visa-services#employer",
              image: "/images/brisbane-nightlagoon.png",
            },
          ].map((panel) => (
            <Link
              key={panel.title}
              href={panel.href}
              className="group relative min-h-[420px] overflow-hidden rounded-3xl border border-white/30"
              style={{ backgroundImage: `url(${panel.image})`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition group-hover:from-black/90" />
              <div className="absolute inset-x-0 bottom-0 z-10 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">Visa category</p>
                <h3 className="mt-2 text-3xl font-extrabold text-white">{panel.title}</h3>
                <p className="mt-3 text-sm font-bold text-white/90">
                  Explore <span aria-hidden>→</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/visa-services" className="btn btn-primary">
            View all visa services
          </Link>
        </div>
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
