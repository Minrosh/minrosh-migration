"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

function statusVariant(s) {
  if (s === "current") return "success";
  if (s === "past") return "secondary";
  return "warning";
}

export function CustomerDetailDrawer({ customer, open, onClose, onRefresh }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("prospective");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [zipLoading, setZipLoading] = useState(false);

  useEffect(() => {
    if (!customer) return;
    setName(customer.name || "");
    setEmail(customer.email || "");
    setStatus(customer.status || "prospective");
    setNotes(customer.notes ?? "");
    setMessage("");
  }, [customer]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const magicUrl = customer ? `${origin}/upload/${customer.magicToken}` : "";
  const folder = customer?.uploadFolder || customer?.id || "";

  const docsSorted = useMemo(() => {
    const list = [...(customer?.documents || [])];
    list.sort((a, b) => String(b.uploadedAt || "").localeCompare(String(a.uploadedAt || "")));
    return list;
  }, [customer]);

  async function saveProfile() {
    if (!customer) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: customer.id,
          name: name.trim(),
          email: email.trim(),
          status,
          notes: notes.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || "Save failed");
        setSaving(false);
        return;
      }
      setMessage("Saved.");
      await onRefresh();
    } catch {
      setMessage("Network error");
    }
    setSaving(false);
  }

  async function regenerateToken() {
    if (!customer) return;
    if (!confirm("Generate a new upload link? The old link will stop working.")) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerateToken", id: customer.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || "Could not regenerate");
        setSaving(false);
        return;
      }
      setMessage("New link generated — copy it below.");
      await onRefresh();
    } catch {
      setMessage("Network error");
    }
    setSaving(false);
  }

  async function downloadDocumentsZip() {
    if (!customer) return;
    setZipLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}/documents-zip`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Could not download ZIP");
        setZipLoading(false);
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") || "";
      let filename = "documents.zip";
      const m = /filename="([^"]+)"/i.exec(cd) || /filename=([^;]+)/i.exec(cd);
      if (m?.[1]) filename = m[1].trim().replace(/^UTF-8''/, "");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Network error while downloading ZIP");
    }
    setZipLoading(false);
  }

  async function removeCustomer() {
    if (!customer) return;
    if (!confirm("Delete this customer and their record? Files on disk are not removed automatically.")) return;
    await fetch(`/api/admin/customers?id=${encodeURIComponent(customer.id)}`, { method: "DELETE" });
    onClose();
    await onRefresh();
  }

  if (!open || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="customer-drawer-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside
        className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-border bg-card shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 id="customer-drawer-title" className="text-lg font-semibold tracking-tight">
              {customer.name || "Customer"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{customer.id}</p>
            <div className="mt-2">
              <Badge variant={statusVariant(customer.status)}>{customer.status}</Badge>
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Profile & notes</h3>
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cd-name">Name</Label>
                <Input id="cd-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cd-email">Email</Label>
                <Input id="cd-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cd-status">Status</Label>
                <select
                  id="cd-status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="current">Current</option>
                  <option value="past">Past</option>
                  <option value="prospective">Prospective</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cd-notes">Internal notes</Label>
                <textarea
                  id="cd-notes"
                  rows={4}
                  className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Visa type, follow-up dates, phone, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button type="button" disabled={saving} onClick={saveProfile}>
                {saving ? "Saving…" : "Save profile & notes"}
              </Button>
              {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Upload link</h3>
            <p className="text-xs text-muted-foreground">
              Send this link to the client. It only uploads — no admin access.
            </p>
            <div className="flex flex-col gap-2">
              <Input readOnly value={magicUrl} className="font-mono text-xs" />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(magicUrl)}>
                  Copy link
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={regenerateToken} disabled={saving}>
                  New token
                </Button>
              </div>
            </div>
          </section>

          <section className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
            <h3 className="text-sm font-semibold text-foreground">Files on server</h3>
            <p className="text-xs text-muted-foreground">
              Browse on the VPS (from app root):{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[11px]">public/uploads/{folder}/</code>
            </p>
            <p className="text-xs text-muted-foreground">
              PM2 standalone cwd:{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[11px]">.next/standalone/public/uploads/{folder}/</code>
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={() =>
                navigator.clipboard.writeText(`public/uploads/${folder}/`)
              }
            >
              Copy relative path
            </Button>
          </section>

          <section className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Documents ({docsSorted.length})
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={zipLoading}
                onClick={downloadDocumentsZip}
              >
                {zipLoading ? "Preparing…" : "Download ZIP"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ZIP is built from files on disk in this customer&apos;s upload folder (not only the list below).
            </p>
            {docsSorted.length === 0 ? (
              <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
            ) : (
              <ul className="divide-y divide-border rounded-md border border-border text-sm">
                {docsSorted.map((d) => (
                  <li key={`${d.storedName}-${d.uploadedAt}`} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                    <div className="min-w-0">
                      <a className="font-medium text-primary underline" href={d.url} target="_blank" rel="noreferrer">
                        {d.filename}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        {d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : "—"} · {d.mime || "file"}
                      </p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" asChild>
                      <a href={d.url} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border-t border-border pt-4">
            <Button type="button" variant="destructive" className="w-full" onClick={removeCustomer}>
              Delete customer
            </Button>
          </section>
        </div>
      </aside>
    </div>
  );
}
