"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

export default function ReportsPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports/summary")
      .then((r) => r.json())
      .then((payload) => {
        const d = payload?.data && typeof payload.data === "object" ? payload.data : payload;
        setSummary(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !summary) {
    return (
      <div>
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Reports</h1>
        <AdminTableSkeleton rows={4} cols={2} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Reports</h1>
      <p className="mb-8 text-muted-foreground">Generated at {summary.generatedAt?.slice(0, 19) || "—"}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customers</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{summary.customers?.total ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total: {summary.leads?.total ?? 0}</p>
            <p>Open: {summary.leads?.open ?? 0}</p>
            <p>Converted: {summary.leads?.converted ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total: {summary.opportunities?.total ?? 0}</p>
            <ul className="mt-2 text-sm text-muted-foreground">
              {Object.entries(summary.opportunities?.byStage || {}).map(([k, v]) => (
                <li key={k}>
                  {k}: {v}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Interactions: {summary.interactions?.total ?? 0}</p>
            <p>Last 7d: {summary.interactions?.last7d ?? 0}</p>
            <p>Enquiries file rows: {summary.enquiries?.total ?? 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
