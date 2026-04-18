import siteDataStatic from "../../data/site.json";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { ImmigrationNewsHub } from "../../components/immigration-news/immigration-news-hub";
import { getHomeSiteData } from "../../lib/home-site-data";
import { getNewsData } from "../../lib/news-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Immigration news & official updates | MinRosh Migration",
  description:
    "Browse MinRosh notes on immigration policy changes across Australia, Canada, the UK, and New Zealand — each with a link to the official announcement.",
  path: "/immigration-news",
  keywords: ["immigration news Australia", "visa policy updates", "IRCC news", "UKVI updates", "Immigration NZ"],
});

export default function ImmigrationNewsHubPage() {
  const siteData = getHomeSiteData(siteDataStatic);
  const items = getNewsData();

  return (
    <SiteShell siteData={siteData} currentPath="/immigration-news" headerBackdrop="neutral">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Immigration news", path: "/immigration-news" },
        ])}
      />
      <section className="content-page immigration-news-page">
        <ImmigrationNewsHub items={items} />
      </section>
    </SiteShell>
  );
}
