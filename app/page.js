import siteDataStatic from "../data/site.json";
import { getNewsData } from "../lib/news-data";
import { HomeTabServer } from "../components/home/home-tab-server";
import { HomePageContent } from "../components/home-page-content";
import { SiteShell } from "../components/site-shell";
import { StructuredData } from "../components/structured-data";
import { buildMetadata, faqJsonLd } from "../lib/seo";
import { getHomeSiteData } from "../lib/home-site-data";

export const revalidate = 60;

const homeMetadataBase = buildMetadata({
  title: "Migration Agent Australia | Skilled, Partner & Student Visa Help | MinRosh",
  description:
    "Get registered migration guidance for skilled, partner, student, and employer-sponsored visas. Compare pathways, reduce refusal risk, and book a consultation.",
  path: "/",
  keywords: [
    "Australian migration agent",
    "Migration agent Australia",
    "Migration agent Brisbane",
    "Skilled migration Australia",
    "Partner visa Australia",
    "Student visa Australia",
    "Employer sponsored visa Australia",
    "Registered migration agent Australia",
    "Migration Sri Lanka to Australia",
    "Australian PR pathways",
    "Visa lodgement preparation",
  ],
});

/** Homepage OG/Twitter dimensions aligned to 1200×630 best practice (asset may be larger). */
export const metadata = {
  ...homeMetadataBase,
  openGraph: {
    ...homeMetadataBase.openGraph,
    images: (homeMetadataBase.openGraph?.images || []).map((img) => ({
      ...img,
      width: 1200,
      height: 630,
    })),
  },
};

export default function HomePage() {
  const siteData = getHomeSiteData(siteDataStatic);
  const newsData = getNewsData();

  return (
    <>
      <StructuredData data={faqJsonLd(siteData.faq)} />
      <SiteShell siteData={siteData} currentPath="/">
        <HomePageContent
          siteData={siteData}
          homeTab={<HomeTabServer siteData={siteData} newsData={newsData} />}
        />
      </SiteShell>
    </>
  );
}
