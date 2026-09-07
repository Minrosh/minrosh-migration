import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { ContactLeadForm } from "../../components/contact-lead-form";
import { AgentRegistrationStrip } from "../../components/agent-registration-strip";
import { SiteShell } from "../../components/site-shell";
import { StructuredData } from "../../components/structured-data";
import { getComplianceConfig } from "../../lib/compliance";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from "../../lib/seo";

const educationOfficialResources = [
  {
    label: "Department of Home Affairs — visa listing",
    href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing",
  },
  {
    label: "Department of Home Affairs — Visa Finder (study)",
    href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder/study",
  },
  {
    label: "Studying in Australia (Home Affairs)",
    href: "https://immi.homeaffairs.gov.au/visas/studying",
  },
];

const faq = [
  {
    question: "What is an education course enquiry with MinRosh?",
    answer:
      "It is a discussion about education providers, courses, and where available, administrative support with an education-provider admissions application. It is separate from immigration assistance.",
  },
  {
    question: "Will MinRosh assess whether a course leads to a visa or PR outcome?",
    answer:
      "No. We do not advise whether a course will produce a migration outcome, recommend a course as a visa or permanent-residency strategy, assess visa eligibility, or prepare a student visa application.",
  },
];

export const metadata = buildMetadata({
  title: "Education Course Enquiry & Admissions Support | MinRosh",
  description:
    "Enquire about education courses and admissions administration support with MinRosh. Separate from immigration assistance or visa application help.",
  path: "/education-consultation",
  keywords: [
    "Education course enquiry Australia",
    "admissions support",
    "study course information",
  ],
});

export default function EducationConsultationPage() {
  const compliance = getComplianceConfig(siteData);
  return (
    <SiteShell siteData={siteData} currentPath="/education-consultation">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Education Course Enquiry", path: "/education-consultation" },
        ])}
      />
      <StructuredData data={faqJsonLd(faq)} />
      <ContentPage
        eyebrow="Education Course Enquiry & Admissions Support"
        title="Education course enquiry and admissions administration support"
        intro={compliance.educationSupportScope}
        complianceBanner={compliance.categoryPageBanner}
        complianceFooter={compliance.categoryPageFooter}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/education-consultation", label: "Education Course Enquiry" },
        ]}
        officialResources={educationOfficialResources}
        currentPath="/education-consultation"
        sections={[
          {
            title: "What this service covers",
            body: "We can provide general information about education providers and courses and, where available, administrative support with an education-provider admissions application. This service is separate from immigration assistance.",
            bullets: [
              "Course and provider information from publicly available sources",
              "Admissions administration support where offered",
              "Clear separation from visa eligibility or lodgement help",
            ],
          },
          {
            title: "What we do not do",
            body: "We do not advise whether a course will produce a migration outcome, recommend a course as a visa or permanent-residency strategy, assess visa eligibility, prepare a student visa application, or guarantee admission or a visa outcome.",
          },
          {
            title: "Information helpful for an education enquiry",
            body: "Share education preferences and admissions-related details only. Do not send migration history, refusal details, visa strategy questions, passports, or visa application documents.",
            bullets: [
              "Preferred study field, level, and intake period",
              "Academic background relevant to course entry",
              "Budget range for tuition where you are comfortable sharing",
            ],
          },
          {
            title: "Official study visa information",
            body: "Course marketing materials are not the same as visa criteria. Use the Home Affairs visa listing and study pages to read official subclass information. For personalised immigration assistance, contact a registered migration agent or Australian legal practitioner.",
          },
        ]}
        faq={faq}
        belowHero={
          <div className="mx-auto mt-8 w-full max-w-3xl rounded-[2rem] border border-brand-plum/10 bg-white/80 p-4 shadow-sm md:p-6">
            <AgentRegistrationStrip brand={siteData.brand} compliance={compliance} />
            <ContactLeadForm
              className="mt-4"
              defaultEnquiryType="education_enquiry"
              lockEnquiryType
              acknowledgementText={compliance.formAcknowledgementText}
            />
          </div>
        }
        related={[
          { href: "/student-visa-australia", title: "Student visa category information" },
          { href: "/assessment", title: "Official Information Finder" },
          { href: "/contact", title: "Contact MinRosh" },
        ]}
      />
    </SiteShell>
  );
}
