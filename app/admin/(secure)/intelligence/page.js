"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

function DraftCard({ draft, onStatus }) {
  const [note, setNote] = useState(draft.moderationNote || "");
  const [headline, setHeadline] = useState(draft.headline || "");
  const [summary, setSummary] = useState(draft.summary || "");
  const [body, setBody] = useState(draft.body || "");
  const [seoTitle, setSeoTitle] = useState(draft.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(draft.seoDescription || "");
  const [href, setHref] = useState(draft.href || "/updates");
  const edits = { headline, summary, body, seoTitle, seoDescription, href };
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
      <p className="mb-2 text-xs text-muted-foreground">
        Grounding confidence:{" "}
        <strong>{Number(draft?.grounding?.confidence || 0).toFixed(2)}</strong>
      </p>
      <p className="mb-3 text-sm">{draft.summary}</p>
      <label className="mb-2 block text-xs text-muted-foreground">Headline</label>
      <input
        className="mb-3 w-full rounded-md border border-input bg-background p-2 text-sm"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
      />
      <label className="mb-2 block text-xs text-muted-foreground">Summary</label>
      <textarea
        className="mb-3 min-h-16 w-full rounded-md border border-input bg-background p-2 text-sm"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <label className="mb-2 block text-xs text-muted-foreground">Body</label>
      <textarea
        className="mb-3 min-h-32 w-full rounded-md border border-input bg-background p-2 text-sm"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <label className="mb-2 block text-xs text-muted-foreground">SEO Title</label>
      <input
        className="mb-3 w-full rounded-md border border-input bg-background p-2 text-sm"
        value={seoTitle}
        onChange={(e) => setSeoTitle(e.target.value)}
      />
      <label className="mb-2 block text-xs text-muted-foreground">SEO Description</label>
      <textarea
        className="mb-3 min-h-16 w-full rounded-md border border-input bg-background p-2 text-sm"
        value={seoDescription}
        onChange={(e) => setSeoDescription(e.target.value)}
      />
      <label className="mb-2 block text-xs text-muted-foreground">Published Link (href)</label>
      <input
        className="mb-3 w-full rounded-md border border-input bg-background p-2 text-sm"
        value={href}
        onChange={(e) => setHref(e.target.value)}
      />
      <textarea
        className="mb-3 min-h-20 w-full rounded-md border border-input bg-background p-2 text-sm"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Moderation note"
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onStatus(draft.id, "approved", note, edits)}>
          Approve
        </Button>
        <Button size="sm" variant="outline" onClick={() => onStatus(draft.id, "rejected", note, edits)}>
          Reject
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onStatus(draft.id, "pending", note, edits)}>
          Save edits
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
  const [publishHistory, setPublishHistory] = useState([]);
  const [rollbackId, setRollbackId] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [dRes, aRes, hRes] = await Promise.all([
        fetch("/api/admin/intelligence/drafts", { cache: "no-store" }),
        fetch("/api/admin/intelligence/alerts", { cache: "no-store" }),
        fetch("/api/admin/intelligence/publish-history", { cache: "no-store" }),
      ]);
      const dJson = await dRes.json();
      const aJson = await aRes.json();
      const hJson = await hRes.json();
      setDrafts(Array.isArray(dJson.drafts) ? dJson.drafts : []);
      setAlerts(Array.isArray(aJson.alerts) ? aJson.alerts : []);
      setPublishHistory(Array.isArray(hJson.entries) ? hJson.entries : []);
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

  async function setDraftStatus(id, status, moderationNote, edits) {
    const response = await fetch("/api/admin/intelligence/drafts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, moderationNote, edits }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error || "Could not update draft.");
      return;
    }
    await load();
  }

  async function rollbackPublish(entryId) {
    if (
      !confirm(
        "Roll back this publish? The news item, FAQ patches linked to this draft, and queued Facebook posts will be reverted or cancelled."
      )
    ) {
      return;
    }
    setRollbackId(entryId);
    setMessage("");
    try {
      const response = await fetch("/api/admin/intelligence/publish-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entryId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.error || "Rollback failed.");
        return;
      }
      setMessage("Rollback completed.");
      await load();
    } finally {
      setRollbackId("");
    }
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

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Publish history</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Recent publishes from approved drafts. Roll back removes the news row, deactivates FAQ patches, and cancels
          queued Facebook posts for that draft.
        </p>
        <div className="grid gap-2">
          {publishHistory.slice(0, 20).map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-2 rounded-md border border-border bg-card p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {entry.newsTitle || entry.intelligenceDraftId || entry.id}{" "}
                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs uppercase tracking-wide">
                    {entry.status || "published"}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.createdAt || ""} · draft {entry.intelligenceDraftId || "—"}
                  {entry.newsHref ? (
                    <>
                      {" "}
                      ·{" "}
                      <a href={entry.newsHref} className="text-primary underline" target="_blank" rel="noreferrer">
                        link
                      </a>
                    </>
                  ) : null}
                </p>
              </div>
              {entry.status === "published" ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={rollbackId === entry.id}
                  onClick={() => rollbackPublish(entry.id)}
                >
                  {rollbackId === entry.id ? "Rolling back…" : "Rollback"}
                </Button>
              ) : null}
            </div>
          ))}
          {!publishHistory.length && !loading ? (
            <p className="text-sm text-muted-foreground">No publish history yet.</p>
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
