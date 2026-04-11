"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [integrations, setIntegrations] = useState(null);
  const [integrationTest, setIntegrationTest] = useState(null);
  const [supabaseTest, setSupabaseTest] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testingDb, setTestingDb] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setErr(d.error);
        else setStats(d);
      })
      .catch(() => setErr("Could not load stats"));
    fetch("/api/admin/integrations")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setIntegrations(d);
      })
      .catch(() => {});
  }, []);

  if (err) return <p className="text-destructive">{err}</p>;
  if (!stats) return <p className="text-muted-foreground">Loading…</p>;

  async function runIntegrationTest() {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/integrations/test", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      setIntegrationTest(data);
    } catch {
      setIntegrationTest({ ok: false, results: [{ name: "Request", ok: false, detail: "Network error" }] });
    }
    setTesting(false);
  }

  async function runSupabaseProbe() {
    setTestingDb(true);
    try {
      const res = await fetch("/api/admin/integrations/supabase");
      const data = await res.json().catch(() => ({}));
      setSupabaseTest(data);
    } catch {
      setSupabaseTest({ ok: false, detail: "Network error" });
    }
    setTestingDb(false);
  }

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
    {
      label: "Google Sheets leads",
      value: stats.leadSheet?.ok ? stats.leadSheet.totalRows : "—",
      href: "/admin/crm",
      hint: "Sheet-backed CRM rows",
    },
  ];

  return (
    <div className="space-y-6">
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
      {integrations ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Integrations & environment readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className={integrations.ready ? "text-emerald-400" : "text-amber-400"}>
              {integrations.ready ? "All required variables are configured." : "Some required variables are missing."}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={runIntegrationTest}
                disabled={testing}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
              >
                {testing ? "Running tests…" : "Test Google integrations"}
              </button>
              <button
                type="button"
                onClick={runSupabaseProbe}
                disabled={testingDb}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
              >
                {testingDb ? "Probing…" : "Test Supabase DB"}
              </button>
            </div>
            <ul className="space-y-1">
              {integrations.checks.map((c) => (
                <li key={c.key} className="flex items-center justify-between gap-3">
                  <code className="rounded bg-muted px-1">{c.key}</code>
                  <span className={c.configured ? "text-emerald-400" : "text-amber-400"}>
                    {c.configured ? "configured" : c.required ? "missing (required)" : "optional"}
                  </span>
                </li>
              ))}
            </ul>
            {integrationTest?.results?.length ? (
              <div className="mt-3 space-y-1 rounded-md border border-border p-3">
                <p className={integrationTest.ok ? "text-emerald-400" : "text-amber-400"}>
                  {integrationTest.ok ? "All integration probes passed." : "One or more probes failed."}
                </p>
                <ul className="space-y-1">
                  {integrationTest.results.map((r) => (
                    <li key={r.name} className="flex items-center justify-between gap-2">
                      <span>{r.name}</span>
                      <span className={r.ok ? "text-emerald-400" : "text-amber-400"}>
                        {r.ok ? `PASS - ${r.detail}` : `FAIL - ${r.detail}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {supabaseTest ? (
              <div className="mt-3 space-y-1 rounded-md border border-border p-3">
                <p className={supabaseTest.ok ? "text-emerald-400" : "text-amber-400"}>
                  {supabaseTest.ok
                    ? "Supabase: connected (minrosh_db_ping readable)."
                    : `Supabase: ${supabaseTest.configured ? "configured but failed" : "not configured or failed"}.`}
                </p>
                {supabaseTest.detail ? <p className="text-xs text-muted-foreground">{supabaseTest.detail}</p> : null}
                {supabaseTest.hint ? <p className="text-xs text-muted-foreground">{supabaseTest.hint}</p> : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
