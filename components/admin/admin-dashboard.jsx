"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setErr(d.error);
        else setStats(d);
      })
      .catch(() => setErr("Could not load stats"));
  }, []);

  if (err) return <p className="text-destructive">{err}</p>;
  if (!stats) return <p className="text-muted-foreground">Loading…</p>;

  const items = [
    { label: "Website enquiries", value: stats.enquiries },
    { label: "Customers", value: stats.customers },
    { label: "Prospective (for campaigns)", value: stats.prospective },
    { label: "Invoices", value: stats.invoices },
    { label: "Pending invoices", value: stats.pendingInvoices },
    { label: "Success stories (admin list)", value: stats.successStories },
    { label: "Audit log entries", value: stats.auditEntries },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
