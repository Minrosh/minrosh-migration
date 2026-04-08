import { adminJsonUnauthorized, requireAdminWrite, verifyAdminRequest } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { listRecurringRules, runRecurringBilling, upsertRecurringRule } from "@/lib/invoice/recurring-service";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  return Response.json({ rules: listRecurringRules() });
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
    const result = runRecurringBilling(new Date());
    appendAudit("invoice_recurring_run", `${result.createdCount} created`);
    return Response.json(result);
  }
  const rule = upsertRecurringRule(body || {});
  appendAudit("invoice_recurring_upsert", rule.id);
  return Response.json({ rule });
}
