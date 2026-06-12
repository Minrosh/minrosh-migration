import { GoogleAnalytics } from "./google-analytics";
import { StructuredData } from "./structured-data";
import { WebVitalsReporter } from "./web-vitals-reporter";
import { businessJsonLd, jsonLdGraph, organizationJsonLd } from "@/lib/seo";

/**
 * Marketing-only head/body extras (GA + org schema). Kept out of root layout so public
 * pages avoid nonce headers and can be statically cached with hash CSP.
 */
export function MarketingHeadExtras({ siteData }) {
  return (
    <>
      <GoogleAnalytics />
      <WebVitalsReporter />
      <StructuredData data={jsonLdGraph(organizationJsonLd(siteData), businessJsonLd(siteData))} />
    </>
  );
}
