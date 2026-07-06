import { WebsiteDashboardPanel } from "@/features/admin-panel/components/website/website-dashboard-panel";

export default function AdminWebsitePage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Website Manager</h1>
      <p className="mb-8 text-muted-foreground">
        Edit public website wording from draft JSON stores under{" "}
        <code className="rounded bg-muted px-1">data/website-*.json</code>. Sprint 1: admin only — public routes
        unchanged; CMS flag off by default.
      </p>
      <WebsiteDashboardPanel />
    </div>
  );
}
