import { WebsitePageEditorPanel } from "@/features/admin-panel/components/website/website-page-editor-panel";
import { adminSlugToPath } from "@/lib/website/slug-utils";

export default async function AdminWebsitePageEditorPage({ params }) {
  const resolved = await params;
  const adminSlug = Array.isArray(resolved?.slug) ? resolved.slug[0] : resolved?.slug;
  const pagePath = adminSlugToPath(adminSlug);

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Edit page</h1>
      <p className="mb-8 text-muted-foreground">
        Draft content for <code className="rounded bg-muted px-1">{pagePath}</code>. Changes save to{" "}
        <code className="rounded bg-muted px-1">data/website-pages.json</code> only — not live until Sprint 3+.
      </p>
      <WebsitePageEditorPanel adminSlug={adminSlug} pagePath={pagePath} />
    </div>
  );
}
