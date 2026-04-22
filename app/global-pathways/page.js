import siteData from "../../data/site.json";
import destinations from "../../data/destinations.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";
import { getLifestyleGuide } from "../../lib/lifestyle-guides";
import { getTransportGuide } from "../../lib/experience-data";
import { LifestyleExperienceBlock } from "../../components/lifestyle/lifestyle-experience-block";

export const metadata = buildMetadata({
  title: "Global Pathways | Australia, Canada, UK and New Zealand",
  description:
    "Compare destination strategy across Australia, Canada, the United Kingdom, and New Zealand with official references and practical pathway planning notes.",
  path: "/global-pathways",
  keywords: ["global migration pathways", "Australia Canada migration compare", "migration strategy guide"],
});

function destinationSections() {
  const ids = ["australia", "canada", "united-kingdom", "new-zealand"];
  return ids
    .map((id) => destinations[id])
    .filter(Boolean)
    .map((item) => ({
      title: item.name,
      body: item.intro,
      bullets: [
        ...(item.sections?.slice(0, 2).map((section) => section.title) || []),
        item.officialLinks?.[0]?.label ? `Official reference: ${item.officialLinks[0].label}` : "",
      ].filter(Boolean),
    }));
}

const officialResources = ["australia", "canada", "united-kingdom", "new-zealand"]
  .map((id) => destinations[id]?.officialLinks?.[0])
  .filter(Boolean);

export default function GlobalPathwaysPage() {
  const lifestyleGuide = getLifestyleGuide("global-pathways");
  const transport = getTransportGuide("global-pathways");

  return (
    <SiteShell siteData={siteData} currentPath="/global-pathways">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Global pathways", path: "/global-pathways" },
        ])}
      />
      <ContentPage
        eyebrow="Global pathways"
        title="Destination strategy beyond the homepage quick view"
        intro="Use this page for deeper country-by-country planning after the homepage map preview. Compare destination context, policy framing, and where to verify requirements officially."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/global-pathways", label: "Global pathways" },
        ]}
        officialResources={officialResources}
        mainLead={<LifestyleExperienceBlock guide={lifestyleGuide} transport={transport} />}
        sections={destinationSections()}
        currentPath="/global-pathways"
        related={[
          { href: "/visa-services", title: "Visa services directory" },
          { href: "/australia-vs-canada-migration-guide", title: "Australia vs Canada guide" },
          { href: "/faq", title: "Migration FAQ" },
          { href: "/book-consultation", title: "Book consultation" },
        ]}
      />
    </SiteShell>
  );
}
