"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  adminApiErrorMessage,
  fetchAdminApi,
  parseJsonResponseSafe,
} from "@/lib/admin/fetch-admin-api";

function enquiryLabel(e) {
  const name = [e?.firstName, e?.lastName].filter(Boolean).join(" ").trim();
  return name || e?.email || "Enquiry";
}

function devDashLog(event, detail) {
  if (process.env.NODE_ENV === "production") return;
  console.info("[admin-dashboard]", event, detail);
}

function isAbortError(cause) {
  return cause instanceof DOMException && cause.name === "AbortError";
}

function SectionError({ message, needsLogin }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
      <p>{message}</p>
      {needsLogin ? (
        <Link href="/admin/login?from=/admin" className="mt-2 inline-block font-medium underline-offset-4 hover:underline">
          Sign in to admin
        </Link>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, href, hint, loading, error }) {
  if (loading) {
    return (
      <Card className="h-full border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-9 w-16 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full border-destructive/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link
      href={href}
      className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="h-full border-border transition-colors group-hover:border-primary/40 group-hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tabular-nums">{value}</p>
          <p className="mt-2 text-xs text-primary group-hover:underline">{hint} →</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [statsNeedsLogin, setStatsNeedsLogin] = useState(false);

  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(true);
  const [enquiriesError, setEnquiriesError] = useState("");

  const [recentAudit, setRecentAudit] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState("");

  const [integrations, setIntegrations] = useState(null);
  const [integrationsLoading, setIntegrationsLoading] = useState(true);
  const [integrationTest, setIntegrationTest] = useState(null);
  const [supabaseTest, setSupabaseTest] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testingDb, setTestingDb] = useState(false);

  useEffect(() => {
    devDashLog("mounted", {});
    let cancelled = false;

    async function loadStats() {
      devDashLog("fetch:start", { url: "/api/admin/stats" });
      setStatsLoading(true);
      setStatsError("");
      try {
        const res = await fetchAdminApi("/api/admin/stats", {}, 20_000);
        const payload = await parseJsonResponseSafe(res);
        if (cancelled) return;
        devDashLog("fetch:done", { url: "/api/admin/stats", status: res.status, ok: res.ok });
        if (!res.ok || payload?.error?.message) {
          setStatsError(adminApiErrorMessage(res, payload));
          setStatsNeedsLogin(res.status === 401);
          setStats(null);
        } else {
          const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
          setStats(data);
        }
      } catch (cause) {
        if (cancelled || isAbortError(cause)) return;
        devDashLog("fetch:fail", { url: "/api/admin/stats", error: String(cause) });
        setStatsError("Could not load stats. Check your connection or sign in again.");
        setStatsNeedsLogin(true);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    async function loadEnquiries() {
      setEnquiriesLoading(true);
      setEnquiriesError("");
      try {
        const res = await fetchAdminApi("/api/admin/enquiries?limit=5&offset=0");
        const payload = await parseJsonResponseSafe(res);
        if (cancelled) return;
        if (!res.ok) {
          setEnquiriesError(adminApiErrorMessage(res, payload));
          setRecentEnquiries([]);
        } else {
          const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
          setRecentEnquiries(Array.isArray(data.enquiries) ? data.enquiries : []);
        }
      } catch (cause) {
        if (cancelled || isAbortError(cause)) return;
        setEnquiriesError("Could not load recent enquiries.");
      } finally {
        if (!cancelled) setEnquiriesLoading(false);
      }
    }

    async function loadAudit() {
      setAuditLoading(true);
      setAuditError("");
      try {
        const res = await fetchAdminApi("/api/admin/audit?limit=5&offset=0");
        const payload = await parseJsonResponseSafe(res);
        if (cancelled) return;
        if (!res.ok) {
          setAuditError(adminApiErrorMessage(res, payload));
          setRecentAudit([]);
        } else {
          const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
          setRecentAudit(Array.isArray(data.entries) ? data.entries : []);
        }
      } catch (cause) {
        if (cancelled || isAbortError(cause)) return;
        setAuditError("Could not load recent activity.");
      } finally {
        if (!cancelled) setAuditLoading(false);
      }
    }

    async function loadIntegrations() {
      setIntegrationsLoading(true);
      try {
        const res = await fetchAdminApi("/api/admin/integrations");
        const payload = await parseJsonResponseSafe(res);
        if (cancelled) return;
        if (res.ok && !payload?.error?.message) {
          const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
          if (!data.error) setIntegrations(data);
        }
      } catch {
        /* optional panel */
      } finally {
        if (!cancelled) setIntegrationsLoading(false);
      }
    }

    loadStats();
    loadEnquiries();
    loadAudit();
    loadIntegrations();

    return () => {
      cancelled = true;
      devDashLog("unmounted", {});
    };
  }, []);

  async function runIntegrationTest() {
    setTesting(true);
    try {
      const res = await fetchAdminApi("/api/admin/integrations/test", { method: "POST" });
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
      const res = await fetchAdminApi("/api/admin/integrations/supabase");
      const payload = await parseJsonResponseSafe(res);
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      setSupabaseTest(data);
    } catch {
      setSupabaseTest({ ok: false, detail: "Network error" });
    }
    setTestingDb(false);
  }

  const statItems = stats
    ? [
        { label: "Website enquiries", value: stats.enquiries, href: "/admin/crm", hint: "CRM & enquiries" },
        { label: "Customers", value: stats.customers, href: "/admin/customers", hint: "All customers" },
        {
          label: "Prospective (for campaigns)",
          value: stats.prospective,
          href: "/admin/customers?tab=prospective",
          hint: "Prospective tab",
        },
        { label: "Invoices", value: stats.invoices, href: "/admin/invoices", hint: "All invoices" },
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
        { label: "Audit log entries", value: stats.auditEntries, href: "/admin/audit", hint: "Activity log" },
        {
          label: "Google Sheets leads",
          value: stats.leadSheet?.ok ? stats.leadSheet.totalRows : "—",
          href: "/admin/crm",
          hint: "Sheet-backed CRM rows",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {statsError && !statsLoading ? (
        <SectionError message={statsError} needsLogin={statsNeedsLogin} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statsLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <StatCard key={`sk-${i}`} label="Loading" value="" href="#" hint="" loading />
            ))
          : statItems.map((item) => (
              <StatCard key={item.label} {...item} loading={false} error="" />
            ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent enquiries</CardTitle>
            <CardDescription>
              Five newest website submissions (newest first, same as CRM).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            {enquiriesLoading ? (
              <p className="text-sm text-muted-foreground">Loading enquiries…</p>
            ) : enquiriesError ? (
              <p className="text-sm text-destructive">{enquiriesError}</p>
            ) : recentEnquiries.length === 0 ? (
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
            {auditLoading ? (
              <p className="text-sm text-muted-foreground">Loading activity…</p>
            ) : auditError ? (
              <p className="text-sm text-destructive">{auditError}</p>
            ) : recentAudit.length === 0 ? (
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

      {integrationsLoading ? (
        <p className="text-sm text-muted-foreground">Loading integrations check…</p>
      ) : integrations ? (
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
