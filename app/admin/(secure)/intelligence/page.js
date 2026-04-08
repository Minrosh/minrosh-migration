"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

function DraftCard({ draft, onStatus }) {
  const [note, setNote] = useState(draft.moderationNote || "");
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{draft.headline}</h3>
        <span className="rounded-full bg-muted px-2 py-1 text-xs uppercase tracking-wide">
          {draft.status}
        </span>
      </div>
      <p className="mb-2 text-sm text-muted-foreground">
        {draft.country} · {draft.sourceName}
      </p>
      <p className="mb-3 text-sm">{draft.summary}</p>
      <textarea
        className="mb-3 min-h-20 w-full rounded-md border border-input bg-background p-2 text-sm"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Moderation note"
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onStatus(draft.id, "approved", note)}>
          Approve
        </Button>
        <Button size="sm" variant="outline" onClick={() => onStatus(draft.id, "rejected", note)}>
          Reject
        </Button>
        <a href={draft.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
          Official source
        </a>
      </div>
    </article>
  );
}

export default function AdminIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [runningScan, setRunningScan] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [dRes, aRes] = await Promise.all([
        fetch("/api/admin/intelligence/drafts", { cache: "no-store" }),
        fetch("/api/admin/intelligence/alerts", { cache: "no-store" }),
      ]);
      const dJson = await dRes.json();
      const aJson = await aRes.json();
      setDrafts(Array.isArray(dJson.drafts) ? dJson.drafts : []);
      setAlerts(Array.isArray(aJson.alerts) ? aJson.alerts : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function runScan() {
    setRunningScan(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/intelligence/run-scan", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Scan failed");
      setMessage(`Scan complete: ${data.changed} changed source(s).`);
      await load();
    } catch (error) {
      setMessage(error.message || "Scan failed");
    } finally {
      setRunningScan(false);
    }
  }

  async function setDraftStatus(id, status, moderationNote) {
    const response = await fetch("/api/admin/intelligence/drafts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, moderationNote }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error || "Could not update draft.");
      return;
    }
    await load();
  }

  const pendingDrafts = useMemo(() => drafts.filter((d) => d.status === "pending"), [drafts]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Intelligence Queue</h1>
          <p className="text-sm text-muted-foreground">
            Official-source monitoring drafts (human approval required before publish).
          </p>
        </div>
        <Button onClick={runScan} disabled={runningScan}>
          {runningScan ? "Scanning..." : "Run Scan Now"}
        </Button>
      </div>

      {message ? <p className="mb-4 rounded-md bg-muted p-2 text-sm">{message}</p> : null}

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Admin Alerts</h2>
        <div className="grid gap-2">
          {alerts.slice(0, 6).map((alert) => (
            <div key={alert.id} className="rounded-md border border-border bg-card p-3 text-sm">
              <strong>{alert.title}</strong>
              <p className="text-muted-foreground">{alert.message}</p>
            </div>
          ))}
          {!alerts.length && !loading ? (
            <p className="text-sm text-muted-foreground">No alerts yet.</p>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Pending Drafts</h2>
        <div className="grid gap-3">
          {pendingDrafts.map((draft) => (
            <DraftCard key={draft.id} draft={draft} onStatus={setDraftStatus} />
          ))}
          {!pendingDrafts.length && !loading ? (
            <p className="text-sm text-muted-foreground">No pending drafts.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
