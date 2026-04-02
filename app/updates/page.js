import siteData from "../../data/site.json";
import newsData from "../../data/news.json";
import { NewsBoard } from "../../components/news-board";
import { SiteShell } from "../../components/site-shell";
import { buildMetadata } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Migration Updates Hub | Australia, Canada, UK & NZ News | MinRosh",
  description:
    "Track immigration and visa updates across Australia, Canada, the United Kingdom, and New Zealand with MinRosh Migration's filterable updates hub.",
  path: "/updates",
  keywords: [
    "migration updates Australia",
    "visa news Australia",
    "Canada immigration updates",
    "UK visa updates",
  ],
});

export default function UpdatesPage() {
  return (
    <SiteShell siteData={siteData} currentPath="/updates">
      <section className="content-page">
        <section className="content-hero">
          <div className="content-hero__grid">
            <div className="content-hero__copy">
              <p className="section-label">Updates Hub</p>
              <h1>Official immigration news board for the destination systems MinRosh tracks</h1>
              <p>
                This updates hub is designed to help clients and prospective applicants monitor
                official immigration developments while also accessing MinRosh guidance and next
                steps.
              </p>
            </div>
            <div className="content-hero__media" aria-hidden="true">
              <img src="/images/brisbane-skyline.svg" alt="Brisbane skyline and riverfront" />
            </div>
          </div>
        </section>

        <NewsBoard initialNews={newsData} />
      </section>
    </SiteShell>
  );
}
