import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { buildMetadata } from "../../lib/seo";
import { getComplianceConfig } from "../../lib/compliance";

export const metadata = buildMetadata({
  title: "General Information Disclaimer | MinRosh Migration",
  description:
    "General information disclaimer for MinRosh Migration: public information only, not immigration assistance or legal advice.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  const compliance = getComplianceConfig(siteData);
  return (
    <SiteShell siteData={siteData} currentPath="/disclaimer">
      <ContentPage
        eyebrow="Legal"
        title="General Information Disclaimer"
        intro="The information on this website is general information compiled from sources available to the public. It is not immigration assistance, immigration legal assistance, legal advice, or a recommendation about what any person should do."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/disclaimer", label: "General Information Disclaimer" },
        ]}
        sections={[
          {
            title: "Not a registered migration agent or legal practice",
            body: "MinRosh Migration is not a registered migration agent or Australian legal practice. We do not assess a person’s visa eligibility, recommend a visa category, apply migration law or procedure to individual circumstances, prepare or help prepare visa applications or migration documents, lodge applications, act as an authorised recipient, communicate with the Department of Home Affairs or a review body on a user’s behalf, or represent users in migration matters.",
          },
          {
            title: "Information can change",
            body: "Migration law, policy, fees, forms, processing arrangements, occupation lists, invitation settings, state nomination requirements, and education-provider information can change without notice. While reasonable care may be taken when presenting information, users must check the current information on the relevant official website before making a decision or taking action.",
          },
          {
            title: "No professional advisory relationship",
            body: "Use of this website, a questionnaire, email, telephone call, form, chatbot, or education-support service does not create a registered migration agent–client, solicitor–client, fiduciary, or professional advisory relationship.",
          },
          {
            title: "Automated and AI-supported features",
            body: "Information generated or displayed by an automated or AI-supported feature is general information only. It must not be relied on as an assessment, recommendation, prediction, or substitute for authorised professional advice.",
          },
          {
            title: "When to seek authorised help",
            body: `If you require advice about your circumstances, help choosing a visa, or help preparing or lodging an application, consult a registered migration agent listed on the official Register of Migration Agents or an Australian legal practitioner. ${compliance.noGuaranteeStatement || ""}`.trim(),
          },
        ]}
        related={[
          { href: "/privacy-policy", title: "Privacy Policy" },
          { href: "/terms-of-use", title: "Terms of Use" },
          { href: "/contact", title: "Contact MinRosh" },
        ]}
      />
    </SiteShell>
  );
}
