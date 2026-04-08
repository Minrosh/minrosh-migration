import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { getClientIp } from "@/lib/security/request-ip";
import { createLead, listLeads, updateLead } from "@/lib/crm/leads-service";
import { runAutomationRules } from "@/lib/crm/automation-runner";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  return Response.json({ leads: listLeads() });
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
  const lead = createLead(body);
  const ip = getClientIp(request);
  appendAudit("crm_lead_create", lead.id, { ip, route: "POST /api/admin/leads" });
  runAutomationRules({ trigger: "lead_created", payload: { customerId: lead.customerId } });
  return Response.json({ lead });
}

export async function PATCH(request) {
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const id = String(body.id || "").trim();
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  const { id: _omit, ...patch } = body;
  const next = updateLead(id, patch);
  if (!next) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ lead: next });
}
