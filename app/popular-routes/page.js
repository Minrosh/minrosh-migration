import siteData from "../../data/site.json";
import popularRoutes from "../../data/popular-routes.json";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { BreadcrumbsNav } from "../../components/breadcrumbs-nav";
import { PopularRoutesHub } from "../../components/popular-routes-hub";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";

const path = "/popular-routes";

export const metadata = buildMetadata({
  title: "Popular migration routes | Australia, UK, NZ & Canada | MinRosh",
  description:
    "Explore MinRosh pathway hubs for skilled, student, partner, visitor, and global migration routes — filter by destination and open structured guidance before you lodge.",
  path,
  keywords: [
    "popular visa routes Australia",
    "skilled migration Australia",
    "student visa Australia",
    "Canada migration hub",
    "UK visa guidance",
    "New Zealand migration",
  ],
});

export default function PopularRoutesPage() {
  const routes = Array.isArray(popularRoutes) ? popularRoutes : [];

  return (
    <SiteShell siteData={siteData} currentPath={path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Popular routes", path },
        ])}
      />
      <section className="content-page">
        <BreadcrumbsNav
          currentPath={path}
          items={[
            { label: "Home", href: "/" },
            { label: "Popular routes", href: path },
          ]}
        />
        <PopularRoutesHub routes={routes} />
      </section>
    </SiteShell>
  );
}
