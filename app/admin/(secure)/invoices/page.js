import { InvoicesPanel } from "@/components/admin/invoices-panel";

export default function InvoicesPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Invoices</h1>
      <p className="mb-8 text-muted-foreground">
        Create records in <code className="rounded bg-muted px-1">data/invoices.json</code> and download PDFs.
      </p>
      <InvoicesPanel />
    </div>
  );
}
