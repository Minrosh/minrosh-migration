import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Visitor Visas Australia | MinRosh Migration",
  description:
    "Get practical guidance on visitor visa applications, travel purpose, supporting documents, and common refusal risks before you lodge.",
  path: "/visitor-visas",
  keywords: [
    "visitor visa Australia",
    "tourist visa Australia guidance",
    "visitor visa consultation Brisbane",
  ],
});

const sections = [
  {
    title: "Visitor visa guidance in practical terms",
    body:
      "Visitor visa matters often look simple on the surface, but clean supporting documents and a credible explanation of travel purpose still matter. Applicants can run into difficulty when funds, ties, or the overall purpose of travel are not explained clearly enough.",
    bullets: [
      "Travel-purpose and document-readiness review",
      "Clearer understanding of common refusal risks",
      "Practical next-step support before lodgement",
    ],
  },
  {
    title: "What MinRosh helps review",
    body:
      "MinRosh can help you think through whether your visitor visa case is ready, which parts of the evidence need strengthening, and whether there are any timing or background issues that should be addressed before you proceed.",
    bullets: [
      "Funds, ties, and travel-purpose positioning",
      "Review of avoidable evidence gaps",
      "Support for visitor matters that may need a more careful explanation",
    ],
  },
  {
    title: "When to contact us",
    body:
      "A consultation is a good next step if you are concerned about refusal risks, prior visa history, or whether your current documents present a strong enough visitor case.",
  },
];

export default function VisitorVisasPage() {
  return (
    <SiteShell siteData={siteData} currentPath="">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Visitor Visas", path: "/visitor-visas" },
        ])}
      />
      <ContentPage
        eyebrow="Visitor Visas"
        title="Visitor visa guidance with stronger document and travel-purpose positioning"
        intro="Visitor visa applications benefit from more than a basic form submission. MinRosh helps applicants understand what documents matter most, how to explain the purpose of travel clearly, and where avoidable refusal risks may exist before they move forward."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/visitor-visas", label: "Visitor Visas" },
        ]}
        sections={sections}
        related={[
          { href: "/assessment", title: "Free Assessment" },
          { href: "/book-consultation", title: "Book Consultation" },
          { href: "/contact", title: "Contact MinRosh" },
        ]}
      />
    </SiteShell>
  );
}
