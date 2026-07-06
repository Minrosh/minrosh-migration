"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageRenderer } from "@/components/website-blocks/page-renderer";
import { WebsiteSeoPreview } from "@/features/admin-panel/components/website/website-seo-preview";
import { WEBSITE_BLOCK_TYPES } from "@/lib/website/block-schemas";

async function parseJsonResponseSafe(response) {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    return {};
  }
}

function emptyHero() {
  return {
    id: `hero-${Date.now()}`,
    type: "hero",
    props: {
      eyebrow: "",
      heading: "",
      subheading: "",
      image: "",
      imageAlt: "",
      primaryCta: { text: "", href: "" },
      secondaryCta: { text: "", href: "" },
    },
  };
}

function emptyText() {
  return {
    id: `text-${Date.now()}`,
    type: "text",
    props: { heading: "", paragraphs: [""] },
  };
}

function SectionEditor({ section, onChange, onRemove }) {
  const props = section.props || {};
  if (section.type === "hero") {
    return (
      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <p className="font-medium">Hero block</p>
          <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
            Remove
          </Button>
        </div>
        <div>
          <Label htmlFor={`${section.id}-heading`}>Heading</Label>
          <Input
            id={`${section.id}-heading`}
            value={props.heading || ""}
            onChange={(e) => onChange({ ...props, heading: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor={`${section.id}-subheading`}>Subheading</Label>
          <Input
            id={`${section.id}-subheading`}
            value={props.subheading || ""}
            onChange={(e) => onChange({ ...props, subheading: e.target.value })}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Primary button text</Label>
            <Input
              value={props.primaryCta?.text || ""}
              onChange={(e) =>
                onChange({ ...props, primaryCta: { ...props.primaryCta, text: e.target.value } })
              }
            />
          </div>
          <div>
            <Label>Primary button link</Label>
            <Input
              value={props.primaryCta?.href || ""}
              onChange={(e) =>
                onChange({ ...props, primaryCta: { ...props.primaryCta, href: e.target.value } })
              }
            />
          </div>
        </div>
      </div>
    );
  }
  if (section.type === "text") {
    return (
      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <p className="font-medium">Text block</p>
          <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
            Remove
          </Button>
        </div>
        <div>
          <Label>Heading</Label>
          <Input value={props.heading || ""} onChange={(e) => onChange({ ...props, heading: e.target.value })} />
        </div>
        <div>
          <Label>Paragraph</Label>
          <textarea
            className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={(props.paragraphs && props.paragraphs[0]) || ""}
            onChange={(e) => onChange({ ...props, paragraphs: [e.target.value] })}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium">{section.type} block</p>
        <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
          Remove
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Use JSON import in a later sprint for this block type.</p>
    </div>
  );
}

export function WebsitePageEditorPanel({ adminSlug, pagePath }) {
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [seo, setSeo] = useState({
    title: "",
    description: "",
    canonical: "",
    ogTitle: "",
    ogDescription: "",
    noindex: false,
  });
  const [pageTitle, setPageTitle] = useState("");
  const [versions, setVersions] = useState([]);
  const [permissions, setPermissions] = useState({ read: true, write: true, publish: true });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info");
  const [busy, setBusy] = useState("");

  const loadVersions = useCallback(async () => {
    const res = await fetch(`/api/admin/website/pages/${adminSlug}/versions`, { cache: "no-store" });
    const payload = await parseJsonResponseSafe(res);
    const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
    setVersions(Array.isArray(data.versions) ? data.versions : []);
  }, [adminSlug]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pageRes, listRes] = await Promise.all([
        fetch(`/api/admin/website/pages/${adminSlug}`, { cache: "no-store" }),
        fetch("/api/admin/website/pages", { cache: "no-store" }),
      ]);
      const pagePayload = await parseJsonResponseSafe(pageRes);
      const listPayload = await parseJsonResponseSafe(listRes);
      const pageData = pagePayload?.data && typeof pagePayload.data === "object" ? pagePayload.data : pagePayload;
      const listData = listPayload?.data && typeof listPayload.data === "object" ? listPayload.data : listPayload;
      if (listData?.permissions) setPermissions(listData.permissions);
      if (!pageRes.ok) {
        setMessage(pageData?.error?.message || "Could not load page.");
        setMessageTone("error");
        return;
      }
      const p = pageData.page;
      setPage(p);
      setPageTitle(p.pageTitle || "");
      setSections(Array.isArray(p.draft?.sections) ? p.draft.sections : []);
      setSeo({
        title: p.seo?.title || "",
        description: p.seo?.description || "",
        canonical: p.seo?.canonical || "",
        ogTitle: p.seo?.ogTitle || "",
        ogDescription: p.seo?.ogDescription || "",
        noindex: Boolean(p.seo?.noindex),
      });
      setMessage("");
      await loadVersions();
    } finally {
      setLoading(false);
    }
  }, [adminSlug, loadVersions]);

  useEffect(() => {
    load();
  }, [load]);

  function notify(text, tone = "success") {
    setMessage(text);
    setMessageTone(tone);
  }

  async function saveDraft() {
    if (!permissions.write) {
      notify("You do not have website:write permission.", "error");
      return;
    }
    setBusy("save");
    try {
      const res = await fetch(`/api/admin/website/pages/${adminSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageTitle, sections, seo, updatedBy: "admin" }),
      });
      const payload = await parseJsonResponseSafe(res);
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      if (!res.ok) {
        notify(data?.error?.message || data?.error || "Save failed.", "error");
        return;
      }
      setPage(data.page);
      notify("Draft saved to data/website-pages.json");
    } finally {
      setBusy("");
    }
  }

  async function publishDraft() {
    if (!permissions.publish) {
      notify("You do not have website:publish permission.", "error");
      return;
    }
    if (!window.confirm("Publish this draft? Public site is not wired yet — this updates published JSON only.")) return;
    setBusy("publish");
    try {
      const saveRes = await fetch(`/api/admin/website/pages/${adminSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageTitle, sections, seo, updatedBy: "admin" }),
      });
      const savePayload = await parseJsonResponseSafe(saveRes);
      if (!saveRes.ok) {
        notify(savePayload?.error?.message || "Save before publish failed.", "error");
        return;
      }
      const res = await fetch(`/api/admin/website/pages/${adminSlug}/publish`, { method: "POST" });
      const payload = await parseJsonResponseSafe(res);
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      if (!res.ok) {
        notify(data?.error?.message || "Publish failed.", "error");
        return;
      }
      setPage(data.page);
      notify("Published — snapshot saved to version history.");
      await loadVersions();
    } finally {
      setBusy("");
    }
  }

  async function openPreview() {
    window.open(`/admin/website/preview/${adminSlug}`, "_blank", "noopener,noreferrer");
  }

  async function restoreVersion(versionId, target) {
    if (!permissions.publish) {
      notify("You do not have website:publish permission.", "error");
      return;
    }
    const label = target === "published" ? "published (live JSON)" : "draft";
    if (!window.confirm(`Restore this version to ${label}?`)) return;
    setBusy("rollback");
    try {
      const res = await fetch(`/api/admin/website/pages/${adminSlug}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId, target }),
      });
      const payload = await parseJsonResponseSafe(res);
      const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
      if (!res.ok) {
        notify(data?.error?.message || "Rollback failed.", "error");
        return;
      }
      setPage(data.page);
      setSections(Array.isArray(data.page?.draft?.sections) ? data.page.draft.sections : []);
      notify(`Restored to ${data.target || target}.`);
      await loadVersions();
    } finally {
      setBusy("");
    }
  }

  function updateSection(index, nextProps) {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, props: nextProps } : s)));
  }

  function removeSection(index) {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }

  if (loading) return <p className="text-muted-foreground">Loading page…</p>;

  const hasUnpublishedDraft =
    page?.published?.sections?.length &&
    JSON.stringify(page.draft?.sections) !== JSON.stringify(page.published?.sections);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/website">← All pages</Link>
        </Button>
        <code className="rounded bg-muted px-2 py-1 text-sm">{pagePath}</code>
        {page?.status === "published" ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Published</span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">Draft</span>
        )}
        {hasUnpublishedDraft ? (
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-900">Unpublished changes</span>
        ) : null}
      </div>

      {message ? (
        <p className={`text-sm ${messageTone === "error" ? "text-destructive" : "text-emerald-700"}`}>{message}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={saveDraft} disabled={!permissions.write || busy === "save"}>
          {busy === "save" ? "Saving…" : "Save draft"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={publishDraft}
          disabled={!permissions.publish || busy === "publish"}
        >
          {busy === "publish" ? "Publishing…" : "Publish"}
        </Button>
        <Button type="button" variant="outline" onClick={openPreview}>
          Preview
        </Button>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="space-y-6">
          <div>
            <Label htmlFor="page-title">Page title (admin)</Label>
            <Input id="page-title" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} />
          </div>

          <div className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="font-semibold">SEO</h3>
            <div>
              <Label>SEO title</Label>
              <Input value={seo.title || ""} onChange={(e) => setSeo({ ...seo, title: e.target.value })} />
            </div>
            <div>
              <Label>SEO description</Label>
              <textarea
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={seo.description || ""}
                onChange={(e) => setSeo({ ...seo, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Canonical URL (optional)</Label>
              <Input value={seo.canonical || ""} onChange={(e) => setSeo({ ...seo, canonical: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(seo.noindex)}
                onChange={(e) => setSeo({ ...seo, noindex: e.target.checked })}
              />
              noindex
            </label>
            <WebsiteSeoPreview title={seo.title} description={seo.description} path={pagePath} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setSections((p) => [...p, emptyHero()])}>
              + Hero
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setSections((p) => [...p, emptyText()])}>
              + Text
            </Button>
          </div>

          <div className="space-y-4">
            {sections.map((section, index) => (
              <SectionEditor
                key={section.id}
                section={section}
                onChange={(nextProps) => updateSection(index, nextProps)}
                onRemove={() => removeSection(index)}
              />
            ))}
          </div>

          <p className="text-xs text-muted-foreground">Block types: {WEBSITE_BLOCK_TYPES.join(", ")}</p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold">Block preview</h2>
            <PageRenderer sections={sections} />
            {page?.draft?.updatedAt ? (
              <p className="mt-4 text-xs text-muted-foreground">Draft saved: {page.draft.updatedAt}</p>
            ) : null}
            {page?.published?.publishedAt ? (
              <p className="text-xs text-muted-foreground">Last published: {page.published.publishedAt}</p>
            ) : null}
          </div>

          <div className="rounded-lg border border-border p-4">
            <h2 className="mb-3 text-lg font-semibold">Version history</h2>
            {!versions.length ? (
              <p className="text-sm text-muted-foreground">No published versions yet.</p>
            ) : (
              <ul className="space-y-3">
                {versions.map((v) => (
                  <li key={v.id} className="rounded border border-border p-3 text-sm">
                    <p className="font-medium">{new Date(v.createdAt).toLocaleString()}</p>
                    <p className="text-muted-foreground">By {v.publishedBy || "admin"} · {v.status}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!permissions.publish || busy === "rollback"}
                        onClick={() => restoreVersion(v.id, "draft")}
                      >
                        Restore to draft
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={!permissions.publish || busy === "rollback"}
                        onClick={() => restoreVersion(v.id, "published")}
                      >
                        Restore published
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
