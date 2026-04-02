import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { buildMetadata } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Disclaimer | MinRosh Migration",
  description: "Read the MinRosh Migration website disclaimer regarding general information and migration guidance.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <SiteShell siteData={siteData} currentPath="/disclaimer">
      <ContentPage
        eyebrow="Legal"
        title="Disclaimer"
        intro="The information on this website is intended as general information only and should not be treated as personal migration advice for your individual circumstances."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/disclaimer", label: "Disclaimer" },
        ]}
        sections={[
          {
            title: "General information only",
            body: "Content published on this website is provided for general educational and informational purposes. Migration outcomes depend on personal circumstances, current legal requirements, government policy, and the quality of supporting evidence.",
          },
          {
            title: "No guarantee of outcome",
            body: "Reading website content, using the quiz, or using the AI Concierge does not guarantee visa eligibility, invitation, nomination, or any specific migration outcome.",
          },
          {
            title: "Need for personal review",
            body: "Visitors should seek tailored professional review before relying on website content to make major migration, education, or relocation decisions.",
          },
        ]}
      />
    </SiteShell>
  );
}
