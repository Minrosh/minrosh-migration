import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { buildMetadata } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "OMARA Code of Conduct Information | MinRosh Migration",
  description:
    "Learn about the OMARA Code of Conduct for registered migration agents. MinRosh provides general information only and is not an OMARA-regulated practice.",
  path: "/code-of-conduct",
});

export default function CodeOfConductPage() {
  return (
    <SiteShell siteData={siteData} currentPath="/code-of-conduct">
      <ContentPage
        eyebrow="Information"
        title="OMARA Code of Conduct"
        intro="This page summarises publicly available information about the OMARA Code of Conduct for people seeking authorised migration help. MinRosh Migration is an independent migration information and education support service. We are not registered migration agents and are not regulated by OMARA."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/code-of-conduct", label: "Code of Conduct" },
        ]}
        sections={[
          {
            title: "Why this code matters",
            body: "Registered migration agents in Australia are subject to professional standards published by OMARA, including honesty, transparency, and clear client communication. If you need personalised immigration assistance, you should engage an authorised professional and understand the standards that apply to them.",
          },
          {
            title: "What MinRosh provides",
            body: "MinRosh helps readers find and understand publicly available migration and education information. We do not provide immigration assistance, legal advice, eligibility assessments, or visa preparation or lodgement. Our website communication should remain clear, respectful, and transparent about that scope.",
          },
          {
            title: "Official code reference",
            body: "Readers who want authorised help should review the official OMARA Code of Conduct and search the Register of Migration Agents before engaging anyone for immigration assistance.",
            bullets: [
              "General website information is not a substitute for immigration assistance or legal advice",
              "Always rely on current official requirements and an authorised professional for personalised matters",
              "Use the official register to find a registered migration agent when you need regulated advice",
            ],
          },
        ]}
      />
    </SiteShell>
  );
}
