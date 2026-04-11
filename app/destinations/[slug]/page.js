import { notFound } from "next/navigation";
import destinations from "../../../data/destinations.json";
import siteData from "../../../data/site.json";
import { ContentPage } from "../../../components/content-page";
import { HubAustraliaAside } from "../../../components/hub-australia-aside";
import { SiteShell } from "../../../components/site-shell";
import { StructuredData } from "../../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../../lib/seo";
import { destinationHeaderBackdrop } from "../../../lib/destination-nav";

export function generateStaticParams() {
  return Object.keys(destinations).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = destinations[slug];
  if (!page) return {};
  return buildMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/destinations/${slug}`,
    keywords: [
      page.name,
      "migration",
      "visa guidance",
      `${page.name} visa information`,
    ],
  });
}

export default async function DestinationPage({ params }) {
  const { slug } = await params;
  const page = destinations[slug];
  if (!page) notFound();

  const path = `/destinations/${slug}`;

  return (
    <SiteShell
      siteData={siteData}
      currentPath={path}
      destinationContext={{ slug, name: page.name }}
      headerBackdrop={destinationHeaderBackdrop(slug)}
    >
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: page.name, path },
        ])}
      />
      <ContentPage
        eyebrow={`${page.name} hub`}
        title={page.headline}
        intro={page.intro}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: path, label: page.name },
        ]}
        officialResources={page.officialLinks}
        sections={page.sections}
        related={page.relatedSiteLinks}
        asideTools={slug === "australia" ? <HubAustraliaAside /> : null}
        heroImage={{
          src: "/images/team-office-real.jpg",
          alt: "Professional office environment for migration planning discussions",
        }}
      />
    </SiteShell>
  );
}
