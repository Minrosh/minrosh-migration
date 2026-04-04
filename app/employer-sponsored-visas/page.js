import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { TsmitSalaryCheck } from "../../components/tsmit-salary-check";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { buildMetadata, breadcrumbJsonLd } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Employer-Sponsored Visas Australia | MinRosh Migration",
  description:
    "Explore employer-sponsored visa pathways in Australia with guidance on worker eligibility, sponsorship context, and the practical next steps before application.",
  path: "/employer-sponsored-visas",
  keywords: [
    "employer sponsored visa Australia",
    "Skills in Demand visa Australia",
    "TSMIT Australia",
    "482 visa guidance",
    "186 visa consultation Brisbane",
  ],
});

const sections = [
  {
    title: "How employer-sponsored visas usually work",
    body:
      "Employer-sponsored pathways can be relevant where a skilled independent route is not the strongest immediate option or where a business is willing to support the applicant. In practice, these pathways often depend on occupation fit, sponsorship readiness, work history, and whether the role and employer context align properly.",
    bullets: [
      "Guidance for worker-side pathway planning",
      "Early review of occupation, role fit, and timing",
      "Clearer preparation before deeper sponsorship discussions",
    ],
  },
  {
    title: "What MinRosh helps clarify",
    body:
      "Many applicants are unsure whether they should focus first on employer sponsorship, direct PR competitiveness, or a different interim option. MinRosh helps clarify those trade-offs early so you can avoid investing time in the wrong sequence.",
    bullets: [
      "Worker profile review before deeper employer-sponsored planning",
      "Practical discussion of risks, timing, and alternatives",
      "Support for cases where sponsorship is one part of a broader strategy",
    ],
  },
  {
    title: "When a consultation makes sense",
    body:
      "A consultation is useful if you already have an employer conversation underway, if your skilled points profile is not yet strong enough for direct PR, or if you need help understanding whether sponsorship is a realistic path at all.",
  },
];

export default function EmployerSponsoredPage() {
  return (
    <SiteShell siteData={siteData} currentPath="">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Employer-Sponsored Visas", path: "/employer-sponsored-visas" },
        ])}
      />
      <ContentPage
        eyebrow="Employer-Sponsored Visas"
        title="Employer-sponsored visa guidance with clearer worker-side strategy"
        intro="Employer sponsorship can be a practical pathway for some applicants, especially where direct PR is not the strongest immediate route. MinRosh helps workers understand whether sponsorship is realistic, what to prepare first, and how it fits into the bigger migration strategy."
        alertBanner={{
          title: "TSMIT and Skills in Demand (SID)",
          body:
            "The Temporary Skilled Migration Income Threshold (TSMIT) is updated over time (including typical indexation from 1 July each financial year). Sponsored roles must meet the threshold and Skills in Demand settings that apply when the nomination is assessed — figures in blog posts or forums go out of date quickly. Always confirm the current TSMIT, occupation list, and stream (Specialist / Core / Essential) on the Department of Home Affairs website before you rely on any number.",
          href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",
          linkLabel: "Department of Home Affairs visa listing",
        }}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/employer-sponsored-visas", label: "Employer-Sponsored Visas" },
        ]}
        sections={sections}
        related={[
          { href: "/skilled-migration", title: "Skilled Migration" },
          { href: "/assessment", title: "Free Assessment" },
          { href: "/contact", title: "Contact MinRosh" },
        ]}
        asideTools={<TsmitSalaryCheck />}
      />
    </SiteShell>
  );
}
