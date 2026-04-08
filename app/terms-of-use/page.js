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
        intro="These terms set out the conditions for using the MinRosh Migration website, public resources, and related online services."
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
            title: "No professional engagement by website use alone",
            body: "Using this website, submitting a quiz, or sending a general enquiry does not by itself create an adviser-client relationship. A formal service relationship starts only after explicit confirmation from MinRosh Migration.",
          },
          {
            title: "Availability and updates",
            body: "MinRosh Migration may update, revise, or remove content at any time. Website availability and features may also change without notice.",
          },
          {
            title: "Limits of liability",
            body: "Website information is provided on a general-information basis. To the extent permitted by law, MinRosh Migration is not liable for loss arising from reliance on website content without a tailored professional review.",
          },
        ]}
      />
    </SiteShell>
  );
}
