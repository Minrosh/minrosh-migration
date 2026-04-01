import siteData from "../data/site.json";
import newsData from "../data/news.json";
import { PortalPage } from "../components/portal-page";
import { StructuredData } from "../components/structured-data";
import { buildMetadata, faqJsonLd } from "../lib/seo";

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
  return (
    <>
      <StructuredData data={faqJsonLd(siteData.faq)} />
      <PortalPage siteData={siteData} newsData={newsData} />
    </>
  );
}
