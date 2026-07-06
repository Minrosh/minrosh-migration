import { WebsiteCompliancePanel } from "@/features/admin-panel/components/website/website-compliance-panel";

export default function AdminWebsiteCompliancePage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Legal / compliance</h1>
      <p className="mb-8 text-muted-foreground">
        Central MARN and disclaimer controls. Stored in{" "}
        <code className="rounded bg-muted px-1">data/website-compliance.json</code>.
      </p>
      <WebsiteCompliancePanel />
    </div>
  );
}
