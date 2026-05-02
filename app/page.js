import siteData from "../data/site.json";
import newsData from "../data/news.json";
import "./home.css";
import { SiteShell } from "../components/site-shell";
import { UltraMaximumLayout } from "../components/ultra-maximum-layout";
import { HomeDeferredCarouselsLazy } from "../components/home-deferred-carousels-lazy";
import { HomeBuyerJourneyStrip } from "../components/home-buyer-journey-strip";
import { HomeDestinationCards } from "../components/home-destination-cards";
import { HomePlanningTools } from "../components/home-planning-tools";
import { HomeServicesPathways } from "../components/home-services-pathways";
import { HomeFinalCta } from "../components/home-final-cta";
import { PublicFileImg } from "../components/public-file-img";
import { MotionReveal } from "../components/ui/motion-wrapper";
import { TrackedAnchor, TrackedLink } from "../components/tracked-link";

export default function HomePage() {
  return (
    <SiteShell siteData={siteData} currentPath="/">
      <UltraMaximumLayout>
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-brand-cream/30">
          <div className="blur-orb bg-brand-rose/25 top-[-10%] left-[-10%]" />
          <div className="blur-orb bg-brand-gold/20 bottom-[-10%] right-[-10%]" />
        </div>

        <section className="ultra-snap-section relative overflow-x-clip overflow-y-visible bg-gradient-to-b from-brand-cream/90 to-white md:overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/60 via-white/80 to-white" />
            <PublicFileImg
              src="/images/hero-sydney-real.v2.webp"
              alt="Sydney skyline"
              className="h-full w-full object-cover object-[center_30%] opacity-40 mix-blend-multiply"
              width={1920}
              height={1280}
              priority
              fetchPriority="high"
              sizes="100vw"
            />
          </div>

          <div className="relative z-10 mx-auto min-w-0 max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
            <MotionReveal delay={0} y={10}>
              <div className="mx-auto mb-8 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-white bg-white/70 px-4 py-2 text-center text-[10px] font-extrabold text-brand-plum shadow-lg backdrop-blur-xl sm:gap-3 sm:px-5 sm:text-xs">
                Registered migration guidance · Australia, Canada, the UK & New Zealand
              </div>
            </MotionReveal>

            <MotionReveal delay={0.05} y={15}>
              <h1 className="mx-auto max-w-4xl text-2xl font-black leading-[1.12] tracking-tight text-brand-plum sm:text-4xl md:text-[2.65rem]">
                <span className="text-gradient-shine">
                  Clear migration and study pathways across Australia, Canada, the UK and New Zealand
                </span>
              </h1>
            </MotionReveal>

            <MotionReveal delay={0.08} y={12}>
              <p className="mx-auto mt-5 max-w-3xl text-lg font-semibold leading-snug text-brand-plum/80 sm:text-xl md:text-2xl">
                For students, skilled workers, couples and families—including offshore applicants planning study,
                skilled routes, partner or employer-sponsored options, visitors and education decisions.
              </p>
            </MotionReveal>

            <MotionReveal delay={0.1}>
              <p className="mx-auto mt-5 max-w-3xl text-base font-medium leading-relaxed text-brand-plum/60 sm:text-lg md:text-xl">
                Plain-English sequencing with references to official sources before you commit time or money. Led from
                Brisbane with appointments online worldwide.
              </p>
            </MotionReveal>

            <MotionReveal delay={0.14} y={10}>
              <div className="mt-10 flex min-w-0 flex-wrap justify-center gap-4">
                <TrackedLink
                  id="hero-cta-assessment"
                  href="/assessment"
                  eventName="cta_click"
                  eventParams={{
                    cta_id: "hero_pathway_questionnaire",
                    cta_location: "home_hero",
                    destination: "/assessment",
                  }}
                  aria-label="Start the pathway questionnaire"
                  className="group btn min-h-[48px] touch-manipulation bg-brand-plum px-8 py-4 text-base font-black text-white shadow-xl transition-all hover:-translate-y-1 active:scale-95 sm:text-lg"
                >
                  Start the pathway questionnaire
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-2" aria-hidden="true">
                    →
                  </span>
                </TrackedLink>
                <TrackedLink
                  id="hero-cta-consultation"
                  href="/book-consultation"
                  eventName="cta_click"
                  eventParams={{
                    cta_id: "hero_book_consultation",
                    cta_location: "home_hero",
                    destination: "/book-consultation",
                  }}
                  aria-label="Book a migration consultation"
                  className="btn btn-ghost min-h-[48px] touch-manipulation border-2 border-brand-plum/20 px-8 py-4 text-base font-black text-brand-plum transition-all hover:border-brand-plum/35 hover:bg-brand-cream/40 sm:text-lg"
                >
                  Book a consultation
                </TrackedLink>
              </div>
              <p className="mt-4 text-sm font-semibold text-brand-plum/70">
                <TrackedAnchor
                  id="hero-cta-whatsapp"
                  href="https://wa.me/61478100542?text=Hi%20MinRosh%20Migration,%20I%20would%20like%20to%20discuss%20scheduling%20or%20general%20pathway%20questions."
                  eventName="cta_click"
                  eventParams={{ cta_id: "hero_whatsapp", cta_location: "home_hero", destination: "whatsapp" }}
                  aria-label="Open WhatsApp chat with MinRosh"
                  className="text-brand-rose underline decoration-brand-rose/40 underline-offset-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat on WhatsApp
                </TrackedAnchor>
                {" — "}
                Message us for scheduling or general pathway questions.
              </p>
            </MotionReveal>

            <MotionReveal delay={0.22}>
              <div className="mt-12 flex justify-center">
                <div className="glass-card inline-flex max-w-xl flex-col gap-1 rounded-xl border-brand-rose/20 px-4 py-3 text-left shadow-inner sm:flex-row sm:items-center sm:gap-3">
                  <span className="shrink-0 text-[8px] font-black uppercase tracking-[0.2em] text-brand-rose">
                    Typical focus
                  </span>
                  <div className="hidden h-4 w-px bg-brand-plum/10 sm:block" aria-hidden="true" />
                  <p className="text-[10px] font-semibold leading-snug text-brand-plum/65 sm:text-xs">
                    Skilled points, employer-sponsored routes, student pathways and partner evidence—explained with
                    official sources, not hype.
                  </p>
                </div>
              </div>
            </MotionReveal>
          </div>
        </section>

        <HomeBuyerJourneyStrip />

        <HomeDestinationCards countries={siteData.countries} />

        <HomeServicesPathways />

        <HomePlanningTools />

        <HomeDeferredCarouselsLazy newsItems={newsData} />

        <HomeFinalCta />
      </UltraMaximumLayout>
    </SiteShell>
  );
}
