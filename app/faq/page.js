import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "../../lib/seo";

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

export default function FAQPage() {
  return (
    <SiteShell siteData={siteData} currentPath="/faq">
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
          faqJsonLd(siteData.faq),
        ]}
      />
      <ContentPage
        eyebrow="FAQ"
        title="Frequently asked questions about migration pathways and next steps"
        intro="These answers cover some of the most common questions MinRosh receives before consultation. They are general in nature and should not replace advice tailored to your own circumstances."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/faq", label: "FAQ" },
        ]}
        faq={siteData.faq}
        related={[
          { href: "/assessment", title: "Free Assessment" },
          { href: "/book-consultation", title: "Book Consultation" },
          { href: "/contact", title: "Contact MinRosh" },
        ]}
      />
    </SiteShell>
  );
}
