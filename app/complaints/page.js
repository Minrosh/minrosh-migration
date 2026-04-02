import siteData from "../../data/site.json";
import { ContentPage } from "../../components/content-page";
import { SiteShell } from "../../components/site-shell";
import { buildMetadata } from "../../lib/seo";

export const metadata = buildMetadata({
  title: "Complaints Process | MinRosh Migration",
  description: "Read the MinRosh Migration complaints process and how service concerns can be raised.",
  path: "/complaints",
});

export default function ComplaintsPage() {
  return (
    <SiteShell siteData={siteData} currentPath="/complaints">
      <ContentPage
        eyebrow="Legal"
        title="Complaints Process"
        intro="MinRosh Migration aims to handle concerns professionally, respectfully, and in a timely way. This starter page outlines a basic complaints pathway for website and service matters."
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/complaints", label: "Complaints" },
        ]}
        sections={[
          {
            title: "How to raise a concern",
            body: "Clients or visitors can raise concerns by email or through the contact page, providing a clear summary of the issue, key dates, and the outcome they are seeking.",
          },
          {
            title: "How complaints are reviewed",
            body: "MinRosh Migration will normally review the concern, gather any relevant communication history, and respond with the next steps or requested clarification where necessary.",
          },
          {
            title: "Escalation",
            body: "If a matter cannot be resolved directly, the final process should be aligned to your formal business complaint-handling procedure and any regulatory requirements that apply.",
          },
        ]}
      />
    </SiteShell>
  );
}
