"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

async function parseJsonResponseSafe(response) {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    return {};
  }
}

function StatCard({ label, value, hint }) {
  return (
    <Card className="bg-card/90 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}</CardContent>
    </Card>
  );
}

export function CrmInsightsPanel() {
  const [stats, setStats] = useState(null);
  const [duplicatePairs, setDuplicatePairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const [statsRes, dupRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/customers?duplicates=1"),
        ]);
        const statsPayload = await parseJsonResponseSafe(statsRes);
        const dupPayload = await parseJsonResponseSafe(dupRes);
        if (!statsRes.ok) throw new Error(statsPayload?.error || "Could not load stats");
        if (!dupRes.ok) throw new Error(dupPayload?.error || "Could not load duplicate candidates");
        if (cancelled) return;
        const statsData =
          statsPayload?.data && typeof statsPayload.data === "object" ? statsPayload.data : statsPayload;
        const dupData = dupPayload?.data && typeof dupPayload.data === "object" ? dupPayload.data : dupPayload;
        setStats(statsData);
        setDuplicatePairs(Array.isArray(dupData?.pairs) ? dupData.pairs : []);
      } catch (err) {
        if (!cancelled) setError(String(err?.message || "Failed to load CRM insights"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const leadSheetHint = useMemo(() => {
    if (!stats?.leadSheet?.ok) return "Google Sheet sync unavailable";
    const rows = Number(stats.leadSheet.totalRows || 0);
    return `${rows} rows synced in lead sheet`;
  }, [stats]);

  if (loading) {
    return <p className="text-muted-foreground">Loading CRM insights…</p>;
  }

  return (
    <div className="space-y-8">
      {error ? (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Could not load insights</CardTitle>
            <CardDescription className="text-destructive">{error}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Prospective customers" value={stats?.prospective ?? 0} hint="Potential follow-up pool" />
        <StatCard label="Total customers" value={stats?.customers ?? 0} hint="All lifecycle stages" />
        <StatCard label="Pending invoices" value={stats?.pendingInvoices ?? 0} hint="Needs finance follow-up" />
        <StatCard label="Enquiries" value={stats?.enquiries ?? 0} hint={leadSheetHint} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Duplicate customer candidates</CardTitle>
          <CardDescription>
            Pairs detected by name/email similarity. Review these in Customers and merge where appropriate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {duplicatePairs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No duplicate candidates detected right now.</p>
          ) : (
            <div className="space-y-2">
              {duplicatePairs.slice(0, 8).map((pair, idx) => (
                <div
                  key={`${pair.a?.id || "a"}-${pair.b?.id || "b"}-${idx}`}
                  className="flex flex-col gap-3 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {pair.a?.name || "Unknown"} <span className="text-muted-foreground">vs</span>{" "}
                      {pair.b?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pair.a?.email || "—"} • {pair.b?.email || "—"}
                    </p>
                  </div>
                  <Badge variant="secondary">Review in Customers</Badge>
                </div>
              ))}
            </div>
          )}
          <div>
            <Button asChild variant="outline" size="sm">
              <a href="/admin/customers">Open Customers</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
