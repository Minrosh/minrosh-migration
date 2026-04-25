import siteData from "../data/site.json";
import { SiteShell } from "../components/site-shell";
import { PublicFileImg } from "../components/public-file-img";
import { HomeSmartNavigatorIsland } from "../components/home-smart-navigator-island";
import Link from "next/link";

export default function HomePage() {
  return (
    <SiteShell siteData={siteData} currentPath="/">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-brand-cream py-20 lg:py-32">
        {/* Decorative background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-brand-rose/5 rounded-full blur-3xl -z-10" />
        
        <div className="absolute inset-0 z-0 opacity-10">
          <PublicFileImg 
            src="/images/hero-sydney-real.jpg" 
            alt="" 
            className="h-full w-full object-cover"
            priority={true}
          />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-brand-rose shadow-sm backdrop-blur-sm mb-8 border border-brand-rose/10">
            <span className="flex h-2 w-2 rounded-full bg-brand-rose animate-pulse" />
            Registered Migration Agents Brisbane
          </div>
          
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-brand-plum sm:text-6xl lg:text-7xl leading-[1.1]">
            <span className="bg-gradient-to-r from-brand-plum via-brand-rose to-brand-plum bg-clip-text text-transparent">
              Migration Agent Brisbane
            </span>
            <br />
            <span className="text-brand-plum/90">Clear Visa Pathways</span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-lg text-brand-plum/70 sm:text-xl leading-relaxed">
            Get expert guidance for skilled, partner, and student visas with a structured plan before you apply. Reduce risk and save time.
          </p>
          
          <div className="mt-12 flex flex-wrap justify-center gap-5">
            <Link 
              id="hero-cta-assessment"
              href="/assessment" 
              className="btn btn-primary px-10 py-5 text-lg font-bold shadow-2xl shadow-brand-rose/30 transition-all hover:-translate-y-1 hover:scale-105 active:scale-95"
            >
              Start Free Assessment
            </Link>
            <a 
              id="hero-cta-whatsapp"
              href="https://wa.me/61478100542?text=Hi%20MinRosh%20Migration,%20I%20need%20help%20understanding%20my%20visa%20options."
              className="btn bg-white px-10 py-5 text-lg font-bold text-brand-plum shadow-xl border border-brand-plum/5 transition-all hover:-translate-y-1 hover:bg-brand-cream/50 active:scale-95 flex items-center gap-3"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.223-3.081c1.466.827 3.015 1.346 4.604 1.346 5.488 0 9.954-4.466 9.954-9.954 0-2.651-1.033-5.147-2.908-7.024-1.875-1.875-4.37-2.907-7.024-2.907-5.491 0-9.954 4.466-9.954 9.954 0 1.83.504 3.618 1.455 5.178l-1.003 3.666 3.831-.959z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* QUICK QUALIFIER / NAVIGATOR ISLAND */}
      <section className="bg-white py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="text-4xl font-bold text-brand-plum tracking-tight sm:text-5xl">Not sure where to start?</h2>
            <p className="mt-6 text-xl text-brand-plum/60">
              Answer a few questions and find your best visa pathway in minutes.
            </p>
          </div>
          <div className="mx-auto max-w-5xl rounded-[3rem] shadow-[0_32px_80px_rgba(61,36,50,0.12)] p-1 bg-gradient-to-br from-brand-rose/20 via-transparent to-brand-gold/20">
            <div className="bg-white rounded-[2.9rem] p-2">
              <HomeSmartNavigatorIsland />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP - PREMIUM CARDS */}
      <section className="bg-brand-cream/30 py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Clear pathway before you apply", icon: "🗺️", color: "bg-blue-50" },
              { title: "Reduce visa refusal risks", icon: "🛡️", color: "bg-green-50" },
              { title: "Personalised migration strategy", icon: "🎯", color: "bg-orange-50" },
              { title: "Support across major visa types", icon: "🤝", color: "bg-purple-50" },
            ].map((item) => (
              <div key={item.title} className="group flex flex-col items-center rounded-3xl bg-white p-10 text-center shadow-sm border border-brand-plum/5 transition-all hover:shadow-xl hover:-translate-y-1">
                <span className={`mb-6 flex h-20 w-20 items-center justify-center rounded-2xl text-4xl ${item.color} transition-transform group-hover:scale-110`}>
                  {item.icon}
                </span>
                <h3 className="text-xl font-bold text-brand-plum leading-snug">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-brand-plum mb-4">Our Core Visa Services</h2>
          <p className="text-brand-plum/60 mb-20 max-w-2xl mx-auto">Expert guidance tailored to your unique circumstances and goals.</p>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {[
              { 
                title: "Skilled Migration", 
                desc: "Navigate occupation lists and points tests with a professional strategy.",
                href: "/skilled-migration",
                accent: "border-t-brand-rose"
              },
              { 
                title: "Partner Visa", 
                desc: "Expert evidence preparation for onshore and offshore partner applications.",
                href: "/partner-visa-australia",
                accent: "border-t-brand-gold"
              },
              { 
                title: "Student Visa", 
                desc: "Strategic course selection and GTE/GS requirements for long-term success.",
                href: "/student-visa-australia",
                accent: "border-t-brand-plum"
              },
            ].map((service) => (
              <div key={service.title} className={`group relative rounded-[2.5rem] border border-brand-plum/10 ${service.accent} border-t-4 p-12 text-left transition-all hover:border-brand-rose/30 hover:shadow-2xl hover:-translate-y-2 bg-white`}>
                <h3 className="text-2xl font-extrabold text-brand-plum">{service.title}</h3>
                <p className="mt-6 text-brand-plum/70 leading-relaxed">{service.desc}</p>
                <Link 
                  href={service.href}
                  className="mt-10 inline-flex items-center gap-2 font-bold text-brand-rose group-hover:gap-3 transition-all"
                >
                  Check Eligibility <span>→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS PLACEHOLDER - PREMIUM LOOK */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-[2.5rem] border border-brand-plum/10 bg-brand-cream/40 p-10 text-center backdrop-blur-sm shadow-inner">
            <div className="flex justify-center gap-1 mb-4 text-yellow-400">
               {"★★★★★".split("").map((s, i) => <span key={i} className="text-2xl">{s}</span>)}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-plum/40 mb-3">Google Trusted Reviewer</p>
            <h2 className="text-3xl font-extrabold text-brand-plum">Real Experience, Real Success</h2>
            <p className="mt-4 text-lg text-brand-plum/70 leading-relaxed">
              We are currently integrating live Google Reviews. Our clients consistently rate us 5-stars for our clear pathways and honest guidance.
            </p>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / REVIEWS - BENTO STYLE */}
      <section className="bg-brand-plum py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-center text-4xl font-bold mb-20">What Our Clients Say</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { name: "Saman K.", text: "The Smart Navigator gave me immediate clarity on my skilled visa points. Highly recommended." },
              { name: "Priya R.", text: "MinRosh helped us with our partner visa evidence. The process was stress-free and professional." },
              { name: "Michael T.", text: "Expert guidance on student visa pathways. They really know the regional migration rules." },
            ].map((review, index) => (
              <div key={index} className="rounded-[2.5rem] bg-white/5 p-10 border border-white/10 backdrop-blur-md transition-all hover:bg-white/10 hover:-translate-y-1">
                <div className="mb-6 flex text-yellow-400">
                  {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                </div>
                <p className="text-xl italic text-brand-cream/90 mb-8 leading-relaxed">&quot;{review.text}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-brand-rose/30 flex items-center justify-center font-bold text-brand-rose uppercase">
                    {review.name[0]}
                  </div>
                  <p className="font-bold text-lg">{review.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS SECTION - INTERACTIVE STEPS */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-brand-plum mb-20">The 4-Step Success Process</h2>
          <div className="relative grid grid-cols-1 gap-16 md:grid-cols-4">
            {/* Connecting line */}
            <div className="absolute top-12 left-0 right-0 hidden h-0.5 bg-brand-plum/5 md:block" />
            
            {[
              { step: "1", title: "Assessment", desc: "Take the AI-guided assessment." },
              { step: "2", title: "Pathway", desc: "Get your confidence-scored roadmap." },
              { step: "3", title: "Consultation", desc: "Deep dive with a migration agent." },
              { step: "4", title: "Success", desc: "Lodge with precision and support." },
            ].map((item) => (
              <div key={item.step} className="group relative">
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-rose text-3xl font-extrabold text-white shadow-lg shadow-brand-rose/20 transition-all group-hover:scale-110 group-hover:rotate-3">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-brand-plum">{item.title}</h3>
                <p className="mt-4 text-brand-plum/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCAL SEO BLOCK - SUBTLE */}
      <section className="bg-brand-cream/20 py-16 border-y border-brand-plum/5">
        <div className="container mx-auto px-4 text-center">
          <p className="mx-auto max-w-4xl text-sm font-medium text-brand-plum/50 uppercase tracking-widest mb-4">Registered Migration Support</p>
          <p className="mx-auto max-w-3xl text-lg text-brand-plum/60 leading-relaxed italic">
            &ldquo;MinRosh Migration provides professional visa guidance for clients in Brisbane, Queensland, and across Australia. 
            We help you understand your best pathway before applying. As registered migration agents, 
            we specialise in skilled migration, partner visas, and student visa strategies.&rdquo;
          </p>
        </div>
      </section>

      {/* FINAL CTA - IMMERSIVE */}
      <section className="py-32 bg-brand-cream/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-rose/5 blur-3xl rounded-full translate-y-1/2" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-extrabold text-brand-plum mb-6 sm:text-5xl lg:text-6xl tracking-tight">Ready to define your migration pathway?</h2>
          <p className="text-xl text-brand-plum/60 mb-12 max-w-2xl mx-auto">Join hundreds of successful migrants who started their journey with a clear strategy.</p>
          <Link 
            id="footer-cta-assessment"
            href="/assessment" 
            className="btn btn-primary px-16 py-6 text-2xl font-bold shadow-[0_20px_50px_rgba(155,74,108,0.3)] transition-all hover:scale-105 active:scale-95"
          >
            Start Assessment Now
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
