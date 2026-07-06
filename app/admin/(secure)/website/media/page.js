import { WebsiteMediaPanel } from "@/features/admin-panel/components/website/website-media-panel";

export default function AdminWebsiteMediaPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Media library</h1>
      <p className="mb-8 text-muted-foreground">
        Website images for CMS blocks. Upload support arrives in Sprint 2.
      </p>
      <WebsiteMediaPanel />
    </div>
  );
}
