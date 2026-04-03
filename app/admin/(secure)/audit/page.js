import { AuditPanel } from "@/components/admin/audit-panel";

export default function AuditPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Audit log</h1>
      <p className="mb-8 text-muted-foreground">Recent admin actions (latest 500).</p>
      <AuditPanel />
    </div>
  );
}
