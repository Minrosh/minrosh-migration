"use client";

import { useState } from "react";

export function NewsletterUnsubscribeClient() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

  async function submit(e) {
    e.preventDefault();
    setStatus({ type: "loading", message: "" });
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const payload = await res.json().catch(() => ({}));
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      const errorMessage = payload?.error?.message || payload?.error || data?.error;
      if (!res.ok) {
        setStatus({ type: "error", message: errorMessage || "Could not process request." });
        return;
      }
      setStatus({ type: "success", message: data.message || "Unsubscribed." });
      setToken("");
    } catch {
      setStatus({ type: "error", message: "Network error." });
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4 rounded-lg border border-border bg-card p-6">
      <label className="block text-sm font-medium">
        Unsubscribe token (from your email link)
        <input
          className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste token"
          autoComplete="off"
        />
      </label>
      <button
        type="submit"
        disabled={status.type === "loading" || !token.trim()}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {status.type === "loading" ? "Submitting…" : "Unsubscribe"}
      </button>
      {status.message ? (
        <p className={`text-sm ${status.type === "success" ? "text-green-700" : "text-destructive"}`}>
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
