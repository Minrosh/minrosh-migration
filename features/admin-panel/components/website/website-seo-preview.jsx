"use client";

function truncate(text, max) {
  const s = String(text || "").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trim()}…`;
}

/**
 * Google-style SERP snippet preview for CMS SEO fields.
 */
export function WebsiteSeoPreview({ title, description, path = "/" }) {
  const displayTitle = truncate(title || "Page title", 60) || "Page title";
  const displayDescription =
    truncate(description || "Add a meta description to control how this page may appear in search results.", 160);
  const displayUrl = `minroshmigration.com.au${path === "/" ? "" : path}`;

  return (
    <div className="rounded-lg border border-border bg-card p-4" aria-label="Google search preview">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Search preview</p>
      <div className="space-y-1">
        <p className="text-sm text-[#202124]">{displayUrl}</p>
        <p className="text-xl text-[#1a0dab]">{displayTitle}</p>
        <p className="text-sm leading-snug text-[#4d5156]">{displayDescription}</p>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Public SEO applies only after CMS is wired and published. Preview is indicative.
      </p>
    </div>
  );
}
