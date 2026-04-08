import { adminJsonUnauthorized, requireAdminWrite, verifyAdminRequest } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { listReminderRules, runInvoiceReminders, upsertReminderRule } from "@/lib/invoice/reminder-service";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  return Response.json({ rules: listReminderRules() });
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
    const result = runInvoiceReminders(new Date());
    appendAudit("invoice_reminder_run", `${result.sentCount} reminders`);
    return Response.json(result);
  }
  const rule = upsertReminderRule(body || {});
  appendAudit("invoice_reminder_upsert", rule.id);
  return Response.json({ rule });
}
