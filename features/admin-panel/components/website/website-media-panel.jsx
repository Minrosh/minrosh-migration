"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function parseJsonResponseSafe(response) {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    return {};
  }
}

export function WebsiteMediaPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [alt, setAlt] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/website/media", { cache: "no-store" });
    const payload = await parseJsonResponseSafe(res);
    const data = payload?.data?.items || payload?.items;
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onUpload(e) {
    e.preventDefault();
    setMessage("");
    const fileInput = e.currentTarget.elements.namedItem("file");
    const file = fileInput?.files?.[0];
    if (!file) {
      setMessage("Choose an image file.");
      return;
    }
    if (!alt.trim()) {
      setMessage("Alt text is required.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("alt", alt.trim());
      const res = await fetch("/api/admin/website/media", { method: "POST", body: form });
      const payload = await parseJsonResponseSafe(res);
      if (!res.ok) {
        setMessage(payload?.error?.message || "Upload failed");
        return;
      }
      setAlt("");
      e.currentTarget.reset();
      setMessage("Uploaded to storage/website-media/");
      await load();
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading media…</p>;

  return (
    <div className="space-y-6">
      <form onSubmit={onUpload} className="max-w-lg space-y-3 rounded-lg border border-border p-4">
        <h2 className="font-semibold">Upload image</h2>
        <p className="text-sm text-muted-foreground">JPEG, PNG, or WebP — max 5MB. Alt text required.</p>
        <div>
          <Label htmlFor="media-file">File</Label>
          <Input id="media-file" name="file" type="file" accept="image/jpeg,image/png,image/webp" />
        </div>
        <div>
          <Label htmlFor="media-alt">Alt text</Label>
          <Input id="media-alt" value={alt} onChange={(e) => setAlt(e.target.value)} />
        </div>
        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading…" : "Upload"}
        </Button>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      </form>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          No media items yet.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-border p-3 text-sm">
              <img
                src={item.adminUrl}
                alt={item.alt}
                className="mb-2 h-32 w-full rounded object-cover"
              />
              <p className="font-medium">{item.originalName}</p>
              <p className="text-muted-foreground">{item.alt}</p>
              <p className="text-xs text-muted-foreground">{item.id}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
