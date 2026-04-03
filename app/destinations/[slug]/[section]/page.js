import { notFound } from "next/navigation";
import destinations from "../../../../data/destinations.json";
import siteData from "../../../../data/site.json";
import { ContentPage } from "../../../../components/content-page";
import { SiteShell } from "../../../../components/site-shell";
import { StructuredData } from "../../../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "../../../../lib/seo";
import {
  DESTINATION_SECTION_IDS,
  destinationHeaderBackdrop,
  getDestinationSectionLabel,
  isDestinationSectionId,
} from "../../../../lib/destination-nav";
import { getDestinationSectionPage } from "../../../../lib/destination-section-content";

export function generateStaticParams() {
  return Object.keys(destinations).flatMap((slug) =>
    DESTINATION_SECTION_IDS.map((section) => ({ slug, section }))
  );
}

export async function generateMetadata({ params }) {
  const { slug, section } = await params;
  if (!destinations[slug] || !isDestinationSectionId(section)) return {};
  const data = getDestinationSectionPage(slug, section);
  if (!data) return {};
  const path = `/destinations/${slug}/${section}`;
  return buildMetadata({
    title: data.metaTitle,
    description: data.metaDescription,
    path,
    keywords: [
      destinations[slug].name,
      getDestinationSectionLabel(section),
      "visa",
      "migration",
    ],
  });
}

export default async function DestinationSectionPage({ params }) {
  const { slug, section } = await params;
  const hub = destinations[slug];
  if (!hub || !isDestinationSectionId(section)) notFound();

  const data = getDestinationSectionPage(slug, section);
  if (!data) notFound();

  const hubPath = `/destinations/${slug}`;
  const path = `${hubPath}/${section}`;
  const sectionLabel = getDestinationSectionLabel(section);

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: hub.name, path: hubPath },
      { name: sectionLabel, path },
    ]),
  ];
  if (data.faq?.length) {
    jsonLd.push(faqJsonLd(data.faq));
  }

  return (
    <SiteShell
      siteData={siteData}
      currentPath={path}
      destinationContext={{ slug, name: hub.name }}
      headerBackdrop={destinationHeaderBackdrop(slug)}
    >
      {jsonLd.map((item, i) => (
        <StructuredData key={i} data={item} />
      ))}
      <ContentPage
        eyebrow={data.eyebrow}
        title={data.headline}
        intro={data.intro}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: hubPath, label: hub.name },
          { href: path, label: sectionLabel },
        ]}
        officialResources={data.officialResources ?? []}
        sections={data.sections ?? []}
        faq={data.faq ?? []}
        related={data.related ?? []}
        heroImage={data.heroImage}
      />
    </SiteShell>
  );
}
