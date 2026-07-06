import siteDataStatic from "@/data/site.json";
import newsData from "@/data/news.json";
import { SiteShell } from "@/components/site-shell";
import { UltraMaximumLayout } from "@/components/ultra-maximum-layout";
import { HomeBelowFoldLazy } from "@/components/home-below-fold-lazy";
import { HomeHeroPremium } from "@/components/home/home-hero-premium";
import { HomeQuizEntrySection } from "@/components/home/home-quiz-entry-section";
import { getHomePagePreparedData } from "@/lib/home-site-data";

const { siteData, homeHeroWhatsAppHref } = getHomePagePreparedData(siteDataStatic);

export function HomeLegacyPage() {
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
