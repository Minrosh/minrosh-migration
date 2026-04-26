import Link from "next/link";
import siteDataStatic from "../../data/site.json";
import { getHomeSiteData } from "../../lib/home-site-data";
import { SiteShell } from "../../components/site-shell";
import { BreadcrumbsNav } from "../../components/breadcrumbs-nav";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import { StructuredData } from "../../components/structured-data";

const path = "/referral-program";

export const metadata = buildMetadata({
  title: "Referral program",
  description:
    "Partner with MinRosh Migration and receive tracked referral links for education, employer and community lead introductions.",
  path,
  keywords: ["migration referral program", "visa referral partner", "MinRosh referral"],
});

export default function ReferralProgramPage() {
  const siteData = getHomeSiteData(siteDataStatic);

  return (
    <SiteShell siteData={siteData} currentPath={path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Referral program", path },
        ])}
      />
      <article className="content-page">
        <BreadcrumbsNav
          currentPath={path}
          items={[
            { label: "Home", href: "/" },
            { label: "Referral program", href: path },
          ]}
        />

        <section className="content-hero">
          <div className="content-hero__grid">
            <div className="content-hero__copy">
              <p className="section-label">Growth partnerships</p>
              <h1>Referral program for agents, employers, and community leaders</h1>
              <p>
                We partner with trusted introducers who support migrants with accurate guidance and clear next-step pathways.
                You receive a tracked referral link so every lead can be attributed correctly.
              </p>
            </div>
          </div>
        </section>

        <section className="content-section bento-hover">
          <h2>How attribution works</h2>
          <ul className="feature-list">
            <li>Each partner gets a unique link format: <code>?ref=partner_name&amp;ref_code=partner001</code></li>
            <li>Referral source and code are saved against enquiries and CRM leads automatically</li>
            <li>Performance can be reviewed by pathway segment and conversion outcome</li>
          </ul>
        </section>

        <section className="content-section bento-hover">
          <h2>Who this is for</h2>
          <ul className="feature-list">
            <li>Education consultants and student recruiters</li>
            <li>Employers and HR coordinators hiring offshore talent</li>
            <li>Community groups supporting migration and settlement</li>
          </ul>
        </section>

        <section className="content-section bento-hover">
          <h2>Start as a referral partner</h2>
          <p>
            Send us your organisation details and target visa streams. We will issue your tracked link and onboarding summary.
          </p>
          <div className="content-aside-card__actions">
            <Link href="/contact?ref=referral_program" className="btn btn-primary">
              Contact partnership desk
            </Link>
            <Link href="/book-consultation?ref=referral_program" className="btn btn-ghost">
              Book partner call
            </Link>
          </div>
        </section>
      </article>
    </SiteShell>
  );
}
