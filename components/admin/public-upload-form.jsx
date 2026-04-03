"use client";

import { useState } from "react";

export function PublicUploadForm({ token }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("");
    const input = e.target.elements.file;
    const file = input?.files?.[0];
    if (!file) {
      setStatus("Choose a file first.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/upload/${token}`, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(data.error || "Upload failed");
        setLoading(false);
        return;
      }
      setStatus("Uploaded successfully. Thank you.");
      input.value = "";
    } catch {
      setStatus("Network error");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <label className="block text-sm font-medium text-slate-700">
        PDF or image (max 15MB)
        <input
          name="file"
          type="file"
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
        {loading ? "Uploading…" : "Upload"}
      </button>
      {status ? <p className="text-sm text-slate-600">{status}</p> : null}
    </form>
  );
}
