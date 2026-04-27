"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

async function parseJsonResponseSafe(response) {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    return {};
  }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [pathwayFilter, setPathwayFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setMsg("");
    fetch("/api/admin/leads")
      .then(async (r) => ({ res: r, payload: await parseJsonResponseSafe(r) }))
      .then(({ res, payload }) => {
        const d = payload?.data && typeof payload.data === "object" ? payload.data : payload;
        const errorMessage = payload?.error?.message || payload?.error || d?.error;
        if (!res.ok) {
          setLeads([]);
          setMsg(errorMessage || "Could not load leads.");
          setLoading(false);
          return;
        }
        setLeads(d.leads || []);
        setLoading(false);
      })
      .catch(() => {
        setLeads([]);
        setMsg("Network error while loading leads.");
        setLoading(false);
      });
  }, []);

  async function convert(leadId) {
    setMsg("");
    const res = await fetch("/api/admin/leads/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });
    const payload = await parseJsonResponseSafe(res);
    const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
    const errorMessage = payload?.error?.message || payload?.error;
    if (!res.ok) {
      setMsg(errorMessage || "Convert failed (link lead to a customer first)");
      return;
    }
    setMsg(`Created opportunity ${data.opportunity?.id}`);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: "converted", opportunityId: data.opportunity?.id } : l)),
    );
  }

  const pathwayOptions = useMemo(() => {
    const values = new Set();
    leads.forEach((lead) => {
      const value = String(lead.pathwaySegment || "").trim();
      if (value) values.add(value);
    });
    return ["all", ...Array.from(values).sort()];
  }, [leads]);

  const countryOptions = useMemo(() => {
    const values = new Set();
    leads.forEach((lead) => {
      const value = String(lead.countrySegment || "").trim();
      if (value) values.add(value);
    });
    return ["all", ...Array.from(values).sort()];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const search = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (pathwayFilter !== "all" && String(lead.pathwaySegment || "") !== pathwayFilter) return false;
      if (countryFilter !== "all" && String(lead.countrySegment || "") !== countryFilter) return false;
      if (!search) return true;
      const haystack = [
        lead.firstName,
        lead.lastName,
        lead.email,
        lead.mainNeed,
        lead.pathwaySegment,
        lead.countrySegment,
        Array.isArray(lead.interestTags) ? lead.interestTags.join(" ") : "",
      ]
        .map((item) => String(item || "").toLowerCase())
        .join(" ");
      return haystack.includes(search);
    });
  }, [leads, pathwayFilter, countryFilter, query]);

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
      <div className="mb-6 grid gap-3 rounded-lg border bg-card p-3 md:grid-cols-4">
        <label className="text-xs text-muted-foreground">
          Search
          <input
            className="mt-1 w-full rounded border bg-background px-2 py-2 text-sm text-foreground"
            placeholder="Name, email, segment..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Pathway segment
          <select
            className="mt-1 w-full rounded border bg-background px-2 py-2 text-sm text-foreground"
            value={pathwayFilter}
            onChange={(event) => setPathwayFilter(event.target.value)}
          >
            {pathwayOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted-foreground">
          Country segment
          <select
            className="mt-1 w-full rounded border bg-background px-2 py-2 text-sm text-foreground"
            value={countryFilter}
            onChange={(event) => setCountryFilter(event.target.value)}
          >
            {countryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end text-xs text-muted-foreground">
          Showing <strong className="ml-1 text-foreground">{filteredLeads.length}</strong>
          <span className="ml-1">of {leads.length} leads</span>
        </div>
      </div>
      {msg ? <p className="mb-4 text-sm text-muted-foreground">{msg}</p> : null}
      <div className="grid gap-4">
        {filteredLeads.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No matching leads</CardTitle>
              <CardDescription>Try clearing filters or wait for new enquiries to sync.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          filteredLeads.map((l) => (
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
                <p>
                  segments: {l.pathwaySegment || "general"} · {l.countrySegment || "unspecified"}
                </p>
                <p>tags: {Array.isArray(l.interestTags) && l.interestTags.length ? l.interestTags.join(", ") : "—"}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
