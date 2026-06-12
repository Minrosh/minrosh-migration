import siteDataStatic from "../data/site.json";
import newsData from "../data/news.json";
import "./home.css";
import { SiteShell } from "../components/site-shell";
import { UltraMaximumLayout } from "../components/ultra-maximum-layout";
import { HomeBelowFoldLazy } from "../components/home-below-fold-lazy";
import { HomeHeroPremium } from "../components/home/home-hero-premium";
import { HomeQuizEntrySection } from "../components/home/home-quiz-entry-section";
import { getHomePagePreparedData } from "../lib/home-site-data";
import { buildMetadata } from "../lib/seo";

const { siteData, homeHeroWhatsAppHref } = getHomePagePreparedData(siteDataStatic);

export const metadata = buildMetadata({
  title: "Migration Agent Brisbane | Start Your Pathway Check",
  description:
    "Brisbane-based migration and education guidance for Australia, Canada, the UK and New Zealand. Start with a free pathway check and planning tools.",
  path: "/",
  keywords: [
    "migration agent Brisbane",
    "Australia visa guidance",
    "student visa Australia",
    "skilled migration planning",
    "partner visa guidance",
  ],
});

export default function HomePage() {
  return (
    <SiteShell siteData={siteData} currentPath="/">
      <UltraMaximumLayout enableEffects={false}>
        <div className="relative z-10 w-full min-w-0">
          <HomeHeroPremium whatsappHref={homeHeroWhatsAppHref} />

          <div className="w-full max-w-[var(--content-max)] mx-auto px-[var(--content-pad)]">
            <HomeQuizEntrySection />

            <HomeBelowFoldLazy countries={siteData.countries} newsItems={newsData.slice(0, 8)} />
          </div>
        </div>
      </UltraMaximumLayout>
    </SiteShell>
  );
}
