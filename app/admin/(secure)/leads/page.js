"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/leads")
      .then((r) => r.json())
      .then((d) => {
        setLeads(d.leads || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function convert(leadId) {
    setMsg("");
    const res = await fetch("/api/admin/leads/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error || "Convert failed (link lead to a customer first)");
      return;
    }
    setMsg(`Created opportunity ${data.opportunity?.id}`);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: "converted", opportunityId: data.opportunity?.id } : l)),
    );
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Leads</h1>
        <AdminTableSkeleton rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Leads</h1>
      <p className="mb-8 text-muted-foreground">
        Scored leads in <code className="rounded bg-muted px-1">data/crm-leads.json</code>. Convert requires{" "}
        <code className="rounded bg-muted px-1">customerId</code> on the lead.
      </p>
      {msg ? <p className="mb-4 text-sm text-muted-foreground">{msg}</p> : null}
      <div className="grid gap-4">
        {leads.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No leads yet</CardTitle>
              <CardDescription>Create via API or extend enquiry flow to auto-create leads.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          leads.map((l) => (
            <Card key={l.id}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">
                    {l.firstName} {l.lastName}
                  </CardTitle>
                  <CardDescription>
                    {l.email} · {l.mainNeed} · score {l.totalScore ?? "—"}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-muted px-2 py-1 text-xs">{l.status}</span>
                  {l.status === "open" && l.customerId ? (
                    <Button type="button" size="sm" onClick={() => convert(l.id)}>
                      Convert to opportunity
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <p>customerId: {l.customerId || "—"}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
