"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { pathToAdminSlug } from "@/lib/website/slug-utils";

async function parseJsonResponseSafe(response) {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    return {};
  }
}

function StatusBadge({ page }) {
  const hasDraft = Array.isArray(page?.draft?.sections) && page.draft.sections.length > 0;
  const hasPublished = Array.isArray(page?.published?.sections) && page.published.sections.length > 0;
  if (hasPublished) {
    return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Published</span>;
  }
  if (hasDraft) {
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">Draft only</span>;
  }
  return <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Empty</span>;
}

export function WebsiteDashboardPanel() {
  const [pages, setPages] = useState([]);
  const [cmsEnabled, setCmsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/website/pages", { cache: "no-store" });
      const payload = await parseJsonResponseSafe(res);
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      if (!res.ok) {
        setMessage(data?.error?.message || data?.error || "Could not load pages.");
        setPages([]);
        return;
      }
      setPages(Array.isArray(data.pages) ? data.pages : []);
      setCmsEnabled(Boolean(data.cmsEnabled));
      setMessage("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-medium">Sprint 2 — publish &amp; preview (admin/staging only)</p>
        <p className="mt-1">
          Public CMS rendering is <strong>{cmsEnabled ? "enabled" : "disabled"}</strong> (
          <code>NEXT_PUBLIC_WEBSITE_CMS_ENABLED</code>). Public routes are <strong>not connected</strong> yet.
        </p>
      </div>

      {message ? <p className="text-sm text-destructive">{message}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/admin/website/compliance">Compliance</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/website/navigation">Header / Footer</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/website/media">Media library</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading pages…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Page</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Draft updated</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.slug} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{page.pageTitle}</td>
                  <td className="px-4 py-3">
                    <code>{page.slug}</code>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge page={page} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{page.draft?.updatedAt || "—"}</td>
                  <td className="px-4 py-3">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/admin/website/pages/${pathToAdminSlug(page.slug)}`}>Edit draft</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
