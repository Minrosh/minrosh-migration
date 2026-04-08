import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { getClientIp } from "@/lib/security/request-ip";
import { convertLeadToOpportunity } from "@/lib/crm/leads-service";

export async function POST(request) {
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body = {};
  try {
    body = await request.json();
  } catch {
    /* empty body */
  }
  const leadId = String(body.leadId || "").trim();
  if (!leadId) return Response.json({ error: "leadId required" }, { status: 400 });
  const result = convertLeadToOpportunity(leadId, { title: body.title, value: body.value });
  if (!result.ok) {
    return Response.json({ error: result.error || "convert_failed" }, { status: 400 });
  }
  const ip = getClientIp(request);
  appendAudit("crm_lead_convert", leadId, { ip, route: "POST /api/admin/leads/convert" });
  return Response.json(result);
}
