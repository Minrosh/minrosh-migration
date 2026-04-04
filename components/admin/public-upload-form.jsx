"use client";

import { useEffect, useState } from "react";

export function PublicUploadForm({ token }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);

  async function refreshDocuments() {
    const res = await fetch(`/api/upload/${token}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setDocs(Array.isArray(data?.customer?.documents) ? data.customer.documents : []);
    }
  }

  useEffect(() => {
    refreshDocuments();
  }, [token]);

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
      const res = await fetch(`/api/upload/${token}`, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(data.error || "Upload failed");
        setLoading(false);
        return;
      }
      const n = data.count ?? data.documents?.length ?? 0;
      if (data.errors?.length) {
        setStatus(
          `Uploaded ${n} file(s). Some were skipped: ${data.errors.join(" · ")}`
        );
      } else {
        setStatus(
          n === 1
            ? "Uploaded successfully. Thank you."
            : `Uploaded ${n} files successfully. Thank you.`
        );
      }
      input.value = "";
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

  return (
    <form
      onSubmit={onSubmit}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="mt-8 space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <p className="text-sm text-slate-600">
        Drag and drop files here, or choose below. PDFs and images only — up to 15&nbsp;MB per file, up to
        20 files at once.
      </p>
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
