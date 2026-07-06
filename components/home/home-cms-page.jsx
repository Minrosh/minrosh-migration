import siteDataStatic from "@/data/site.json";
import newsData from "@/data/news.json";
import { SiteShell } from "@/components/site-shell";
import { UltraMaximumLayout } from "@/components/ultra-maximum-layout";
import { HomeBelowFoldLazy } from "@/components/home-below-fold-lazy";
import { HomeHeroPremium } from "@/components/home/home-hero-premium";
import { HomeQuizEntrySection } from "@/components/home/home-quiz-entry-section";
import { PageRenderer } from "@/components/website-blocks/page-renderer";
import { getHomePagePreparedData } from "@/lib/home-site-data";

const { siteData, homeHeroWhatsAppHref } = getHomePagePreparedData(siteDataStatic);

/** Hero baseline always legacy; CMS hero blocks ignored on `/`. */
export function HomeCmsPage({ content }) {
  const rawSections = Array.isArray(content?.sections) ? content.sections : [];
  const sections = rawSections.filter((s) => s?.type !== "hero");

  return (
    <SiteShell siteData={siteData} currentPath="/">
      <UltraMaximumLayout enableEffects={false}>
        <div className="relative z-10 w-full min-w-0">
          <HomeHeroPremium whatsappHref={homeHeroWhatsAppHref} />
          <div className="w-full max-w-[var(--content-max)] mx-auto px-[var(--content-pad)]">
            {content?.isDraftPreview ? (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                Draft preview — not visible to visitors without draft mode.
              </p>
            ) : null}
            {sections.length > 0 ? (
              <div className="my-8 space-y-6">
                <PageRenderer sections={sections} />
              </div>
            ) : null}
            <HomeQuizEntrySection />
            <HomeBelowFoldLazy countries={siteData.countries} newsItems={newsData.slice(0, 8)} />
          </div>
        </div>
      </UltraMaximumLayout>
    </SiteShell>
  );
}
