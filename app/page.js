import siteData from "../data/site.json";
import newsData from "../data/news.json";
import dynamic from "next/dynamic";
import Image from "next/image";
import { SiteShell } from "../components/site-shell";
import { UltraMaximumLayout } from "../components/ultra-maximum-layout";
import { MotionReveal, MotionStagger, MotionItem } from "../components/ui/motion-wrapper";
import Link from "next/link";
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
            <Image
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
          
          <div className="container relative z-10 mx-auto px-4 text-center pt-8 pb-12 md:pt-12 md:pb-20">
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
                <span className="text-brand-plum/90 font-display italic text-2xl sm:text-4xl md:text-5xl">Without the Guesswork.</span>
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
                  eventParams={{ cta_id: "hero_assessment", cta_location: "home_hero", destination: "/assessment" }}
                  aria-label="Start free assessment from homepage hero"
                  className="btn bg-brand-plum px-8 py-4 text-base sm:text-lg font-black text-white shadow-xl transition-all hover:-translate-y-1 active:scale-95 group"
                >
                  Start Expert Assessment
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
                .
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
          <div className="container mx-auto px-4 relative z-10 py-8 md:py-16">
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

        {/* THE 4 PILLARS - ELITE GRID */}
        <section className="ultra-snap-section bg-brand-plum text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-brand-rose/10 rounded-full blur-[80px] sm:blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent -z-0" />
          <div className="container mx-auto px-4 relative z-10 py-8 md:py-16">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
              <MotionReveal y={20}>
                <div className="flex flex-col justify-center h-full text-center lg:text-left">
                  <p className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-4">Why MinRosh?</p>
                  <h2 className="text-3xl font-black tracking-tighter sm:text-4xl md:text-5xl mb-6 leading-[1.1]">
                    Engineered for <br /><span className="text-brand-rose italic">Approval.</span>
                  </h2>
                  <p className="text-base sm:text-lg text-brand-cream/60 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium mb-8">
                    We don&apos;t just lodge forms. We build iron-clad evidence portfolios migration officers can&apos;t ignore.
                  </p>
                  <div className="hidden lg:flex items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all">
                    <span className="text-4xl">🇦🇺</span>
                    <span className="text-4xl">🇨🇦</span>
                    <span className="text-4xl">🇬🇧</span>
                    <span className="text-4xl">🇳🇿</span>
                  </div>
                </div>
              </MotionReveal>
              <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  { title: "Risk Mitigation", desc: "We identify refusals before they happen.", icon: "🛡️" },
                  { title: "Strategic Timing", desc: "Occupation list windows mapped for you.", icon: "⏰" },
                  { title: "Profile Scoring", desc: "Know your points before you pay.", icon: "📈" },
                  { title: "Full Support", desc: "From assessment to residency.", icon: "🏛️" },
                ].map((item) => (
                  <MotionItem key={item.title}>
                    <div className="glass-card !bg-white/5 border-white/10 p-6 sm:p-8 h-full hover:bg-white/10 transition-all hover:-translate-y-2 group text-center sm:text-left">
                      <span className="text-3xl sm:text-4xl block mb-4 group-hover:scale-125 transition-transform origin-center sm:origin-left">{item.icon}</span>
                      <h3 className="text-lg sm:text-xl font-black mb-3">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-brand-cream/50 leading-relaxed">{item.desc}</p>
                    </div>
                  </MotionItem>
                ))}
              </MotionStagger>
            </div>
          </div>
        </section>

        {/* CORE SERVICES - THE COMPACT GRID */}
        <section className="ultra-snap-section bg-white">
          <div className="container mx-auto px-4 py-8 md:py-16">
            <MotionReveal y={20}>
              <h2 className="text-center text-3xl font-black text-brand-plum tracking-tighter mb-10 sm:mb-16 sm:text-5xl">Core Visa Engines.</h2>
            </MotionReveal>
            <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <MotionItem>
                <div className="glass-card !bg-brand-cream/20 p-6 sm:p-8 h-full flex flex-col justify-between group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-6xl font-black leading-none">01</span>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-brand-plum mb-3">Skilled Migration.</h3>
                    <p className="text-sm sm:text-base text-brand-plum/60 font-medium leading-relaxed">
                      Real-time state data to find your highest-probability pathway.
                    </p>
                  </div>
                  <Link href="/skilled-migration" className="mt-6 font-black text-brand-rose flex items-center gap-2 group-hover:gap-4 transition-all underline decoration-2 underline-offset-8">
                    View Skilled Hub <span>→</span>
                  </Link>
                </div>
              </MotionItem>
              <MotionItem>
                <div className="glass-card !bg-brand-rose/5 p-6 sm:p-8 h-full border-brand-rose/10 flex flex-col justify-between group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-6xl font-black leading-none">02</span>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-brand-plum mb-3">Partner Visa Mastery.</h3>
                    <p className="text-sm sm:text-base text-brand-plum/60 font-medium leading-relaxed">
                      Iron-clad evidence portfolios for permanent residence.
                    </p>
                  </div>
                  <Link href="/partner-visa-australia" className="mt-6 font-black text-brand-rose flex items-center gap-2 group-hover:gap-4 transition-all underline decoration-2 underline-offset-8">
                    Partner Hub <span>→</span>
                  </Link>
                </div>
              </MotionItem>
              <MotionItem>
                <div className="glass-card !bg-brand-gold/5 p-6 sm:p-8 h-full border-brand-gold/10 flex flex-col justify-between group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-6xl font-black leading-none">03</span>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-brand-plum mb-3">Student Strategic.</h3>
                    <p className="text-sm sm:text-base text-brand-plum/60 font-medium leading-relaxed">
                      Mapping education to long-term PR outcomes.
                    </p>
                  </div>
                  <Link href="/student-visa-australia" className="mt-6 font-black text-brand-plum flex items-center gap-2 group-hover:gap-4 transition-all underline decoration-2 underline-offset-8">
                    Student Hub <span>→</span>
                  </Link>
                </div>
              </MotionItem>
              <MotionItem>
                <div className="glass-card !bg-brand-plum p-6 sm:p-8 h-full text-white group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-6xl font-black leading-none">04</span>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black mb-3">Commercial ROI.</h3>
                    <p className="text-sm sm:text-base text-brand-cream/60 font-medium leading-relaxed">
                      Structured immigration ROI analysis for HR teams.
                    </p>
                  </div>
                </div>
              </MotionItem>
            </MotionStagger>
          </div>
        </section>

        {/* TESTIMONIALS - THE IMMERSIVE CAROUSEL */}
        <section className="ultra-snap-section bg-brand-cream/30 overflow-hidden">
          <div className="container mx-auto px-4 py-8 md:py-16">
            <MotionReveal className="text-center mb-12" y={20}>
              <p className="text-brand-rose font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-3">Client Trust</p>
              <h2 className="text-3xl font-black text-brand-plum tracking-tighter leading-[1.1] sm:text-4xl md:text-5xl">
                Success <span className="text-brand-rose">Stories.</span>
              </h2>
            </MotionReveal>
            
            <div className="relative">
              <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory no-scrollbar -mx-4 px-4">
                {[
                  { name: "Ahmed", visa: "Skilled 190", quote: "MinRosh changed my life. They found a state nomination I didn't even know existed." },
                  { name: "Sarah", visa: "Partner 820", quote: "The evidence binder they helped me build was so professional." },
                  { name: "R. Fernando", visa: "Skilled 189", quote: "The structured points review made the process feel manageable. We knew exactly what to improve." },
                  { name: "S. Wick", visa: "Student 500", quote: "Mapping my education to PR was the best decision I made for my future." }
                ].map((item, i) => (
                  <div key={i} className="flex-none w-[85%] sm:w-[450px] snap-center">
                    <div className="glass-card p-8 sm:p-10 h-full shadow-xl transition-all hover:shadow-2xl border-white/40">
                      <div className="flex text-yellow-400 gap-1 mb-6">★★★★★</div>
                      <p className="text-lg sm:text-xl font-bold text-brand-plum italic mb-8 leading-relaxed">&quot;{item.quote}&quot;</p>
                      <p className="font-black text-brand-rose uppercase tracking-widest text-[10px] sm:text-xs">{item.name} — {item.visa}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {[0, 1, 2, 3].map((dot) => (
                  <div key={dot} className="h-1.5 w-1.5 rounded-full bg-brand-plum/20" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* LATEST INSIGHTS - AUTHORITY SECTION */}
        <section className="ultra-snap-section bg-white">
          <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <MotionReveal y={20}>
                <p className="text-brand-rose font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-3">Knowledge Base</p>
                <h2 className="text-3xl font-black text-brand-plum tracking-tighter sm:text-4xl md:text-5xl">Latest Insights.</h2>
              </MotionReveal>
              <MotionReveal delay={0.1} y={10}>
                <Link href="/immigration-news" className="font-black text-brand-plum underline decoration-2 underline-offset-8 hover:text-brand-rose transition-colors">
                  View all news <span>→</span>
                </Link>
              </MotionReveal>
            </div>
            
            <div className="relative">
              <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory no-scrollbar -mx-4 px-4">
                {newsData.map((item) => (
                  <div key={item.id} className="flex-none w-[85%] sm:w-[380px] snap-center">
                    <Link href={item.href} className="group block h-full">
                      <div className="glass-card p-6 sm:p-8 h-full flex flex-col hover:bg-brand-cream/10 transition-all border-transparent hover:border-brand-rose/20 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                          <span className="bg-brand-plum/5 text-brand-plum text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                            {item.country}
                          </span>
                          <span className="text-[10px] font-bold text-brand-plum/40 uppercase tracking-widest">{item.date}</span>
                        </div>
                        <h3 className="text-xl font-black text-brand-plum mb-4 group-hover:text-brand-rose transition-colors leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-sm text-brand-plum/50 font-medium leading-relaxed line-clamp-3 mb-8">
                          {item.summary}
                        </p>
                        <div className="mt-auto flex items-center gap-2 text-xs font-black text-brand-plum group-hover:gap-4 transition-all uppercase tracking-widest">
                          Read Story <span>→</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA - THE ABSOLUTE MAXIMUM */}
        <section className="ultra-snap-section bg-brand-plum relative overflow-hidden">
          <div className="blur-orb bg-brand-rose/20 top-[-20%] left-[-20%]" />
          <div className="blur-orb bg-brand-gold/10 bottom-[-20%] right-[-20%]" />
          
          <div className="container mx-auto px-4 text-center relative z-10 py-16">
            <MotionReveal y={20}>
              <p className="text-brand-gold font-black uppercase tracking-[0.5em] text-[10px] sm:text-xs mb-6">Initiate Pathway</p>
              <h2 className="text-4xl font-black text-white mb-8 sm:text-6xl md:text-7xl tracking-tight leading-none">
                Ready for <br /><span className="text-brand-rose">Residency?</span>
              </h2>
            </MotionReveal>
            <MotionReveal delay={0.1} y={30}>
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mt-12 sm:mt-16">
                <TrackedLink 
                  id="footer-cta-assessment"
                  href="/assessment" 
                  eventName="cta_click"
                  eventParams={{ cta_id: "footer_assessment", cta_location: "home_footer", destination: "/assessment" }}
                  aria-label="Start assessment from homepage footer"
                  className="btn bg-white px-10 py-5 sm:px-20 sm:py-10 text-xl sm:text-3xl font-black text-brand-plum shadow-[0_30px_100px_rgba(255,255,255,0.15)] transition-all hover:scale-110 active:scale-95"
                >
                  Start My Assessment
                </TrackedLink>
              </div>
            </MotionReveal>
            <p className="mt-16 text-brand-cream/30 font-medium tracking-[0.4em] uppercase text-[10px]">
              Brisbane · Australia · Worldwide
            </p>
          </div>
        </section>
      </UltraMaximumLayout>
    </SiteShell>
  );
}
