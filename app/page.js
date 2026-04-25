import siteData from "../data/site.json";
import { SiteShell } from "../components/site-shell";
import { SmartNavigator } from "../components/smart-navigator";
import { HubClusterNavigator } from "../components/seo/hub-cluster-navigator";
import { PublicFileImg } from "../components/public-file-img";
import Link from "next/link";

export default function HomePage() {
  return (
    <SiteShell siteData={siteData} currentPath="/">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-brand-cream py-16 lg:py-24">
        <div className="absolute inset-0 z-0 opacity-10">
          <PublicFileImg 
            src="/images/hero-sydney-real.jpg" 
            alt="" 
            className="h-full w-full object-cover"
            priority={true}
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-brand-plum sm:text-5xl lg:text-6xl">
            Migration Agent Brisbane – Clear Visa Pathways Without Guesswork
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-brand-plum/80 sm:text-xl">
            Get expert guidance for skilled, partner, and student visas with a structured plan before you apply.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link 
              id="hero-cta-assessment"
              href="/assessment" 
              className="btn btn-primary px-8 py-4 text-lg font-bold shadow-xl shadow-brand-rose/20 transition-transform hover:-translate-y-1"
            >
              Start Free Assessment
            </Link>
            <a 
              id="hero-cta-whatsapp"
              href="https://wa.me/61478100542?text=Hi%20MinRosh%20Migration,%20I%20need%20help%20understanding%20my%20visa%20options."
              className="btn btn-secondary flex items-center gap-2 px-8 py-4 text-lg font-bold transition-transform hover:-translate-y-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.223-3.081c1.466.827 3.015 1.346 4.604 1.346 5.488 0 9.954-4.466 9.954-9.954 0-2.651-1.033-5.147-2.908-7.024-1.875-1.875-4.37-2.907-7.024-2.907-5.491 0-9.954 4.466-9.954 9.954 0 1.83.504 3.618 1.455 5.178l-1.003 3.666 3.831-.959z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* QUICK QUALIFIER / NAVIGATOR */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-plum">Not sure where to start?</h2>
            <p className="mt-4 text-brand-plum/70">
              Answer a few questions and find your best visa pathway in minutes.
            </p>
          </div>
          <SmartNavigator />
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-brand-cream/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Clear pathway before you apply", icon: "🗺️" },
              { title: "Reduce visa refusal risks", icon: "🛡️" },
              { title: "Personalised migration strategy", icon: "🎯" },
              { title: "Support across major visa types", icon: "🤝" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm">
                <span className="mb-4 text-4xl">{item.icon}</span>
                <h3 className="text-lg font-bold text-brand-plum">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold text-brand-plum mb-16">Our Core Visa Services</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { 
                title: "Skilled Migration", 
                desc: "Navigate occupation lists and points tests with a professional strategy.",
                href: "/skilled-migration" 
              },
              { 
                title: "Partner Visa", 
                desc: "Expert evidence preparation for onshore and offshore partner applications.",
                href: "/partner-visa-australia" 
              },
              { 
                title: "Student Visa", 
                desc: "Strategic course selection and GTE/GS requirements for long-term success.",
                href: "/student-visa-australia" 
              },
            ].map((service) => (
              <div key={service.title} className="group relative rounded-3xl border border-brand-plum/10 p-10 transition-all hover:border-brand-rose/30 hover:shadow-xl">
                <h3 className="text-2xl font-bold text-brand-plum">{service.title}</h3>
                <p className="mt-4 text-brand-plum/70">{service.desc}</p>
                <Link 
                  href={service.href}
                  className="mt-8 inline-flex items-center font-bold text-brand-rose group-hover:underline"
                >
                  Check Eligibility →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / REVIEWS */}
      <section className="bg-brand-plum py-20 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold mb-16">What Our Clients Say</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { name: "Saman K.", text: "The Smart Navigator gave me immediate clarity on my skilled visa points. Highly recommended." },
              { name: "Priya R.", text: "MinRosh helped us with our partner visa evidence. The process was stress-free and professional." },
              { name: "Michael T.", text: "Expert guidance on student visa pathways. They really know the regional migration rules." },
            ].map((review) => (
              <div key={review.name} className="rounded-3xl bg-white/10 p-8 border border-white/10">
                <div className="mb-4 flex text-yellow-400">
                  {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                </div>
                <p className="italic text-brand-cream/80 mb-6">&quot;{review.text}&quot;</p>
                <p className="font-bold">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-brand-plum mb-16">The 4-Step Success Process</h2>
          <div className="relative grid grid-cols-1 gap-12 md:grid-cols-4">
            {[
              { step: "1", title: "Assessment", desc: "Take the AI-guided assessment." },
              { step: "2", title: "Pathway", desc: "Get your confidence-scored roadmap." },
              { step: "3", title: "Consultation", desc: "Deep dive with a migration agent." },
              { step: "4", title: "Success", desc: "Lodge with precision and support." },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-rose text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-brand-plum">{item.title}</h3>
                <p className="mt-2 text-sm text-brand-plum/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCAL SEO BLOCK */}
      <section className="bg-brand-cream/30 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mx-auto max-w-3xl text-sm text-brand-plum/60 leading-relaxed">
            MinRosh Migration provides visa guidance for clients in Brisbane, Queensland, and across Australia. 
            We help you understand your best pathway before applying. As registered migration agents, 
            we specialise in skilled migration, partner visas, and student visa strategies.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-white border-t border-brand-plum/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-brand-plum mb-8">Ready to define your migration pathway?</h2>
          <Link 
            id="footer-cta-assessment"
            href="/assessment" 
            className="btn btn-primary px-12 py-5 text-xl font-bold shadow-2xl"
          >
            Start Assessment Now
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
