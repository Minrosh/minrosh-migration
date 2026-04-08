import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { createQuote, listQuotes } from "@/lib/crm/quotes-service";
import { appendAudit } from "@/lib/admin/audit";
import { getClientIp } from "@/lib/security/request-ip";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  return Response.json({ quotes: listQuotes() });
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
  const quote = await createQuote(body);
  const ip = getClientIp(request);
  appendAudit("crm_quote_create", quote.id, { ip, route: "POST /api/admin/quotes" });
  return Response.json({ quote });
}
