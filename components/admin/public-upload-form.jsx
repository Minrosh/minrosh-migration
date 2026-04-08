"use client";

import { useCallback, useEffect, useState } from "react";

export function PublicUploadForm({ token }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [portalStatus, setPortalStatus] = useState(null);
  const [gate, setGate] = useState("loading");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);

  const refreshDocuments = useCallback(async () => {
    const res = await fetch(`/api/upload/${token}`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (res.status === 410) {
      setGate("expired");
      setStatus(data.error || "This link has expired.");
      setDocs([]);
      return;
    }
    if (res.status === 403 && data.code === "NO_MOBILE") {
      setGate("no_mobile");
      setStatus(data.error || "");
      return;
    }
    if (res.status === 401 && data.code === "SMS_OTP_REQUIRED") {
      setGate("otp");
      setPhoneLast4(data.phoneLast4 || "****");
      setDocs([]);
      return;
    }
    if (!res.ok) {
      setGate("error");
      setStatus(data.error || "Could not load upload page.");
      return;
    }
    setGate("ok");
    setStatus("");
    setPortalStatus(data?.customer?.portalStatus || null);
    const serverDocs = Array.isArray(data?.customer?.documents) ? data.customer.documents : [];
    setDocs((prev) => (serverDocs.length ? serverDocs : prev));
  }, [token]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  async function requestCode() {
    setOtpBusy(true);
    setStatus("");
    try {
      const res = await fetch(`/api/upload/${token}/request-code`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(data.error || "Could not send code.");
        setOtpBusy(false);
        return;
      }
      setStatus("Check your mobile for a 6-digit code (valid 15 minutes).");
    } catch {
      setStatus("Network error.");
    }
    setOtpBusy(false);
  }

  async function confirmCode(e) {
    e.preventDefault();
    setOtpBusy(true);
    setStatus("");
    try {
      const res = await fetch(`/api/upload/${token}/confirm-code`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otpCode.replace(/\D/g, "") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(data.error || "Verification failed.");
        setOtpBusy(false);
        return;
      }
      setOtpCode("");
      await refreshDocuments();
    } catch {
      setStatus("Network error.");
    }
    setOtpBusy(false);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("");
    const input = e.target.elements.files;
    const list = input?.files;
    if (!list?.length) {
      setStatus("Choose one or more files first.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Array.from(list).forEach((file) => fd.append("files", file));
      const res = await fetch(`/api/upload/${token}`, { method: "POST", body: fd, credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403 || res.status === 410) {
        setStatus(data.error || "Upload blocked.");
        if (res.status === 410) setGate("expired");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setStatus(data.error || "Upload failed");
        setLoading(false);
        return;
      }
      const n = data.count ?? data.documents?.length ?? 0;
      if (data.errors?.length) {
        setStatus(`Uploaded ${n} file(s). Some were skipped: ${data.errors.join(" · ")}`);
      } else {
        setStatus(n === 1 ? "Uploaded successfully. Thank you." : `Uploaded ${n} files successfully. Thank you.`);
      }
      input.value = "";
      if (Array.isArray(data.documents) && data.documents.length) {
        setDocs((prev) => {
          const seen = new Set(prev.map((p) => p.storedName));
          const add = data.documents.filter((d) => d.storedName && !seen.has(d.storedName));
          return [...add, ...prev];
        });
      }
      await refreshDocuments();
    } catch {
      setStatus("Network error");
    }
    setLoading(false);
  }

  function onDrop(e) {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input[name="files"]');
    const dropped = e.dataTransfer?.files;
    if (!dropped?.length || !input) return;
    const dt = new DataTransfer();
    Array.from(dropped)
      .slice(0, 20)
      .forEach((f) => dt.items.add(f));
    input.files = dt.files;
    setStatus("");
  }

  if (gate === "loading") {
    return <p className="mt-8 text-sm text-slate-600">Loading secure upload…</p>;
  }

  if (gate === "expired" || gate === "error") {
    return (
      <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-slate-800">
        {status || "This upload link is not available."}
      </div>
    );
  }

  if (gate === "no_mobile") {
    return (
      <div className="mt-8 rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-slate-800">
        {status ||
          "SMS verification is turned on for uploads, but no mobile number is stored for this client. Please contact MinRosh Migration."}
      </div>
    );
  }

  if (gate === "otp") {
    return (
      <div className="mt-8 space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Verify your mobile</h2>
        <p className="text-sm text-slate-600">
          Enter the one-time code we send to the number on file (ends in <strong>{phoneLast4}</strong>). Links also
          expire after 72 hours for security.
        </p>
        <button
          type="button"
          disabled={otpBusy}
          onClick={requestCode}
          className="rounded-md bg-violet-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {otpBusy ? "Sending…" : "Send SMS code"}
        </button>
        <form onSubmit={confirmCode} className="flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium text-slate-700">
            6-digit code
            <input
              className="mt-1 block w-40 rounded border border-slate-300 px-3 py-2 text-slate-900"
              inputMode="numeric"
              maxLength={8}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              autoComplete="one-time-code"
            />
          </label>
          <button
            type="submit"
            disabled={otpBusy || otpCode.replace(/\D/g, "").length !== 6}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Confirm
          </button>
        </form>
        {status ? <p className="text-sm text-slate-600">{status}</p> : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="mt-8 space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <p className="text-sm text-slate-600">
        Drag and drop files here, or choose below. PDFs and images only — up to 15&nbsp;MB per file, up to 20 files
        at once. This link expires 72 hours after it was issued unless your agent sends a new one.
      </p>
      {portalStatus ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-slate-800">
          <p className="font-semibold text-emerald-900">Visa application status: {portalStatus.status}</p>
          {portalStatus.stage ? <p className="mt-1">Stage: {portalStatus.stage}</p> : null}
          {portalStatus.updatedAt ? <p className="mt-1">Last updated: {portalStatus.updatedAt}</p> : null}
          {portalStatus.note ? <p className="mt-1">{portalStatus.note}</p> : null}
        </div>
      ) : null}
      <label className="block text-sm font-medium text-slate-700">
        PDF or images (max 15MB each, max 20 files)
        <input
          name="files"
          type="file"
          multiple
          accept="application/pdf,image/*"
          className="mt-2 block w-full text-sm"
          required
        />
      </label>
      <p className="text-xs text-slate-500">
        For passport identity pages, put <strong>passport</strong>, <strong>travel document</strong>, or{" "}
        <strong>ID</strong> in the file name so the server can try to extract name and date-of-birth hints for your
        advisor. Results are machine-assisted — your agent will verify against the original.
      </p>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-violet-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Uploading…" : "Upload files"}
      </button>
      {status ? <p className="text-sm text-slate-600">{status}</p> : null}
      <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
        <p className="font-semibold">Files received in this link</p>
        {docs.length === 0 ? (
          <p className="mt-1 text-slate-500">No files uploaded yet.</p>
        ) : (
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {[...docs]
              .sort((a, b) => String(b.uploadedAt || "").localeCompare(String(a.uploadedAt || "")))
              .map((d) => (
                <li key={`${d.storedName}-${d.uploadedAt}`}>
                  <a className="underline" href={d.url} target="_blank" rel="noreferrer">
                    {d.filename}
                  </a>
                </li>
              ))}
          </ul>
        )}
      </div>
    </form>
  );
}
