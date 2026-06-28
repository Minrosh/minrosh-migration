import Link from "next/link";
import { draftMode } from "next/headers";
import { PageRenderer } from "@/components/website-blocks/page-renderer";
import { Button } from "@/components/ui/button";
import { getWebsitePageBySlugForAdmin } from "@/lib/website/pages-store";
import { adminSlugToPath } from "@/lib/website/slug-utils";

export const metadata = {
  title: "CMS draft preview",
  robots: { index: false, follow: false },
};

export default async function WebsitePreviewPage({ params }) {
  const resolved = await params;
  const adminSlug = Array.isArray(resolved?.slug) ? resolved.slug[0] : resolved?.slug;
  const pagePath = adminSlugToPath(adminSlug);
  const draft = await draftMode();
  const isDraftMode = draft.isEnabled;

  const result = getWebsitePageBySlugForAdmin(pagePath);
  const page = result.page;
  const sections = isDraftMode
    ? page?.draft?.sections || []
    : page?.published?.sections?.length
      ? page.published.sections
      : page?.draft?.sections || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 p-4">
        <p className="text-sm">
          <strong>Admin preview</strong> — {pagePath}{" "}
          {isDraftMode ? (
            <span className="text-amber-700">(draft mode on)</span>
          ) : (
            <span className="text-muted-foreground">(draft mode off — showing latest saved draft)</span>
          )}
        </p>
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/website/pages/${adminSlug}`}>← Back to editor</Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href="/api/draft/disable">Exit preview</Link>
        </Button>
      </div>
      {!sections.length ? (
        <p className="text-muted-foreground">No draft sections saved for this page yet.</p>
      ) : (
        <PageRenderer sections={sections} />
      )}
    </div>
  );
}
