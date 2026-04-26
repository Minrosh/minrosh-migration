import siteData from "../../data/site.json";
import { SiteShell } from "../../components/site-shell";
import { BreadcrumbsNav } from "../../components/breadcrumbs-nav";
import { PublicFileImg } from "../../components/public-file-img";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, webPageSpeakableJsonLd } from "../../lib/seo";

const path = "/meet-the-team";

const coFounders = [
  {
    name: "Roshan Samarawickrema",
    role: "Director",
    responsibilities: "Responsible for business planning and IT infrastructure.",
    imageSrc: "/images/team/roshan-samarawickrema.v1.webp",
    alt: "Roshan Samarawickrema, Director of MinRosh Migration",
  },
  {
    name: "Minoli Bandaranayake",
    role: "Founder & Director",
    responsibilities: "Responsible for migration planning and education consultations.",
    imageSrc: "/images/team/minoli-bandaranayake.v1.webp",
    alt: "Minoli Bandaranayake, Founder and Director of MinRosh Migration",
  },
];

const consultants = [
  {
    name: "MinRosh Advisory Team",
    role: "Migration Strategy and Case Planning",
    languages: "English, Sinhala, Tamil",
    story:
      "The team focuses on turning stressful migration decisions into staged action plans with clear evidence priorities and timing checkpoints.",
  },
  {
    name: "Client Experience Team",
    role: "Onboarding and Document Readiness",
    languages: "English, Hindi",
    story:
      "This team supports clients with secure uploads, checklist clarity, and practical preparation so cases move forward without avoidable delays.",
  },
  {
    name: "Compliance and Quality Team",
    role: "Submission Quality and Risk Controls",
    languages: "English",
    story:
      "The quality team reviews case flow, consistency, and official-source alignment to reduce rework and strengthen decision confidence.",
  },
];

export const metadata = buildMetadata({
  title: "Meet the Team | Leadership",
  description:
    "Meet Roshan Samarawickrema (Director) and Minoli Bandaranayake (Founder & Director) at MinRosh Migration, and learn how the wider team supports your migration journey.",
  path,
  keywords: ["migration team Brisbane", "migration consultant profiles", "MinRosh team"],
});

export default function MeetTheTeamPage() {
  return (
    <SiteShell siteData={siteData} currentPath={path}>
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Meet the Team", path },
          ]),
          webPageSpeakableJsonLd({
            path,
            title: "Meet the Leadership and Team | MinRosh Migration",
            description:
              "Leadership bios for Roshan Samarawickrema and Minoli Bandaranayake, plus the wider advisory support team.",
          }),
        ]}
      />
      <article className="content-page">
        <BreadcrumbsNav
          currentPath={path}
          items={[
            { label: "Home", href: "/" },
            { label: "Meet the Team", href: path },
          ]}
        />
        <section className="content-hero">
          <div className="content-hero__grid">
            <div className="content-hero__copy">
              <p className="section-label">Trust and credentials</p>
              <h1>Meet the people behind your migration journey</h1>
              <p>
                Migration outcomes depend on clarity, consistency, and timing. Meet our co-founders and support team
                who combine human consultation with structured systems so clients can make decisions with confidence.
              </p>
            </div>
            <div className="content-hero__media" aria-hidden="true">
              <PublicFileImg
                src="/images/brisbane-skyline.v2.webp"
                alt="MinRosh team operations context in Brisbane"
                width={1600}
                height={900}
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          </div>
        </section>
        <section className="tools-hub" aria-label="Co-founders">
          <div className="mb-6 sm:mb-8">
            <p className="section-label">Leadership</p>
            <h2 className="text-3xl font-black tracking-tight text-brand-plum sm:text-4xl">Founder, Director & Leadership</h2>
          </div>
          <ul className="tools-hub__grid">
            {coFounders.map((person) => (
              <li key={person.name}>
                <article className="tools-hub__card bento-hover">
                  <div className="mb-4 overflow-hidden rounded-2xl border border-brand-plum/10 bg-white">
                    <PublicFileImg
                      src={person.imageSrc}
                      alt={person.alt}
                      width={640}
                      height={640}
                      className="h-auto w-full object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <p className="section-label">{person.role}</p>
                  <h3>{person.name}</h3>
                  <p>{person.responsibilities}</p>
                </article>
              </li>
            ))}
          </ul>
        </section>
        <section className="tools-hub" aria-label="Consultant biographies">
          <div className="mb-6 sm:mb-8">
            <p className="section-label">Advisory and operations</p>
            <h2 className="text-3xl font-black tracking-tight text-brand-plum sm:text-4xl">Wider team support</h2>
          </div>
          <ul className="tools-hub__grid">
            {consultants.map((person) => (
              <li key={person.name}>
                <article className="tools-hub__card bento-hover">
                  <p className="section-label">{person.role}</p>
                  <h2>{person.name}</h2>
                  <p>{person.story}</p>
                  <p className="text-sm font-semibold text-brand-plum/70">Languages: {person.languages}</p>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </SiteShell>
  );
}
