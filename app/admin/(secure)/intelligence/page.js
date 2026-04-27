"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

function summaryFromCaption(text) {
  const parts = String(text || "")
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts[1] || "";
}

function unwrapPayload(payload) {
  return payload?.data && typeof payload.data === "object" ? payload.data : payload;
}

function payloadError(payload, fallback) {
  return payload?.error?.message || payload?.error || fallback;
}

async function parseJsonResponseSafe(response) {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    return {};
  }
}

function SocialPostRow({ post }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const stats = post.stats || {};

  const clearPreview = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  useEffect(() => () => clearPreview(), [clearPreview]);

  async function loadPreview() {
    clearPreview();
    setLoadingPreview(true);
    try {
      const res = await fetch("/api/admin/intelligence/social-poster-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: post.headline,
          country: post.country,
          summary: summaryFromCaption(post.text),
        }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      setPreviewUrl(URL.createObjectURL(blob));
    } finally {
      setLoadingPreview(false);
    }
  }

  return (
    <article className="rounded-md border border-border bg-card p-3 text-sm">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{post.headline || "(no headline)"}</p>
          <p className="text-xs text-muted-foreground">
            {post.country} · {post.id} · {post.status}
            {post.facebookPostRemoteId ? ` · FB ${post.facebookPostRemoteId}` : ""}
            {post.instagramPostRemoteId ? ` · IG ${post.instagramPostRemoteId}` : ""}
          </p>
          {post.instagramPublishError ? (
            <p className="mt-1 text-xs text-destructive">Instagram: {post.instagramPublishError}</p>
          ) : null}
          {post.lastError ? (
            <p className="mt-1 text-xs text-destructive">Last error: {post.lastError}</p>
          ) : null}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={loadPreview} disabled={loadingPreview}>
          {loadingPreview ? "Rendering…" : "Preview poster"}
        </Button>
      </div>
      <dl className="mb-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Caption length</dt>
          <dd>{stats.totalLen ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">First-line (hook)</dt>
          <dd>
            {stats.hookLen ?? "—"}{" "}
            {stats.hookWithinLimit === false && stats.hookLen > 125 ? "(>125)" : ""}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Hashtags</dt>
          <dd>{stats.hashtagCount ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Lines</dt>
          <dd>{stats.lineCount ?? "—"}</dd>
        </div>
      </dl>
      <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded bg-muted/50 p-2 text-xs text-muted-foreground">
        {post.text}
      </pre>
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob URL from server-rendered PNG preview
        <img
          src={previewUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="mt-3 w-full max-w-[220px] rounded border border-border object-cover shadow-sm"
          style={{ aspectRatio: "1080 / 1350" }}
        />
      ) : null}
    </article>
  );
}

function DraftCard({ draft, onStatus }) {
  const [sourcesVerified, setSourcesVerified] = useState(false);
  const [note, setNote] = useState(draft.moderationNote || "");
  const [headline, setHeadline] = useState(draft.headline || "");
  const [summary, setSummary] = useState(draft.summary || "");
  const [body, setBody] = useState(draft.body || "");
  const [seoTitle, setSeoTitle] = useState(draft.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(draft.seoDescription || "");
  const edits = { headline, summary, body, seoTitle, seoDescription };
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
        {typeof draft?.grounding?.aggregatedChars === "number" ? (
          <> · ~{draft.grounding.aggregatedChars} chars aggregated</>
        ) : null}
        {draft?.grounding?.gemini ? (
          <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-primary">Gemini draft</span>
        ) : null}
      </p>
      {draft?.grounding?.geminiError ? (
        <p className="mb-2 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-950">
          Gemini unavailable or incomplete: {draft.grounding.geminiError}. Summary/body may be excerpt-only—set{" "}
          <code className="rounded bg-muted px-1">GEMINI_API_KEY</code> and re-run scan.
        </p>
      ) : null}
      {Array.isArray(draft?.grounding?.articleUrls) && draft.grounding.articleUrls.length > 0 ? (
        <div className="mb-3 rounded-md border border-border bg-muted/40 p-2 text-xs">
          <p className="font-medium text-foreground">Official article pages included in scan</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {draft.grounding.articleUrls.map((u) => (
              <li key={u}>
                <a href={u} target="_blank" rel="noreferrer" className="break-all text-primary underline">
                  {u}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {Array.isArray(draft?.provenance) && draft.provenance.length > 0 ? (
        <details className="mb-3 rounded-md border border-border bg-muted/30 p-2 text-xs">
          <summary className="cursor-pointer font-medium text-foreground">Provenance (URLs &amp; timestamps)</summary>
          <ul className="mt-2 max-h-40 list-inside list-disc space-y-1 overflow-y-auto break-all text-muted-foreground">
            {draft.provenance.slice(0, 40).map((p, i) => (
              <li key={`${p.url}-${i}`}>
                <span className="text-foreground/80">{String(p.kind || "entry")}</span>
                {p.url ? (
                  <>
                    {": "}
                    <a href={p.url} target="_blank" rel="noreferrer" className="text-primary underline">
                      {p.url}
                    </a>
                  </>
                ) : null}
                {p.recordedAt ? <span className="block text-[10px] opacity-80">{p.recordedAt}</span> : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
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
      <p className="mb-3 rounded-md border border-border bg-muted/30 px-2 py-2 text-xs text-muted-foreground">
        Approving publishes a dedicated public page under{" "}
        <code className="rounded bg-muted px-1">/immigration-news/…</code> and sets the official link from crawled
        article URLs when available (otherwise the monitored hub URL).
      </p>
      <label className="mb-3 flex cursor-pointer items-start gap-2 rounded-md border border-amber-200 bg-amber-50/80 p-2 text-xs text-amber-950">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={sourcesVerified}
          onChange={(e) => setSourcesVerified(e.target.checked)}
        />
        <span>
          I have opened and verified the official source material above against this draft (human-in-the-loop gate
          required to approve).
        </span>
      </label>
      <textarea
        className="mb-3 min-h-20 w-full rounded-md border border-input bg-background p-2 text-sm"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Moderation note"
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={!sourcesVerified} onClick={() => onStatus(draft.id, "approved", note, edits, { sourcesVerified: true })}>
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
  const [facebookPosts, setFacebookPosts] = useState([]);
  const [rollbackId, setRollbackId] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [dRes, aRes, hRes, fRes] = await Promise.all([
        fetch("/api/admin/intelligence/drafts", { cache: "no-store" }),
        fetch("/api/admin/intelligence/alerts", { cache: "no-store" }),
        fetch("/api/admin/intelligence/publish-history", { cache: "no-store" }),
        fetch("/api/admin/intelligence/facebook-posts", { cache: "no-store" }),
      ]);
      const [dJson, aJson, hJson, fJson] = await Promise.all([
        parseJsonResponseSafe(dRes),
        parseJsonResponseSafe(aRes),
        parseJsonResponseSafe(hRes),
        parseJsonResponseSafe(fRes),
      ]);
      const d = unwrapPayload(dJson);
      const a = unwrapPayload(aJson);
      const h = unwrapPayload(hJson);
      const f = unwrapPayload(fJson);
      if (!dRes.ok || !aRes.ok || !hRes.ok || !fRes.ok) {
        const err =
          payloadError(dJson) ||
          payloadError(aJson) ||
          payloadError(hJson) ||
          payloadError(fJson) ||
          "Could not load intelligence queue data.";
        setMessage(err);
      }
      setDrafts(Array.isArray(d.drafts) ? d.drafts : []);
      setAlerts(Array.isArray(a.alerts) ? a.alerts : []);
      setPublishHistory(Array.isArray(h.entries) ? h.entries : []);
      setFacebookPosts(Array.isArray(f.posts) ? f.posts : []);
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
      const payload = await parseJsonResponseSafe(response);
      const data = unwrapPayload(payload);
      if (!response.ok) throw new Error(payloadError(payload, "Scan failed"));
      setMessage(`Scan complete: ${data.changed} changed source(s).`);
      await load();
    } catch (error) {
      setMessage(error.message || "Scan failed");
    } finally {
      setRunningScan(false);
    }
  }

  async function setDraftStatus(id, status, moderationNote, edits, opts = {}) {
    const response = await fetch("/api/admin/intelligence/drafts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status,
        moderationNote,
        edits,
        ...(status === "approved" ? { sourcesVerified: opts.sourcesVerified === true } : {}),
      }),
    });
    if (!response.ok) {
      const payload = await parseJsonResponseSafe(response);
      setMessage(payloadError(payload, "Could not update draft."));
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
      const data = await parseJsonResponseSafe(response);
      const payload = data;
      if (!response.ok) {
        setMessage(payloadError(payload, "Rollback failed."));
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
        <h2 className="mb-2 text-xl font-semibold">Social queue (Meta)</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Queued and recent Facebook / Instagram posts from approved intelligence drafts. First line targets ≤125
          characters for feed visibility. Use Preview poster to check the 1080×1350 graphic before cron publish.
        </p>
        <div className="grid gap-3">
          {facebookPosts.map((post) => (
            <SocialPostRow key={post.id} post={post} />
          ))}
          {!facebookPosts.length && !loading ? (
            <p className="text-sm text-muted-foreground">No social posts in the store yet.</p>
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
