"use client";

import Link from "next/link";
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
    {
      label: "Website enquiries",
      value: stats.enquiries,
      href: "/admin/crm",
      hint: "CRM & enquiries",
    },
    {
      label: "Customers",
      value: stats.customers,
      href: "/admin/customers",
      hint: "All customers",
    },
    {
      label: "Prospective (for campaigns)",
      value: stats.prospective,
      href: "/admin/customers?tab=prospective",
      hint: "Prospective tab",
    },
    {
      label: "Invoices",
      value: stats.invoices,
      href: "/admin/invoices",
      hint: "All invoices",
    },
    {
      label: "Pending invoices",
      value: stats.pendingInvoices,
      href: "/admin/invoices?status=pending",
      hint: "Pending only",
    },
    {
      label: "Success stories (admin list)",
      value: stats.successStories,
      href: "/admin/success-stories",
      hint: "Edit homepage stories",
    },
    {
      label: "Audit log entries",
      value: stats.auditEntries,
      href: "/admin/audit",
      hint: "Activity log",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Card className="h-full border-border transition-colors group-hover:border-primary/40 group-hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums">{item.value}</p>
              <p className="mt-2 text-xs text-primary group-hover:underline">
                {item.hint} →
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
