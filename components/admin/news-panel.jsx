"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NEWS_PUBLIC_BASE } from "@/lib/news-display";

const emptyForm = {
  title: "",
  summary: "",
  body: "",
  country: "Australia",
  source: "Official source",
  sourceUrl: "",
  date: "",
  slug: "",
};

export function NewsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/news", { cache: "no-store" });
      const payload = await res.json();
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      setItems(Array.isArray(data.items) ? data.items : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createItem(e) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/admin/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        summary: form.summary.trim(),
        body: form.body.trim(),
        country: form.country.trim(),
        source: form.source.trim(),
        sourceUrl: form.sourceUrl.trim(),
        date: form.date.trim(),
        slug: form.slug.trim(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    const payload = data;
    const body = payload?.data && typeof payload.data === "object" ? payload.data : payload;
    const errorMessage = payload?.error?.message || payload?.error || body?.error;
    if (!res.ok) {
      setMessage(errorMessage || "Save failed");
      return;
    }
    setItems(Array.isArray(body.items) ? body.items : []);
    setForm(emptyForm);
    setMessage("Published to public newsroom.");
  }

  function startEdit(row) {
    setEditingId(row.id);
    setEditForm({
      title: row.title || "",
      summary: row.summary || "",
      body: row.body || "",
      country: row.country || "",
      source: row.source || "",
      sourceUrl: row.sourceUrl || "",
      date: row.date || "",
      slug: row.slug || "",
    });
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;
    setMessage("");
    const res = await fetch("/api/admin/news", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, ...editForm }),
    });
    const data = await res.json().catch(() => ({}));
    const payload = data;
    const body = payload?.data && typeof payload.data === "object" ? payload.data : payload;
    const errorMessage = payload?.error?.message || payload?.error || body?.error;
    if (!res.ok) {
      setMessage(errorMessage || "Update failed");
      return;
    }
    setItems(Array.isArray(body.items) ? body.items : []);
    setEditingId(null);
    setEditForm(null);
    setMessage("Updated.");
  }

  async function remove(id) {
    if (!window.confirm("Remove this public news item?")) return;
    setMessage("");
    const res = await fetch("/api/admin/news", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json().catch(() => ({}));
    const payload = data;
    const body = payload?.data && typeof payload.data === "object" ? payload.data : payload;
    const errorMessage = payload?.error?.message || payload?.error || body?.error;
    if (!res.ok) {
      setMessage(errorMessage || "Delete failed");
      return;
    }
    setItems(Array.isArray(body.items) ? body.items : []);
    setMessage("Deleted.");
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-10">
      {message ? (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm" role="status">
          {message}
        </p>
      ) : null}

      <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold">Add news note</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Creates a public page at <code className="rounded bg-muted px-1">{NEWS_PUBLIC_BASE}/your-slug</code>. Leave
          slug blank to auto-generate from the title. Use a full <strong>https://</strong> official URL so “Official
          source” opens the announcement, not only the department home page.
        </p>
        <form className="grid gap-4 max-w-2xl" onSubmit={createItem}>
          <div className="grid gap-2">
            <Label htmlFor="n-title">Title</Label>
            <Input
              id="n-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="n-summary">Summary (card + SEO)</Label>
            <textarea
              id="n-summary"
              className="min-h-[5rem] w-full rounded-md border border-input bg-background p-2 text-sm"
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              rows={3}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="n-body">Body (full note — plain text, blank uses summary)</Label>
            <textarea
              id="n-body"
              className="min-h-[10rem] w-full rounded-md border border-input bg-background p-2 text-sm"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={8}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="n-country">Country label</Label>
              <Input
                id="n-country"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="n-date">Date (YYYY-MM-DD)</Label>
              <Input
                id="n-date"
                placeholder="2026-04-12"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="n-source">Source label</Label>
            <Input
              id="n-source"
              value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="n-sourceUrl">Official announcement URL (https)</Label>
            <Input
              id="n-sourceUrl"
              type="url"
              placeholder="https://…"
              value={form.sourceUrl}
              onChange={(e) => setForm((f) => ({ ...f, sourceUrl: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="n-slug">Slug (optional)</Label>
            <Input
              id="n-slug"
              placeholder="my-policy-update"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
          </div>
          <Button type="submit">Publish news</Button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Existing items ({items.length})</h2>
        <ul className="space-y-4">
          {items.map((row) => (
            <li key={row.id} className="rounded-lg border border-border bg-card p-4 text-sm shadow-sm">
              {editingId === row.id && editForm ? (
                <div className="grid max-w-2xl gap-3">
                  <div className="grid gap-1">
                    <Label>Title</Label>
                    <Input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="grid gap-1">
                    <Label>Summary</Label>
                    <textarea
                      className="min-h-[5rem] w-full rounded-md border border-input bg-background p-2 text-sm"
                      rows={3}
                      value={editForm.summary}
                      onChange={(e) => setEditForm((f) => ({ ...f, summary: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label>Body</Label>
                    <textarea
                      className="min-h-[8rem] w-full rounded-md border border-input bg-background p-2 text-sm"
                      rows={6}
                      value={editForm.body}
                      onChange={(e) => setEditForm((f) => ({ ...f, body: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-1">
                      <Label>Country</Label>
                      <Input
                        value={editForm.country}
                        onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label>Date</Label>
                      <Input value={editForm.date} onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid gap-1">
                    <Label>Source label</Label>
                    <Input value={editForm.source} onChange={(e) => setEditForm((f) => ({ ...f, source: e.target.value }))} />
                  </div>
                  <div className="grid gap-1">
                    <Label>Official URL</Label>
                    <Input
                      value={editForm.sourceUrl}
                      onChange={(e) => setEditForm((f) => ({ ...f, sourceUrl: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label>Slug</Label>
                    <Input value={editForm.slug} onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" onClick={saveEdit}>
                      Save
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.country} · {row.date} ·{" "}
                    <a className="text-primary underline" href={`${NEWS_PUBLIC_BASE}/${row.slug}`} target="_blank" rel="noreferrer">
                      {NEWS_PUBLIC_BASE}/{row.slug}
                    </a>
                  </p>
                  <p className="mt-2 line-clamp-2 text-muted-foreground">{row.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => startEdit(row)}>
                      Edit
                    </Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => remove(row.id)}>
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
