import Link from "next/link";
import siteDataStatic from "../../data/site.json";
import { getHomeSiteData } from "../../lib/home-site-data";
import seoPages from "../../data/seo-pages.json";
import { ContactLeadForm } from "../../components/contact-lead-form";
import { AgentRegistrationStrip } from "../../components/agent-registration-strip";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";

const pageData = seoPages.servicePages.bookConsultation;

export const metadata = buildMetadata({
  title: pageData.metaTitle,
  description: pageData.metaDescription,
  path: pageData.path,
  keywords: [
    "Book migration consultation",
    "Australian visa consultation Brisbane",
    "Migration advice consultation",
  ],
});

export default function BookConsultationPage() {
  const siteData = getHomeSiteData(siteDataStatic);

  return (
    <SiteShell siteData={siteData} currentPath="">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Book Consultation", path: pageData.path },
        ])}
      />
      <section className="content-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <span>
            <Link href="/">Home</Link>
          </span>
          <span className="breadcrumbs__sep">/</span>
          <span>
            <Link href={pageData.path}>Book Consultation</Link>
          </span>
        </nav>

        <section className="content-hero">
          <p className="section-label">Book Consultation</p>
          <h1>{pageData.headline}</h1>
          <p>{pageData.intro}</p>
          {siteData.consultationHoursNote ? (
            <p className="content-hero__note">{siteData.consultationHoursNote}</p>
          ) : null}
        </section>

        <div className="content-page__grid">
          <div className="content-page__main">
            <section className="content-section bento-hover">
              <h2>Why book with us?</h2>
              <p>
                A consultation gives you a clearer view of your options before you spend time and
                money on the wrong pathway. We focus on practical strategy, likely next steps, and
                the issues that may affect your profile.
              </p>
              <ul className="feature-list">
                <li>Personalised visa strategy based on your situation</li>
                <li>Clear guidance on realistic migration pathways</li>
                <li>Early identification of common mistakes and weak points</li>
              </ul>
            </section>

            <section className="content-section bento-hover">
              <h2>What you’ll get</h2>
              <p>
                Consultations are designed to help you leave with clarity, not just more
                information. We help you understand the strongest pathway signals, the main
                documents or tests to prioritise, and the likely sequence of steps you should take
                next.
              </p>
              <ul className="feature-list">
                <li>One-on-one consultation tailored to your background</li>
                <li>Preliminary visa eligibility and pathway review</li>
                <li>Step-by-step action plan for your next move</li>
              </ul>
            </section>

            <section className="content-section bento-hover">
              <h2>Book your consultation today</h2>
              <p>
                Fill in the form and our team will review your enquiry. If you already know the
                pathway you want to discuss, include that in your message so we can prepare the most
                relevant next-step guidance.
              </p>
            </section>
          </div>

          <div className="content-page__aside contact-form-column">
            <AgentRegistrationStrip brand={siteData.brand} />
            <ContactLeadForm mode="consultation" />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
