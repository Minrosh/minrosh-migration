"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function enquiryLabel(e) {
  const name = [e?.firstName, e?.lastName].filter(Boolean).join(" ").trim();
  return name || e?.email || "Enquiry";
}

async function parseJsonResponseSafe(response) {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    return {};
  }
}

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [recentAudit, setRecentAudit] = useState([]);
  const [integrations, setIntegrations] = useState(null);
  const [integrationTest, setIntegrationTest] = useState(null);
  const [supabaseTest, setSupabaseTest] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testingDb, setTestingDb] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, enqRes, audRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/enquiries?limit=5&offset=0"),
          fetch("/api/admin/audit?limit=5&offset=0"),
        ]);
        const statsP = await parseJsonResponseSafe(statsRes);
        const statsD = statsP?.data && typeof statsP.data === "object" ? statsP.data : statsP;
        const enqD = enqRes.ok ? await parseJsonResponseSafe(enqRes) : {};
        const audP = audRes.ok ? await parseJsonResponseSafe(audRes) : {};
        const audD = audP?.data && typeof audP.data === "object" ? audP.data : audP;
        if (cancelled) return;
        if (statsP?.error?.message || statsD.error) setErr(statsP?.error?.message || statsD.error);
        else setStats(statsD);
        setRecentEnquiries(Array.isArray(enqD.enquiries) ? enqD.enquiries : []);
        setRecentAudit(Array.isArray(audD.entries) ? audD.entries : []);
      } catch {
        if (!cancelled) setErr("Could not load dashboard");
      }
    })();
    fetch("/api/admin/integrations")
      .then((r) => parseJsonResponseSafe(r))
      .then((payload) => {
        const d = payload?.data && typeof payload.data === "object" ? payload.data : payload;
        if (!payload?.error && !d.error) setIntegrations(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) return <p className="text-destructive">{err}</p>;
  if (!stats) return <p className="text-muted-foreground">Loading…</p>;

  async function runIntegrationTest() {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/integrations/test", { method: "POST" });
      const payload = await parseJsonResponseSafe(res);
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
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
      const payload = await parseJsonResponseSafe(res);
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent enquiries</CardTitle>
            <CardDescription>
              Five newest website submissions (newest first, same as CRM). There is no separate read/unread flag in
              storage yet—use CRM to follow up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            {recentEnquiries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No enquiries on file.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentEnquiries.map((e, i) => (
                  <li key={e.id ? String(e.id) : `enq-${e.createdAt || i}`} className="py-3 first:pt-0">
                    <p className="font-medium leading-snug">{enquiryLabel(e)}</p>
                    <p className="text-xs text-muted-foreground">{e.email || "—"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {e.createdAt ? String(e.createdAt).replace("T", " ").slice(0, 19) : "—"}
                      {e.mainNeed ? ` · ${e.mainNeed}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/crm"
              className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Open CRM →
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>Latest five events from the audit log (newest first).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            {recentAudit.length === 0 ? (
              <p className="text-sm text-muted-foreground">No audit events yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentAudit.map((row) => (
                  <li key={row.id || `${row.createdAt}-${row.action}`} className="py-3 first:pt-0">
                    <p className="text-xs text-muted-foreground">
                      {row.createdAt ? String(row.createdAt).replace("T", " ").slice(0, 19) : "—"}
                    </p>
                    <p className="mt-0.5 font-mono text-xs font-semibold text-foreground">{row.action}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{row.detail || "—"}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/audit"
              className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Full audit log →
            </Link>
          </CardContent>
        </Card>
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
