import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { getComplianceConfig } from "../../lib/compliance";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Information and Education Support | MinRosh Migration",
  description:
    "Browse general information about Australian visa categories and education options. Public information summaries with links to official sources — not immigration assistance.",
  path: "/visa-services",
  keywords: [
    "migration information Australia",
    "education course support",
    "visa category information Brisbane",
  ],
});

function sectionsFromServices(services) {
  return services.map((service) => ({
    title: service.title,
    body: service.summary,
    bullets: service.highlights,
  }));
}

export default function VisaServicesPage() {
  const compliance = getComplianceConfig(siteData);
  const sections = sectionsFromServices(siteData.services);
  return (
    <SiteShell siteData={siteData} currentPath="/visa-services">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Information and Education Support", path: "/visa-services" },
        ])}
      />
      <ContentPage
        eyebrow="Information and Education Support"
        title="Information and Education Support"
        intro="Browse general information about Australian visa categories and education options. These pages summarise public information and link to official sources. They are not a substitute for advice from a registered migration agent or Australian legal practitioner."
        complianceBanner={compliance.categoryPageBanner}
        complianceFooter={compliance.categoryPageFooter}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/visa-services", label: "Information and Education Support" },
        ]}
        sections={sections}
        currentPath="/visa-services"
        related={[
          { href: "/assessment", title: "Official Information Finder" },
          { href: "/education-consultation", title: "Education course enquiry" },
          { href: "/faq", title: "FAQ" },
          { href: "/book-information-session", title: "Book information discussion" },
        ]}
      />
    </SiteShell>
  );
}
