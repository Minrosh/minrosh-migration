"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

function statusVariant(s) {
  if (s === "current") return "success";
  if (s === "past") return "secondary";
  return "warning";
}

export function CustomerDetailDrawer({ customerId, open, onClose, onRefresh, bootstrapPlainToken }) {
  const [customer, setCustomer] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [plainLinkToken, setPlainLinkToken] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("prospective");
  const [notes, setNotes] = useState("");
  const [mobile, setMobile] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [zipLoading, setZipLoading] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!customerId) return;
    setDetailLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`/api/admin/customers/${encodeURIComponent(customerId)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCustomer(null);
        setLoadError(data.error || "Could not load customer.");
        setDetailLoading(false);
        return;
      }
      setCustomer(data.customer || null);
    } catch {
      setCustomer(null);
      setLoadError("Network error");
    }
    setDetailLoading(false);
  }, [customerId]);

  useEffect(() => {
    if (!open || !customerId) {
      setCustomer(null);
      setLoadError("");
      setPlainLinkToken(null);
      return;
    }
    loadDetail();
  }, [open, customerId, loadDetail]);

  useEffect(() => {
    if (bootstrapPlainToken && customerId && open) {
      setPlainLinkToken(bootstrapPlainToken);
    }
  }, [bootstrapPlainToken, customerId, open]);

  useEffect(() => {
    if (!open || !customerId) return;
    if (!bootstrapPlainToken) {
      setPlainLinkToken(null);
    }
  }, [customerId, open, bootstrapPlainToken]);

  useEffect(() => {
    if (!customer) return;
    setName(customer.name || "");
    setEmail(customer.email || "");
    setStatus(customer.status || "prospective");
    setNotes(customer.notes ?? "");
    setMobile(customer.mobile ?? "");
    setMarketingConsent(customer.marketingConsent !== false);
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
  const magicUrl = plainLinkToken ? `${origin}/upload/${plainLinkToken}` : "";
  const folder = customer?.uploadFolder || customer?.id || "";

  const docsSorted = useMemo(() => {
    const list = [...(customer?.documents || [])];
    list.sort((a, b) => String(b.uploadedAt || "").localeCompare(String(a.uploadedAt || "")));
    return list;
  }, [customer]);

  const activitySorted = useMemo(() => {
    const list = [...(customer?.activityLog || [])];
    list.sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
    return list.reverse();
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
          mobile: mobile.trim(),
          status,
          notes: notes.trim(),
          marketingConsent,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || "Save failed");
        setSaving(false);
        return;
      }
      setMessage("Saved.");
      await loadDetail();
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
      if (data.customer) {
        setCustomer(data.customer);
      }
      if (data.magicUploadToken) {
        setPlainLinkToken(data.magicUploadToken);
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
    if (
      !confirm(
        "Delete this customer, their CRM record, and all files in their private upload folder? This cannot be undone."
      )
    ) {
      return;
    }
    await fetch(`/api/admin/customers?id=${encodeURIComponent(customer.id)}`, { method: "DELETE" });
    onClose();
    await onRefresh();
  }

  if (!open || !customerId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="customer-drawer-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-border bg-card shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 id="customer-drawer-title" className="text-lg font-semibold tracking-tight">
              {customer?.name || "Customer"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{customerId}</p>
            {customer ? (
              <div className="mt-2">
                <Badge variant={statusVariant(customer.status)}>{customer.status}</Badge>
              </div>
            ) : null}
            {customer?.magicLinkExpiresAt ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Upload link active until{" "}
                <time dateTime={customer.magicLinkExpiresAt}>
                  {new Date(customer.magicLinkExpiresAt).toLocaleString()}
                </time>{" "}
                (72h from last issue — regenerate to extend)
              </p>
            ) : customer ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Legacy link without expiry — regenerate to apply 72h window.
              </p>
            ) : null}
          </div>
          <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {detailLoading ? (
            <p className="text-sm text-muted-foreground">Loading secure details…</p>
          ) : loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : !customer ? (
            <p className="text-sm text-muted-foreground">No data.</p>
          ) : (
            <>
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
                    <Label htmlFor="cd-mobile">Mobile (E.164, SMS upload gate)</Label>
                    <Input
                      id="cd-mobile"
                      type="tel"
                      placeholder="+61400000000"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Required only if{" "}
                      <code className="rounded bg-muted px-1">UPLOAD_LINK_SMS_VERIFICATION=true</code> on the server.
                    </p>
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
              <label className="flex cursor-pointer items-start gap-2 text-sm leading-snug">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border border-input"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                />
                <span>
                  Marketing / broadcast opt-in (prospective clients only). Uncheck to exclude from BCC broadcasts.
                  Legacy records default to opted in until you save.
                </span>
              </label>
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

              {customer.passportOcrLatest ? (
                <section className="space-y-2 rounded-md border border-border bg-muted/25 p-3">
                  <h3 className="text-sm font-semibold text-foreground">Identity hints (upload OCR)</h3>
                  <p className="text-xs text-muted-foreground">{customer.passportOcrLatest.note}</p>
                  <dl className="grid gap-2 text-sm">
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Extracted name</dt>
                      <dd className="font-medium">{customer.passportOcrLatest.fullName || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Date of birth</dt>
                      <dd>{customer.passportOcrLatest.dateOfBirth || "—"}</dd>
                    </div>
                    {customer.passportOcrLatest.sourceStoredName ? (
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Source file</dt>
                        <dd className="break-all font-mono text-xs">{customer.passportOcrLatest.sourceStoredName}</dd>
                      </div>
                    ) : null}
                    {customer.passportOcrLatest.extractedAt ? (
                      <p className="text-xs text-muted-foreground">
                        Extracted{" "}
                        <time dateTime={customer.passportOcrLatest.extractedAt}>
                          {new Date(customer.passportOcrLatest.extractedAt).toLocaleString()}
                        </time>
                      </p>
                    ) : null}
                  </dl>
                </section>
              ) : null}

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Upload link</h3>
                <p className="text-xs text-muted-foreground">
                  Only shown in this panel. Send this link to the client — upload only, no admin access.
                </p>
                <div className="flex flex-col gap-2">
                  <Input readOnly value={magicUrl} className="font-mono text-xs" placeholder="No token — regenerate" />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!magicUrl}
                      onClick={() => navigator.clipboard.writeText(magicUrl)}
                    >
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
                  Private storage (app root):{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-[11px]">storage/uploads/{folder}/</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  PM2 standalone:{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
                    .next/standalone/storage/uploads/{folder}/
                  </code>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() => navigator.clipboard.writeText(`storage/uploads/${folder}/`)}
                >
                  Copy relative path
                </Button>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Activity log</h3>
                <p className="text-xs text-muted-foreground">
                  Stored on the customer record. Files live under private{" "}
                  <code className="rounded bg-muted px-1 text-[11px]">storage/uploads</code>.
                </p>
                {activitySorted.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events yet.</p>
                ) : (
                  <ul className="max-h-40 overflow-y-auto rounded-md border border-border text-xs divide-y divide-border">
                    {activitySorted.map((e, idx) => (
                      <li key={`${e.at}-${idx}`} className="px-3 py-2">
                        <span className="font-medium text-foreground">{e.action}</span>
                        {e.detail ? <span className="text-muted-foreground"> — {e.detail}</span> : null}
                        <div className="text-muted-foreground">{e.at ? new Date(e.at).toLocaleString() : "—"}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Documents ({docsSorted.length})</h3>
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
                  ZIP is built from files on disk in this customer&apos;s upload folder.
                </p>
                {docsSorted.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
                ) : (
                  <ul className="divide-y divide-border rounded-md border border-border text-sm">
                    {docsSorted.map((d) => (
                      <li
                        key={`${d.storedName}-${d.uploadedAt}`}
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <a
                            className="font-medium text-primary underline"
                            href={`/api/admin/documents/${customer.id}/${encodeURIComponent(d.storedName)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {d.filename}
                          </a>
                          <p className="text-xs text-muted-foreground">
                            {d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : "—"} · {d.mime || "file"}
                          </p>
                        </div>
                        <Button type="button" variant="ghost" size="sm" asChild>
                          <a
                            href={`/api/admin/documents/${customer.id}/${encodeURIComponent(d.storedName)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
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
                  Delete customer &amp; files
                </Button>
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
