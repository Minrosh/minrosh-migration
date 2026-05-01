import Link from "next/link";
import siteDataStatic from "../../../data/site.json";
import { getHomeSiteData } from "../../../lib/home-site-data";
import { SiteShell } from "../../../components/site-shell";
import { StructuredData } from "../../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../../lib/seo";
import { getToolDisclaimers } from "../../../lib/tool-disclaimers";
import { PrPathwayExplorerClient } from "../../../components/tools/pr-pathway-explorer-client";

const path = "/tools/pr-pathway-explorer";

export const metadata = buildMetadata({
  title: "PR pathway explorer (Australia orientation)",
  description:
    "High-level sequencing diagrams for how study or offshore skilled routes are usually discussed — not eligibility advice and not a guarantee of permanent residence.",
  path,
  keywords: ["Australian PR pathways", "student to PR Australia", "skilled migration sequence", "MinRosh tools"],
});

export default function PrPathwayExplorerPage() {
  const siteData = getHomeSiteData(siteDataStatic);
  const { prExplorerDisclaimer } = getToolDisclaimers();

  return (
    <SiteShell siteData={siteData} currentPath={path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools" },
          { name: "PR pathway explorer", path },
        ])}
      />

      <article className="content-page">
        <nav className="content-breadcrumbs text-sm text-brand-plum/60" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-rose">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href="/tools" className="hover:text-brand-rose">
            Tools
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="text-brand-plum">PR pathway explorer</span>
        </nav>

        <section className="content-hero">
          <div className="content-hero__grid">
            <div className="content-hero__copy">
              <p className="section-label">Orientation</p>
              <h1>PR pathway explorer</h1>
              <p>
                These diagrams summarise how we <em>talk about sequencing</em> in consultations. They are not
                eligibility calculators and they are not legal advice.
              </p>
              <p className="content-hero__note">
                Deep reading:{" "}
                <Link
                  href="/skilled-migration-australia-points-guide"
                  className="text-brand-rose underline underline-offset-4"
                >
                  Skilled points guide
                </Link>
                ,{" "}
                <Link href="/student-visa-australia" className="text-brand-rose underline underline-offset-4">
                  Student visa hub
                </Link>
                , and{" "}
                <Link
                  href="/australia-visa-processing-times-guide"
                  className="text-brand-rose underline underline-offset-4"
                >
                  processing times guide
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="content-section" aria-labelledby="explorer-heading">
          <h2 id="explorer-heading" className="sr-only">
            Pathway diagrams
          </h2>
          <PrPathwayExplorerClient disclaimer={prExplorerDisclaimer} />
        </section>
      </article>
    </SiteShell>
  );
}
