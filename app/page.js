import siteData from "../data/site.json";
import { SiteShell } from "../components/site-shell";
import { PublicFileImg } from "../components/public-file-img";
import { HomeSmartNavigatorIsland } from "../components/home-smart-navigator-island";
import { UltraMaximumLayout } from "../components/ultra-maximum-layout";
import { MotionReveal, MotionStagger, MotionItem } from "../components/ui/motion-wrapper";
import Link from "next/link";

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
              src="/images/hero-sydney-real.jpg" 
              alt="" 
              className="h-full w-full object-cover grayscale"
              priority={true}
            />
          </div>
          
          <div className="container relative z-10 mx-auto px-4 text-center py-12 md:py-20">
            <MotionReveal delay={0} y={10}>
              <div className="inline-flex items-center gap-3 rounded-full bg-white/60 px-5 py-2 text-[10px] sm:text-xs font-extrabold text-brand-rose shadow-xl backdrop-blur-xl mb-8 border border-white animate-float">
                <span className="flex h-2 w-2 rounded-full bg-brand-rose shadow-[0_0_10px_#9b4a6c] animate-pulse" />
                MinRosh Intelligence v3.4 Active
              </div>
            </MotionReveal>
            
            <MotionReveal delay={0.05} y={15}>
              <h1 className="mx-auto max-w-5xl text-4xl font-black tracking-tight text-brand-plum sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[1.1] sm:leading-[0.95]">
                <span className="text-gradient-shine">
                  Migration Agent Brisbane
                </span>
                <br />
                <span className="text-brand-plum/90 font-display italic">Without the Guesswork.</span>
              </h1>
            </MotionReveal>
            
            <MotionReveal delay={0.1}>
              <p className="mx-auto mt-8 max-w-2xl text-lg text-brand-plum/60 sm:text-xl md:text-2xl leading-relaxed font-medium">
                Strategic visa guidance powered by AI and human expertise. We define your clearest pathway before you spend a single cent on lodgement.
              </p>
            </MotionReveal>
            
            <MotionReveal delay={0.15} y={10}>
              <div className="mt-12 flex flex-wrap justify-center gap-4 sm:gap-6">
                <Link 
                  id="hero-cta-assessment"
                  href="/assessment" 
                  className="btn bg-brand-plum px-8 py-4 sm:px-12 sm:py-6 text-base sm:text-xl font-black text-white shadow-[0_20px_50px_rgba(61,36,50,0.4)] transition-all hover:-translate-y-2 hover:scale-105 active:scale-95 group"
                >
                  Start Expert Assessment
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-2">→</span>
                </Link>
                <a 
                  id="hero-cta-whatsapp"
                  href="https://wa.me/61478100542?text=Hi%20MinRosh%20Migration,%20I%20need%20help%20understanding%20my%20visa%20options."
                  className="glass-card px-8 py-4 sm:px-12 sm:py-6 text-base sm:text-xl font-black text-brand-plum transition-all hover:-translate-y-2 hover:bg-white active:scale-95 flex items-center gap-3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="h-6 w-6 sm:h-7 sm:w-7 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.223-3.081c1.466.827 3.015 1.346 4.604 1.346 5.488 0 9.954-4.466 9.954-9.954 0-2.651-1.033-5.147-2.908-7.024-1.875-1.875-4.37-2.907-7.024-2.907-5.491 0-9.954-4.466-9.954 9.954 0 1.83.504 3.618 1.455 5.178l-1.003 3.666 3.831-.959z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
            </MotionReveal>

            <MotionReveal delay={0.25}>
              <div className="mt-16 flex justify-center">
                <div className="glass-card inline-flex items-center gap-3 sm:gap-4 px-4 py-2 sm:px-6 sm:py-3 rounded-2xl border-brand-rose/20 shadow-inner">
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-brand-rose">Live Activity</span>
                  <div className="h-4 w-px bg-brand-plum/10" />
                  <p className="text-xs sm:text-sm font-bold text-brand-plum/60 italic">
                    &quot;New Skilled Migration pathway identified for client in Brisbane (4 mins ago)&quot;
                  </p>
                </div>
              </div>
            </MotionReveal>
          </div>
        </section>

        {/* THE INTELLIGENT ISLAND */}
        <section className="ultra-snap-section bg-white relative">
          <div className="container mx-auto px-4 relative z-10 py-12 md:py-20">
            <MotionReveal y={20}>
              <div className="mx-auto max-w-4xl text-center mb-12 md:mb-20">
                <p className="text-brand-rose font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-4">Precision Routing</p>
                <h2 className="text-4xl font-black text-brand-plum tracking-tighter sm:text-6xl lg:text-8xl">The Island.</h2>
                <p className="mt-6 text-lg sm:text-2xl text-brand-plum/50 font-medium">
                  Answer 5 questions. Get your confidence-scored roadmap.
                </p>
              </div>
            </MotionReveal>
            <MotionReveal delay={0.1} y={30}>
              <div className="mx-auto max-w-5xl rounded-[2rem] sm:rounded-[4rem] shadow-[0_40px_100px_rgba(61,36,50,0.15)] p-1 bg-gradient-to-tr from-brand-rose/30 via-white to-brand-gold/30">
                <div className="bg-white/80 backdrop-blur-3xl rounded-[1.9rem] sm:rounded-[3.9rem] p-3 sm:p-6 shadow-inner overflow-hidden">
                  <HomeSmartNavigatorIsland />
                </div>
              </div>
            </MotionReveal>
          </div>
        </section>

        {/* THE 4 PILLARS - ELITE GRID */}
        <section className="ultra-snap-section bg-brand-plum text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-brand-rose/10 rounded-full blur-[80px] sm:blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2" />
          <div className="container mx-auto px-4 relative z-10 py-12 md:py-20">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              <MotionReveal y={20}>
                <div className="flex flex-col justify-center h-full text-center lg:text-left">
                  <p className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-6">Why MinRosh?</p>
                  <h2 className="text-4xl font-black tracking-tighter sm:text-6xl lg:text-8xl mb-8 leading-[1.1] sm:leading-[0.9]">
                    Engineered for <br /><span className="text-brand-rose italic">Approval.</span>
                  </h2>
                  <p className="text-lg sm:text-2xl text-brand-cream/60 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
                    We don&apos;t just lodge forms. We build iron-clad evidence portfolios migration officers can&apos;t ignore.
                  </p>
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
                      <span className="text-3xl sm:text-4xl block mb-6 group-hover:scale-125 transition-transform origin-center sm:origin-left">{item.icon}</span>
                      <h3 className="text-xl sm:text-2xl font-black mb-4">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-brand-cream/50 leading-relaxed">{item.desc}</p>
                    </div>
                  </MotionItem>
                ))}
              </MotionStagger>
            </div>
          </div>
        </section>

        {/* CORE SERVICES - THE BENTO GRID */}
        <section className="ultra-snap-section bg-white">
          <div className="container mx-auto px-4 py-12 md:py-20">
            <MotionReveal y={20}>
              <h2 className="text-center text-4xl font-black text-brand-plum tracking-tighter mb-12 sm:mb-20 sm:text-6xl lg:text-7xl">Core Visa Engines.</h2>
            </MotionReveal>
            <MotionStagger className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 text-center sm:text-left">
              <MotionItem className="lg:col-span-2">
                <div className="glass-card !bg-brand-cream/20 p-8 sm:p-12 h-full flex flex-col justify-between group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity hidden sm:block">
                    <span className="text-[150px] lg:text-[200px] font-black leading-none">01</span>
                  </div>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-black text-brand-plum mb-6">Skilled Migration.</h3>
                    <p className="text-lg sm:text-xl text-brand-plum/60 max-w-xl font-medium leading-relaxed mx-auto sm:mx-0">
                      We use real-time state nomination data to find your highest-probability pathway.
                    </p>
                  </div>
                  <Link href="/skilled-migration" className="mt-10 sm:mt-12 btn btn-primary self-center sm:self-start px-8 sm:px-10 py-3 sm:py-4 font-bold">
                    View Skilled Hub
                  </Link>
                </div>
              </MotionItem>
              <MotionItem>
                <div className="glass-card !bg-brand-rose/5 p-8 sm:p-12 h-full border-brand-rose/10 flex flex-col justify-between group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity hidden sm:block">
                    <span className="text-[100px] lg:text-[120px] font-black leading-none">02</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-brand-plum">Partner Visa Mastery.</h3>
                  <Link href="/partner-visa-australia" className="mt-8 font-black text-brand-rose flex items-center justify-center sm:justify-start gap-2 group-hover:gap-4 transition-all underline decoration-2 underline-offset-8">
                    Partner Hub <span>→</span>
                  </Link>
                </div>
              </MotionItem>
              <MotionItem>
                <div className="glass-card !bg-brand-gold/5 p-8 sm:p-12 h-full border-brand-gold/10 flex flex-col justify-between group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity hidden sm:block">
                    <span className="text-[100px] lg:text-[120px] font-black leading-none">03</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-brand-plum">Student Strategic.</h3>
                  <Link href="/student-visa-australia" className="mt-8 font-black text-brand-plum flex items-center justify-center sm:justify-start gap-2 group-hover:gap-4 transition-all underline decoration-2 underline-offset-8">
                    Student Hub <span>→</span>
                  </Link>
                </div>
              </MotionItem>
              <MotionItem className="lg:col-span-2">
                <div className="glass-card !bg-brand-plum p-8 sm:p-12 h-full text-white group overflow-hidden relative">
                  <div className="absolute bottom-0 right-0 p-8 lg:p-12 opacity-10 group-hover:opacity-20 transition-opacity hidden sm:block">
                    <span className="text-[120px] lg:text-[150px] font-black leading-none">04</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black mb-6">Commercial ROI.</h3>
                  <p className="text-base sm:text-lg text-brand-cream/60 max-w-md font-medium mx-auto sm:mx-0">
                    For employers and HR teams, we provide a structured immigration ROI analysis.
                  </p>
                </div>
              </MotionItem>
            </MotionStagger>
          </div>
        </section>

        {/* TESTIMONIALS - THE IMMERSIVE SLIDER */}
        <section className="ultra-snap-section bg-brand-cream/30 overflow-hidden">
          <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-center">
              <MotionReveal className="w-full md:w-1/3 text-center md:text-left" y={20}>
                <h2 className="text-4xl font-black text-brand-plum tracking-tighter leading-[1.1] md:leading-[0.9] mb-8 sm:text-6xl lg:text-7xl">
                  Success <br /><span className="text-brand-rose">Stories.</span>
                </h2>
                <p className="text-lg sm:text-2xl text-brand-plum/50 font-medium leading-relaxed">Real outcomes from real people.</p>
              </MotionReveal>
              <MotionStagger className="w-full md:w-2/3 flex flex-col sm:flex-row gap-6 sm:gap-8">
                {[
                  { name: "Ahmed", visa: "Skilled 190", quote: "MinRosh changed my life. They found a state nomination I didn't even know existed." },
                  { name: "Sarah", visa: "Partner 820", quote: "The evidence binder they helped me build was so professional." },
                ].map((item, i) => (
                  <MotionItem key={i} className="flex-1">
                    <div className="glass-card p-8 sm:p-10 h-full shadow-2xl transition-transform hover:-rotate-1 text-center sm:text-left">
                      <div className="flex justify-center sm:justify-start text-yellow-400 gap-1 mb-6">★★★★★</div>
                      <p className="text-lg sm:text-xl font-bold text-brand-plum italic mb-8 leading-relaxed">&quot;{item.quote}&quot;</p>
                      <p className="font-black text-brand-rose uppercase tracking-widest text-[10px] sm:text-xs">{item.name} — {item.visa}</p>
                    </div>
                  </MotionItem>
                ))}
              </MotionStagger>
            </div>
          </div>
        </section>

        {/* FINAL CTA - THE ABSOLUTE MAXIMUM */}
        <section className="ultra-snap-section bg-brand-plum relative overflow-hidden">
          <div className="blur-orb bg-brand-rose/20 top-[-20%] left-[-20%]" />
          <div className="blur-orb bg-brand-gold/10 bottom-[-20%] right-[-20%]" />
          
          <div className="container mx-auto px-4 text-center relative z-10 py-20">
            <MotionReveal y={20}>
              <p className="text-brand-gold font-black uppercase tracking-[0.5em] text-[10px] sm:text-xs mb-8">Initiate Pathway</p>
              <h2 className="text-5xl font-black text-white mb-10 sm:text-8xl lg:text-9xl tracking-tight leading-none">
                Ready for <br /><span className="text-brand-rose">Residency?</span>
              </h2>
            </MotionReveal>
            <MotionReveal delay={0.1} y={30}>
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mt-12 sm:mt-16">
                <Link 
                  id="footer-cta-assessment"
                  href="/assessment" 
                  className="btn bg-white px-10 py-5 sm:px-20 sm:py-10 text-xl sm:text-3xl font-black text-brand-plum shadow-[0_30px_100px_rgba(255,255,255,0.15)] transition-all hover:scale-110 active:scale-95"
                >
                  Start My Assessment
                </Link>
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
