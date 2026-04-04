import siteDataStatic from "../data/site.json";
import newsData from "../data/news.json";
import { HomeTabServer } from "../components/home/home-tab-server";
import { PortalPage } from "../components/portal-page";
import { SiteFooter } from "../components/site-footer";
import { StructuredData } from "../components/structured-data";
import { buildMetadata, faqJsonLd } from "../lib/seo";
import { getFooterStats } from "../lib/site-stats";
import { getHomeSiteData } from "../lib/home-site-data";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Migration Agent Brisbane | Registered Visa Help Australia | MinRosh Migration",
  description:
    "Looking for a registered migration agent in Brisbane? MinRosh Migration provides expert guidance for skilled migration, partner visas, student visas, employer-sponsored pathways, and other Australian visa options.",
  path: "/",
  keywords: [
    "Migration agent Brisbane",
    "Registered migration agent Australia",
    "Visa consultant Brisbane",
    "Australian migration services",
    "Immigration agent Australia",
  ],
});

export default function HomePage() {
  const siteData = getHomeSiteData(siteDataStatic);
  const footerStats = getFooterStats();

  return (
    <>
      <StructuredData data={faqJsonLd(siteData.faq)} />
      <PortalPage
        siteData={siteData}
        homeTab={<HomeTabServer siteData={siteData} newsData={newsData} />}
        footer={<SiteFooter siteData={siteData} initialStats={footerStats} />}
      />
    </>
  );
}
