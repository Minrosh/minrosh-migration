import siteData from "../data/site.json";
import newsData from "../data/news.json";
import dynamic from "next/dynamic";
import "./home.css";
import { SiteShell } from "../components/site-shell";
import { UltraMaximumLayout } from "../components/ultra-maximum-layout";
import { HomeDeferredCarouselsLazy } from "../components/home-deferred-carousels-lazy";
import { HomeDeferredMotionSectionsLazy } from "../components/home-deferred-motion-sections-lazy";
import { PublicFileImg } from "../components/public-file-img";
import { MotionReveal, MotionStagger, MotionItem } from "../components/ui/motion-wrapper";
import { TrackedAnchor, TrackedLink } from "../components/tracked-link";

const HomeSmartNavigatorIsland = dynamic(
  () => import("../components/home-smart-navigator-island").then((mod) => mod.HomeSmartNavigatorIsland),
  {
    loading: () => <div className="min-h-[360px] rounded-[1.9rem] bg-brand-plum/5" aria-hidden="true" />,
  }
);

const HomeVisaComparisonFlowchart = dynamic(
  () => import("../components/home-visa-comparison-flowchart").then((mod) => mod.HomeVisaComparisonFlowchart),
  {
    loading: () => <section className="ultra-snap-section bg-white" aria-hidden="true" />,
  }
);

export default function HomePage() {
  return (
    <SiteShell siteData={siteData} currentPath="/">
      <UltraMaximumLayout>
        {/* BACKGROUND DECORATIONS */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="blur-orb bg-brand-rose/10 top-[-10%] left-[-10%]" />
          <div className="blur-orb bg-brand-gold/5 bottom-[-10%] right-[-10%]" />
        </div>

        {/* HERO SECTION - SNAPPY ANIMATIONS */}
        <section className="ultra-snap-section relative overflow-hidden bg-brand-cream/20">
          <div className="absolute inset-0 z-0 opacity-[0.03]">
            <PublicFileImg
              src="/images/hero-sydney-real.v2.webp"
              alt=""
              className="h-full w-full object-cover grayscale"
              width={1920}
              height={1280}
              priority
              fetchPriority="high"
              sizes="100vw"
            />
          </div>
          
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
            <MotionReveal delay={0} y={10}>
              <div className="inline-flex items-center gap-3 rounded-full bg-white/60 px-5 py-2 text-[10px] sm:text-xs font-extrabold text-brand-rose shadow-xl backdrop-blur-xl mb-8 border border-white animate-float">
                <span className="flex h-2 w-2 rounded-full bg-brand-rose shadow-[0_0_10px_#9b4a6c] animate-pulse" />
                MinRosh Intelligence v3.4 Active
              </div>
            </MotionReveal>
            
            <MotionReveal delay={0.05} y={15}>
              <h1 className="mx-auto max-w-4xl text-3xl font-black tracking-tight text-brand-plum sm:text-5xl md:text-6xl leading-[1.1]">
                <span className="text-gradient-shine">
                  Migration Agent Brisbane
                </span>
                <br />
                <span className="text-brand-plum/90 font-display italic text-2xl sm:text-4xl md:text-5xl">Skilled, Partner and Student Visa Clarity.</span>
              </h1>
            </MotionReveal>
            
            <MotionReveal delay={0.1}>
              <p className="mx-auto mt-6 max-w-2xl text-base text-brand-plum/60 sm:text-lg md:text-xl leading-relaxed font-medium">
                Strategic visa guidance powered by AI and human expertise. We define your clearest pathway before you spend a single cent on lodgement.
              </p>
            </MotionReveal>
            
            <MotionReveal delay={0.15} y={10}>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <TrackedLink 
                  id="hero-cta-assessment"
                  href="/assessment" 
                  eventName="cta_click"
                  eventParams={{ cta_id: "hero_check_eligibility", cta_location: "home_hero", destination: "/assessment" }}
                  aria-label="Check eligibility from homepage hero"
                  className="btn min-h-[48px] touch-manipulation bg-brand-plum px-8 py-4 text-base sm:text-lg font-black text-white shadow-xl transition-all hover:-translate-y-1 active:scale-95 group"
                >
                  Check Eligibility in 2 Minutes
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-2">→</span>
                </TrackedLink>
              </div>
              <p className="mt-3 text-sm font-semibold text-brand-plum/70">
                Need quick human help?{" "}
                <TrackedAnchor
                  id="hero-cta-whatsapp"
                  href="https://wa.me/61478100542?text=Hi%20MinRosh%20Migration,%20I%20need%20help%20understanding%20my%20visa%20options."
                  eventName="cta_click"
                  eventParams={{ cta_id: "hero_whatsapp", cta_location: "home_hero", destination: "whatsapp" }}
                  aria-label="Open WhatsApp chat with MinRosh"
                  className="text-brand-rose underline decoration-brand-rose/40 underline-offset-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat on WhatsApp
                </TrackedAnchor>
                {" "}Fast response for urgent eligibility questions.
              </p>
            </MotionReveal>

            <MotionReveal delay={0.25}>
              <div className="mt-12 flex justify-center">
                <div className="glass-card inline-flex items-center gap-3 px-4 py-2 rounded-xl border-brand-rose/20 shadow-inner">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-rose">Live Activity</span>
                  <div className="h-4 w-px bg-brand-plum/10" />
                  <p className="text-[10px] sm:text-xs font-bold text-brand-plum/60 italic">
                    &quot;New Skilled Migration pathway identified for Brisbane client&quot;
                  </p>
                </div>
              </div>
            </MotionReveal>
          </div>
        </section>

        <HomeVisaComparisonFlowchart />

        {/* THE INTELLIGENT ISLAND */}
        <section className="ultra-snap-section bg-white relative">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 py-8 md:py-16">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="w-full lg:w-1/3 text-center lg:text-left">
                <MotionReveal y={20}>
                  <p className="text-brand-rose font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-3">Precision Routing</p>
                  <h2 className="text-3xl font-black text-brand-plum tracking-tighter sm:text-4xl md:text-5xl">The Island.</h2>
                  <p className="mt-4 text-base sm:text-lg text-brand-plum/50 font-medium">
                    Answer 5 questions. Get your confidence-scored roadmap.
                  </p>
                </MotionReveal>
              </div>
              <div className="w-full lg:w-2/3">
                <MotionReveal delay={0.1} y={30}>
                  <div className="rounded-[2rem] sm:rounded-[3rem] shadow-[0_40px_100px_rgba(61,36,50,0.15)] p-1 bg-gradient-to-tr from-brand-rose/30 via-white to-brand-gold/30">
                    <div className="bg-white/80 backdrop-blur-3xl rounded-[1.9rem] sm:rounded-[2.9rem] p-3 sm:p-6 shadow-inner overflow-hidden">
                      <HomeSmartNavigatorIsland />
                    </div>
                  </div>
                </MotionReveal>
              </div>
            </div>
          </div>
        </section>

        <HomeDeferredMotionSectionsLazy />

        <HomeDeferredCarouselsLazy newsItems={newsData} />
      </UltraMaximumLayout>
    </SiteShell>
  );
}
