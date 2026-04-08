import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { recordInteraction } from "@/lib/crm/record-interaction";
import { readCrmInteractions } from "@/lib/admin/crm-store";
import { getAdminRole } from "@/lib/admin/permissions";

export async function GET(request) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const { searchParams } = new URL(request.url);
  const customerId = String(searchParams.get("customerId") || "").trim();
  const leadId = String(searchParams.get("leadId") || "").trim();
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit")) || 80));
  const { interactions } = readCrmInteractions();
  let list = Array.isArray(interactions) ? interactions : [];
  if (customerId) list = list.filter((i) => i.customerId === customerId);
  if (leadId) list = list.filter((i) => i.leadId === leadId);
  list = list.slice(0, limit);
  list.sort((a, b) => String(a.at).localeCompare(String(b.at)));
  return Response.json({ interactions: list });
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
  const customerId = String(body.customerId || "").trim();
  const leadId = String(body.leadId || "").trim();
  const type = String(body.type || "note").trim();
  const bodyText = String(body.body || "").trim();
  if (!bodyText) return Response.json({ error: "body required" }, { status: 400 });
  if (!customerId && !leadId) {
    return Response.json({ error: "customerId or leadId required" }, { status: 400 });
  }
  const entry = recordInteraction({
    customerId: customerId || undefined,
    leadId: leadId || undefined,
    type,
    channel: body.channel,
    subject: body.subject,
    body: bodyText,
    meta: body.meta,
    actor: getAdminRole(),
  });
  return Response.json({ interaction: entry });
}
