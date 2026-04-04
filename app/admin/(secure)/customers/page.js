import { Suspense } from "react";
import { CustomersPanel } from "@/components/admin/customers-panel";

export default function CustomersPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Customers</h1>
      <p className="mb-8 text-muted-foreground">
        Manage profiles, statuses, and secure document upload links. Files save under{" "}
        <code className="rounded bg-muted px-1">storage/uploads/[customer-folder]/</code> (private; staff use
        admin download or server SFTP). Open a row with{" "}
        <strong>Open details</strong> for documents, ZIP download, and internal notes.
      </p>
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <CustomersPanel />
      </Suspense>
    </div>
  );
}
