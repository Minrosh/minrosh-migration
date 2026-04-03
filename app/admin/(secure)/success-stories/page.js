import { SuccessStoriesPanel } from "@/components/admin/success-stories-panel";

export default function AdminSuccessStoriesPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Success stories</h1>
      <p className="mb-8 text-muted-foreground">
        Stored in <code className="rounded bg-muted px-1">data/success-stories.json</code>. Merge highlights into{" "}
        <code className="rounded bg-muted px-1">site.json</code> when you want them on the public homepage.
      </p>
      <SuccessStoriesPanel />
    </div>
  );
}
