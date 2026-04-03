import { CrmPanel } from "@/components/admin/crm-panel";

export default function CrmPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">CRM</h1>
      <p className="mb-8 text-muted-foreground">
        Website enquiries from <code className="rounded bg-muted px-1">data/enquiries.json</code>. Thank-you
        emails are sent automatically when the contact form is submitted (existing flow).
      </p>
      <CrmPanel />
    </div>
  );
}
