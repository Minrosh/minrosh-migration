import siteData from "../data/site.json";
import newsData from "../data/news.json";
import { PortalPage } from "../components/portal-page";

export default function HomePage() {
  return <PortalPage siteData={siteData} newsData={newsData} />;
}
