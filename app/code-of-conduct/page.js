import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { buildMetadata } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Code of Conduct | MinRosh Migration",
  description: "Read how MinRosh Migration aligns with regulatory expectations and the OMARA Code of Conduct.",
  path: "/code-of-conduct",
});

export default function CodeOfConductPage() {
  return (
    <SiteShell siteData={siteData} currentPath="/code-of-conduct">
      <ContentPage
        eyebrow="Compliance"
        title="Code of Conduct"
        intro="MinRosh Migration aims to operate in a professional, transparent, and client-first way, with service behaviour aligned to the Migration Agents Regulations 2026 and the OMARA Code of Conduct."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/code-of-conduct", label: "Code of Conduct" },
        ]}
        sections={[
          {
            title: "Professional standards",
            body: "Clients should expect honest communication, practical next-step guidance, respect for confidentiality, and a clear explanation of what is general information versus what requires formal personalised review.",
          },
          {
            title: "Regulatory alignment",
            body: "This page is a professional starter version and should be reviewed against the exact regulatory obligations, registration details, and complaint-handling standards that apply to your final business setup.",
          },
          {
            title: "Official code reference",
            body: "Visitors who want to understand the regulatory framework in more detail should review the official OMARA Code of Conduct and any related migration-agent guidance published by the Australian Government.",
            bullets: [
              "General website information is not a substitute for tailored case advice",
              "Clients should always rely on current legal requirements and formal review",
              "Service communication should remain clear, respectful, and transparent",
            ],
          },
        ]}
      />
    </SiteShell>
  );
}
