import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "../../lib/seo";
import { mergedFaqItems } from "../../lib/intelligence/faq";

export const metadata = buildMetadata({
  title: "Migration FAQ | MinRosh Migration",
  description:
    "Read MinRosh Migration's frequently asked questions covering Australian visa timing, migration agent support, costs, and common next-step concerns.",
  path: "/faq",
  keywords: [
    "migration FAQ Australia",
    "visa questions Brisbane",
    "MinRosh migration FAQ",
  ],
});

const faqOfficialResources = [
  {
    label: "Department of Home Affairs — visa listing",
    href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",
  },
  {
    label: "Department of Home Affairs — Visa Finder",
    href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder",
  },
];

const faqExtraSections = [
  {
    title: "Where to verify Australian visa rules",
    body:
      "FAQ answers here are general. For the visa you are considering, open the official subclass page from the Department of Home Affairs visa listing and read current criteria, charges, and forms. The Visa Finder can help when you are unsure which stream to open first.",
  },
];

export default function FAQPage() {
  const faqItems = mergedFaqItems();
  return (
    <SiteShell siteData={siteData} currentPath="/faq">
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
          faqJsonLd(faqItems),
        ]}
      />
      <ContentPage
        eyebrow="FAQ"
        title="Frequently asked questions about migration pathways and next steps"
        intro="These answers cover some of the most common questions MinRosh receives before consultation. They are general in nature and should not replace advice tailored to your own circumstances. For subclass-specific rules, always use the Department of Home Affairs visa listing and the page for your visa. For a walkthrough of those tools with links to MinRosh services, see the official sources hub."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/faq", label: "FAQ" },
        ]}
        officialResources={faqOfficialResources}
        currentPath="/faq"
        sections={faqExtraSections}
        faq={faqItems}
        related={[
          { href: "/australian-visas-official-sources", title: "Australian visas official sources hub" },
          { href: "/assessment", title: "Free Assessment" },
          { href: "/book-consultation", title: "Book Consultation" },
          { href: "/contact", title: "Contact MinRosh" },
        ]}
      />
    </SiteShell>
  );
}
