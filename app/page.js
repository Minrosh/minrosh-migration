import siteData from "../data/site.json";
import newsData from "../data/news.json";
import "./home.css";
import { SiteShell } from "../components/site-shell";
import { UltraMaximumLayout } from "../components/ultra-maximum-layout";
import { HomeDeferredCarouselsLazy } from "../components/home-deferred-carousels-lazy";
import { HomeBuyerJourneyStrip } from "../components/home-buyer-journey-strip";
import { HomeDestinationCards } from "../components/home-destination-cards";
import { HomePlanningTools } from "../components/home-planning-tools";
import { HomeServicesPathways } from "../components/home-services-pathways";
import { HomeFinalCta } from "../components/home-final-cta";
import { HomeHeroPremium } from "../components/home/home-hero-premium";
import { buildWhatsAppUrl } from "../lib/whatsapp-prefill";

const homeHeroWhatsAppHref = buildWhatsAppUrl(
  siteData.brand.whatsapp,
  "Hi MinRosh Migration, I would like to discuss scheduling or general pathway questions.",
);

export default function HomePage() {
  return (
    <SiteShell siteData={siteData} currentPath="/">
      <UltraMaximumLayout>
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-brand-cream/30">
          <div className="blur-orb bg-brand-rose/25 top-[-10%] left-[-10%]" />
          <div className="blur-orb bg-brand-gold/20 bottom-[-10%] right-[-10%]" />
        </div>

        <div className="relative z-10">
          <HomeHeroPremium whatsappHref={homeHeroWhatsAppHref} />

          <HomeBuyerJourneyStrip />

          <HomeDestinationCards countries={siteData.countries} />

          <HomeServicesPathways />

          <HomePlanningTools />

          <HomeDeferredCarouselsLazy newsItems={newsData} />

          <HomeFinalCta />
        </div>
      </UltraMaximumLayout>
    </SiteShell>
  );
}
