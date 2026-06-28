import { WebsiteNavigationPanel } from "@/features/admin-panel/components/website/website-navigation-panel";

export default function AdminWebsiteNavigationPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Header &amp; footer</h1>
      <p className="mb-8 text-muted-foreground">
        Safe label/link editing only — layout structure stays fixed. Not wired to the public site in Sprint 1.
      </p>
      <WebsiteNavigationPanel />
    </div>
  );
}
