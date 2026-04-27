import { NewsPanel } from "@/components/admin/news-panel";
import { NEWS_PUBLIC_BASE } from "@/lib/news-display";

export default function AdminNewsPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Immigration news</h1>
      <p className="mb-8 text-muted-foreground">
        Public hub at <code className="rounded bg-muted px-1">{NEWS_PUBLIC_BASE}</code> backed by{" "}
        <code className="rounded bg-muted px-1">data/news.json</code>. Intelligence approvals also write here with an
        auto slug and official link from crawled article URLs when available.
      </p>
      <NewsPanel />
    </div>
  );
}
