import { Suspense } from "react";
import { CrmInsightsPanel } from "@/components/admin/crm-insights-panel";

export default function CrmInsightsPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">CRM Insights</h1>
      <p className="mb-8 text-muted-foreground">
        Quick operational insights for customer lifecycle, duplicates, and follow-up priorities.
      </p>
      <Suspense fallback={<p className="text-muted-foreground">Loading CRM insights…</p>}>
        <CrmInsightsPanel />
      </Suspense>
    </div>
  );
}
