import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { buildMetadata } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Terms of Use | MinRosh Migration",
  description: "Read the MinRosh Migration website terms of use.",
  path: "/terms-of-use",
});

export default function TermsOfUsePage() {
  return (
    <SiteShell siteData={siteData} currentPath="/terms-of-use">
      <ContentPage
        eyebrow="Legal"
        title="Terms of Use"
        intro="These starter website terms explain the basic expectations around using the MinRosh Migration website and its public content."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/terms-of-use", label: "Terms of Use" },
        ]}
        sections={[
          {
            title: "Use of website content",
            body: "Website visitors may use public content for personal information purposes. Content should not be reproduced, republished, or presented as personalised migration advice without permission.",
          },
          {
            title: "Availability and updates",
            body: "MinRosh Migration may update, revise, or remove content at any time. Website availability and features may also change without notice.",
          },
          {
            title: "Limits of reliance",
            body: "Use of the website does not create a professional engagement or advisor-client relationship by itself. Formal service engagement should only be assumed after clear confirmation from MinRosh Migration.",
          },
        ]}
      />
    </SiteShell>
  );
}
