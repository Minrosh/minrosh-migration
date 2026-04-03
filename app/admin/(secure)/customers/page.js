import { CustomersPanel } from "@/components/admin/customers-panel";

export default function CustomersPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Customers</h1>
      <p className="mb-8 text-muted-foreground">
        Manage profiles, statuses, and secure document upload links. Files save under{" "}
        <code className="rounded bg-muted px-1">public/uploads/[customer-id]/</code>.
      </p>
      <CustomersPanel />
    </div>
  );
}
