import Link from "next/link";
import siteDataStatic from "../../../data/site.json";
import { getHomeSiteData } from "../../../lib/home-site-data";
import { SiteShell } from "../../../components/site-shell";
import { StructuredData } from "../../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../../lib/seo";
import { getToolDisclaimers } from "../../../lib/tool-disclaimers";
import { StudentCountryCostPlannerClient } from "../../../components/tools/student-country-cost-planner-client";

const path = "/tools/student-country-cost-planner";

export const metadata = buildMetadata({
  title: "Student country & cost planner",
  description:
    "Indicative tuition and living cost bands for early study-abroad budgeting across Australia, Canada, the UK, and New Zealand — not eligibility advice.",
  path,
  keywords: ["student visa costs", "study abroad budget", "Australia student costs", "MinRosh tools"],
});

export default function StudentCountryCostPlannerPage() {
  const siteData = getHomeSiteData(siteDataStatic);
  const { studentPlannerDisclaimer } = getToolDisclaimers();

  return (
    <SiteShell siteData={siteData} currentPath={path}>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools" },
          { name: "Student cost planner", path },
        ])}
      />

      <article className="content-page">
        <nav className="content-breadcrumbs text-sm text-brand-plum/60" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-rose">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href="/tools" className="hover:text-brand-rose">
            Tools
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="text-brand-plum">Student cost planner</span>
        </nav>

        <section className="content-hero">
          <div className="content-hero__grid">
            <div className="content-hero__copy">
              <p className="section-label">Planning tool</p>
              <h1>Student country &amp; cost planner</h1>
              <p>
                Use this planner to sanity-check tuition and living cost <em>ranges</em> before you deep-dive
                institution quotes and official financial thresholds. Nothing here confirms you meet visa rules.
              </p>
              <p className="content-hero__note">
                Prefer destination context? See{" "}
                <Link href="/destinations/australia/student" className="text-brand-rose underline underline-offset-4">
                  Australia student hub
                </Link>{" "}
                and parallel pages for Canada, the UK, and New Zealand.
              </p>
            </div>
          </div>
        </section>

        <section className="content-section" aria-labelledby="planner-heading">
          <h2 id="planner-heading" className="mb-6 text-2xl font-bold text-brand-plum">
            Build an indicative budget
          </h2>
          <StudentCountryCostPlannerClient disclaimer={studentPlannerDisclaimer} />
        </section>

        <section className="content-section bento-hover">
          <h2>Next steps</h2>
          <p className="max-w-2xl text-brand-plum/80">
            When your numbers look realistic, move to{" "}
            <Link href="/assessment" className="font-semibold text-brand-rose underline underline-offset-4">
              the free assessment
            </Link>{" "}
            or{" "}
            <Link href="/book-consultation" className="font-semibold text-brand-rose underline underline-offset-4">
              book a consultation
            </Link>{" "}
            for sequencing, evidence, and course-to-visa alignment.
          </p>
        </section>
      </article>
    </SiteShell>
  );
}
