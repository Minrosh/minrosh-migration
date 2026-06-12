import { HomeBuyerJourneyStrip } from "./home-buyer-journey-strip";
import { HomeDestinationCards } from "./home-destination-cards";
import { HomeServicesPathways } from "./home-services-pathways";
import { HomePlanningTools } from "./home-planning-tools";
import { HomeDeferredCarouselsLazy } from "./home-deferred-carousels-lazy";
import { HomeFinalCta } from "./home-final-cta";

export function HomeBelowFold({ countries, newsItems }) {
  return (
    <>
      <HomeBuyerJourneyStrip />
      <HomeDestinationCards countries={countries} />
      <HomeServicesPathways />
      <HomePlanningTools />
      <HomeDeferredCarouselsLazy newsItems={newsItems} />
      <HomeFinalCta />
    </>
  );
}
