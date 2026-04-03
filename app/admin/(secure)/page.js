import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default function AdminOverviewPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Dashboard overview</h1>
      <p className="mb-8 text-muted-foreground">High-level stats across enquiries, customers, and invoices.</p>
      <AdminDashboard />
    </div>
  );
}
