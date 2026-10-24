import Link from "next/link";
import { Suspense } from "react";
import { headers } from "next/headers";
import { BreadcrumbsNav } from "../../components/breadcrumbs-nav";
import siteData from "../../data/site.json";
import { SiteShell } from "../../components/site-shell";
import { OfficialInformationFinder } from "../../components/official-information-finder";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import { TrackedLink } from "../../components/tracked-link";
import {
  PremiumCTAGroup,
  PremiumGlassCard,
  PremiumPageHero,
  PremiumPageShell,
  PremiumSectionHeader,
} from "../../components/premium";
import { PREMIUM_BADGE_CLASS } from "../../lib/premium-page-classes";
import { CONVERSION_PREMIUM_PRIMARY_CTA_CLASS } from "@/lib/conversion-premium-cta-class";
import { getComplianceConfig } from "@/lib/compliance";
import "../home.css";

export const metadata = buildMetadata({
  title: "Official Information Finder | MinRosh Migration",
  description:
    "Choose a broad topic to find general Australian migration information and official links. This tool does not assess eligibility or provide immigration assistance.",
  path: "/assessment",
  keywords: [
    "Australian visa official information",
    "Home Affairs visa links",
    "migration information finder",
  ],
});

function FinderFallback() {
  return (
    <div
      className="rounded-[2rem] border border-brand-plum/10 bg-[rgba(255,255,255,0.55)] p-6 shadow-inner min-h-[280px] motion-safe:animate-pulse"
      aria-busy="true"
      aria-label="Loading Official Information Finder"
    />
  );
}

const howItWorks = [
  {
    number: 1,
    title: "Choose an information topic",
    description: "Select the visa category or education topic you want to read about.",
  },
  {
    number: 2,
    title: "Review a general summary",
    description: "Read a neutral overview compiled from public sources.",
  },
  {
    number: 3,
    title: "Verify with the official source",
    description: "Follow official links and check current criteria, forms, fees and processing information yourself.",
  },
  {
    number: 4,
    title: "Seek authorised advice if needed",
    description:
      "For advice based on your circumstances or help with an application, contact a registered migration agent or Australian legal practitioner.",
  },
];

export default async function AssessmentPage() {
  const nonce = String((await headers()).get("x-csp-nonce") || "").trim();
  const compliance = getComplianceConfig(siteData);

  return (
    <SiteShell siteData={siteData} currentPath="/assessment">
      <StructuredData
        nonce={nonce}
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Official Information Finder", path: "/assessment" },
        ])}
      />

      <PremiumPageShell className="page-assessment-shell">
        <BreadcrumbsNav
          currentPath="/assessment"
          items={[
            { label: "Home", href: "/" },
            { label: "Information Finder", href: "/assessment" },
          ]}
        />

        <PremiumPageHero
          eyebrow="Topic navigation"
          title="Official Information Finder"
          lead={compliance.aiInformationFinderNotice}
        >
          <div className="mt-5 flex flex-wrap gap-2" role="list">
            <span className={PREMIUM_BADGE_CLASS} role="listitem">
              Not an eligibility assessment
            </span>
            <span className={PREMIUM_BADGE_CLASS} role="listitem">
              No personalised visa recommendation
            </span>
            <span className={PREMIUM_BADGE_CLASS} role="listitem">
              Official links first
            </span>
          </div>
          <PremiumCTAGroup className="mt-6">
            <TrackedLink
              href="/contact"
              className={CONVERSION_PREMIUM_PRIMARY_CTA_CLASS}
              eventName="cta_click"
              eventParams={{ cta_id: "finder_contact", destination: "/contact" }}
            >
              General information enquiry
            </TrackedLink>
            <TrackedLink
              href="/education-consultation"
              className="btn btn-ghost"
              eventName="cta_click"
              eventParams={{ cta_id: "finder_education", destination: "/education-consultation" }}
            >
              Education course enquiry
            </TrackedLink>
          </PremiumCTAGroup>
        </PremiumPageHero>

        <section className="mt-6" aria-labelledby="finder-how-heading">
          <PremiumSectionHeader
            id="finder-how-heading"
            eyebrow="How it works"
            title="Four steps to public information"
            lead="This tool returns deterministic topic links. It does not score confidence, rank visas, or apply migration law to your facts."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {howItWorks.map((step) => (
              <PremiumGlassCard key={step.number}>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-plum/60">Step {step.number}</p>
                <h3 className="mt-2 text-lg font-bold text-brand-plum">{step.title}</h3>
                <p className="mt-2 text-sm text-brand-plum/75">{step.description}</p>
              </PremiumGlassCard>
            ))}
          </div>
        </section>

        <div className="mt-6">
          <Suspense fallback={<FinderFallback />}>
            <OfficialInformationFinder />
          </Suspense>
        </div>

        <p className="mt-8 text-sm text-brand-plum/70">
          Prefer browsing by category?{" "}
          <Link href="/visa-services" className="font-semibold text-brand-rose underline-offset-2 hover:underline">
            Information and Education Support
          </Link>
          .
        </p>
      </PremiumPageShell>
    </SiteShell>
  );
}
