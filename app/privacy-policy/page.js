import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { buildMetadata } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy | MinRosh Migration",
  description: "Read the MinRosh Migration privacy policy for how enquiries, contact data, and communications are handled.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <SiteShell siteData={siteData} currentPath="/privacy-policy">
      <ContentPage
        eyebrow="Legal"
        title="Privacy Policy"
        intro="This starter privacy policy explains the general approach MinRosh Migration takes to handling contact details, enquiry information, and communications submitted through the website."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/privacy-policy", label: "Privacy Policy" },
        ]}
        sections={[
          {
            title: "Information we collect",
            body: "MinRosh Migration may collect personal information that visitors provide through contact forms, WhatsApp links, email communication, and consultation requests. This may include your name, email address, phone number, destination preference, and information about your migration or study goals.",
          },
          {
            title: "How information is used",
            body: "Information is generally used to respond to enquiries, organise consultations, send service-related follow-up messages, and improve how MinRosh understands the needs of visitors using the website.",
          },
          {
            title: "Storage and access",
            body: "Website enquiry information may be stored securely on MinRosh systems or trusted service providers used to operate the business. Access is intended to be limited to authorised personnel handling enquiries, communications, and administration.",
          },
          {
            title: "Updates to this policy",
            body: "This privacy policy is a professional starter version and should be reviewed against your final business processes, data-handling tools, and legal obligations before launch.",
          },
        ]}
      />
    </SiteShell>
  );
}
