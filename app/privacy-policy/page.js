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
        intro="This policy explains how MinRosh Migration collects, uses, stores, and safeguards personal information provided through website forms, email, phone, and related services."
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
            body: "Information is used to respond to enquiries, schedule consultations, deliver service-related communication, and maintain administrative records required to provide migration and education support services.",
          },
          {
            title: "Storage, security, and access",
            body: "Information may be stored on secure systems operated by MinRosh Migration and trusted service providers used for communications and business operations. Access is limited to authorised personnel who need the information to perform service, administration, or compliance duties.",
          },
          {
            title: "Your choices and contact",
            body: "You can request access to your personal information or ask for corrections by contacting MinRosh Migration. Marketing communication preferences can be updated at any time using unsubscribe links or direct contact.",
          },
          {
            title: "Policy updates",
            body: "This policy may be updated from time to time to reflect operational, legal, or regulatory changes. The latest version is published on this page.",
          },
        ]}
      />
    </SiteShell>
  );
}
