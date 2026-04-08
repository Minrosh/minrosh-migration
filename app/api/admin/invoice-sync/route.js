import { adminJsonUnauthorized, requireAdminWrite, verifyAdminRequest } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { listSyncJobs, queueAccountingSync, runAccountingSync } from "@/lib/invoice/accounting-sync-service";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  return Response.json({ jobs: listSyncJobs() });
}

export async function POST(request) {
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (body?.action === "runNow") {
    const result = runAccountingSync(String(body.provider || "xero"));
    appendAudit("invoice_sync_run", `${result.processed} jobs`);
    return Response.json(result);
  }
  const job = queueAccountingSync({ provider: body?.provider, invoiceIds: body?.invoiceIds });
  appendAudit("invoice_sync_queue", job.id);
  return Response.json({ job });
}
