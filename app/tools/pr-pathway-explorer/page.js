import Link from "next/link";
import siteDataStatic from "../../../data/site.json";
import { getHomeSiteData } from "../../../lib/home-site-data";
import { SiteShell } from "../../../components/site-shell";
import { StructuredData } from "../../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../../lib/seo";
import { getToolDisclaimers } from "../../../lib/tool-disclaimers";
import { PermanentMigrationInformationExplorerClient } from "../../../components/tools/pr-pathway-explorer-client";

const path = "/tools/pr-pathway-explorer";

export const metadata = buildMetadata({
  title: "Permanent Migration Information Explorer | MinRosh Migration",
  description:
    "Browse general permanent and long-term visa category topics with official Home Affairs links. Does not assess eligibility or recommend a visa.",
  path,
  keywords: [
    "permanent migration information Australia",
    "visa category information",
    "Home Affairs official sources",
    "MinRosh information tools",
  ],
});

export default function PermanentMigrationInformationExplorerPage() {
  const siteData = getHomeSiteData(siteDataStatic);
  const { prExplorerDisclaimer } = getToolDisclaimers();

  return (
    <SiteShell siteData={siteData} currentPath={path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "General Information Tools", path: "/tools" },
          { name: "Permanent Migration Information Explorer", path },
        ])}
      />

      <article className="content-page">
        <nav className="content-breadcrumbs text-sm text-brand-plum/60" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-rose">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href="/tools" className="hover:text-brand-rose">
            General Information Tools
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="text-brand-plum">Permanent Migration Information Explorer</span>
        </nav>

        <section className="content-hero">
          <div className="content-hero__grid">
            <div className="content-hero__copy">
              <p className="section-label">General information</p>
              <h1>Permanent Migration Information Explorer</h1>
              <p>
                Select a general topic to view publicly available information and official sources. This tool does not
                assess your circumstances or recommend a visa.
              </p>
              <p className="content-hero__note">
                Related reading:{" "}
                <Link
                  href="/skilled-migration-australia-points-guide"
                  className="text-brand-rose underline underline-offset-4"
                >
                  Skilled points guide
                </Link>
                ,{" "}
                <Link href="/australian-visas-official-sources" className="text-brand-rose underline underline-offset-4">
                  official sources hub
                </Link>
                , and{" "}
                <Link href="/assessment" className="text-brand-rose underline underline-offset-4">
                  Official Information Finder
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="content-section" aria-labelledby="explorer-heading">
          <h2 id="explorer-heading" className="sr-only">
            Permanent migration information topics
          </h2>
          <PermanentMigrationInformationExplorerClient disclaimer={prExplorerDisclaimer} />
        </section>
      </article>
    </SiteShell>
  );
}
