import { notFound } from "next/navigation";
import destinations from "../../../data/destinations.json";
import siteData from "../../../data/site.json";
import destinationCommandCenterData from "../../../data/destination-command-center.json";
import destinationCommandPaletteData from "../../../data/destination-command-palette.json";
import destinationRouteGraphData from "../../../data/destination-route-graph.json";
import destinationRouteNodeGuidesData from "../../../data/destination-route-node-guides.json";
import destinationConfidenceStripData from "../../../data/destination-confidence-strip.json";
import { ContentPage } from "../../../components/content-page";
import { HubAustraliaAside } from "../../../components/hub-australia-aside";
import { SiteShell } from "../../../components/site-shell";
import { StructuredData } from "../../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../../lib/seo";
import { DESTINATION_SECTION_IDS, destinationHeaderBackdrop, getDestinationSectionLabel } from "../../../lib/destination-nav";
import { getLifestyleGuide } from "../../../lib/lifestyle-guides";
import { getFirst14Days, getTransportGuide } from "../../../lib/experience-data";
import { LifestyleExperienceBlock } from "../../../components/lifestyle/lifestyle-experience-block";
import { DestinationCommandCenter } from "../../../components/destination-command-center";
import { DestinationRouteGraph } from "../../../components/destination-route-graph";
import { DestinationCommandPalette } from "../../../components/destination-command-palette";
import { DestinationConfidenceStrip } from "../../../components/destination-confidence-strip";
import { DestinationPlanningBlocks } from "../../../components/destinations/destination-planning-blocks";
import destinationPlanningBlocks from "../../../data/destination-planning-blocks.json";

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
  const defaultCenter = destinationCommandCenterData.default?.intents ?? [];
  const commandIntents = destinationCommandCenterData[slug]?.intents ?? defaultCenter;
  const defaultGraph = destinationRouteGraphData.default ?? { nodes: [], routes: [] };
  const routeGraph = destinationRouteGraphData[slug] ?? defaultGraph;
  const routeNodeGuides = {
    ...(destinationRouteNodeGuidesData.default ?? {}),
    ...(destinationRouteNodeGuidesData[slug] ?? {}),
  };
  const confidenceStrip =
    destinationConfidenceStripData[slug] ?? destinationConfidenceStripData.default ?? {};
  const paletteLinks = DESTINATION_SECTION_IDS.map((sectionId) => ({
    sectionId,
    label: getDestinationSectionLabel(sectionId),
    href: `/destinations/${slug}/${sectionId}`,
  }));
  const lifestyleGuide = getLifestyleGuide(slug);
  const first14 = getFirst14Days(slug);
  const transport = getTransportGuide(slug);

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
        mainLead={
          <>
            <DestinationCommandCenter
              slug={slug}
              destinationName={page.name}
              intents={commandIntents}
            />
            <DestinationConfidenceStrip
              title={confidenceStrip.title ?? "Decision Confidence Strip"}
              summary={
                confidenceStrip.summary ??
                `Use this strip to stay momentum-led while planning your ${page.name} pathway.`
              }
              metrics={confidenceStrip.metrics ?? []}
              proof={confidenceStrip.proof ?? []}
              nextMilestones={confidenceStrip.nextMilestones ?? []}
            />
            <DestinationCommandPalette
              destinationName={page.name}
              links={paletteLinks}
              prompts={destinationCommandPaletteData.defaultPrompts ?? []}
              intentHints={destinationCommandPaletteData.intentHints ?? {}}
            />
            <DestinationRouteGraph
              destinationName={page.name}
              nodes={routeGraph.nodes}
              routes={routeGraph.routes}
              nodeGuides={routeNodeGuides}
            />
            <LifestyleExperienceBlock
              guide={lifestyleGuide}
              first14={first14}
              transport={transport}
            />
            <DestinationPlanningBlocks
              destinationName={page.name}
              blocks={destinationPlanningBlocks[slug] ?? []}
            />
          </>
        }
        heroImage={{
          src: "/images/team-office-real.jpg",
          alt: "Brisbane CBD skyline and River at dusk for migration planning guidance",
        }}
      />
    </SiteShell>
  );
}
