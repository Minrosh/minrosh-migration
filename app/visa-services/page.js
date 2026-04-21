import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Visa Services | Skilled, Family, Student and Employer Pathways",
  description:
    "Explore MinRosh visa services across skilled migration, family and partner pathways, student visas, employer-sponsored options, and visitor support.",
  path: "/visa-services",
  keywords: ["visa services Australia", "skilled migration services", "partner visa support Brisbane"],
});

function sectionsFromServices(services) {
  return services.map((service) => ({
    title: service.title,
    body: service.summary,
    bullets: service.highlights,
  }));
}

export default function VisaServicesPage() {
  const sections = sectionsFromServices(siteData.services);
  return (
    <SiteShell siteData={siteData} currentPath="/visa-services">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Visa services", path: "/visa-services" },
        ])}
      />
      <ContentPage
        eyebrow="Visa services"
        title="Migration service pathways with clear next-step planning"
        intro="This guide expands each pathway beyond the homepage teaser so you can compare scope, evidence expectations, and the most practical next action before booking."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/visa-services", label: "Visa services" },
        ]}
        sections={sections}
        currentPath="/visa-services"
        related={[
          { href: "/global-pathways", title: "Global pathways strategy" },
          { href: "/skilled-migration-australia-points-guide", title: "Skilled points guide" },
          { href: "/faq", title: "Migration FAQ" },
          { href: "/book-consultation", title: "Book consultation" },
        ]}
      />
    </SiteShell>
  );
}
