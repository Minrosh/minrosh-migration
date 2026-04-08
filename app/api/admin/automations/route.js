import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { readCrmAutomations, writeCrmAutomations } from "@/lib/admin/crm-store";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  return Response.json(readCrmAutomations());
}

export async function PUT(request) {
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || !Array.isArray(body.rules)) {
    return Response.json({ error: "rules array required" }, { status: 400 });
  }
  writeCrmAutomations({ rules: body.rules.slice(0, 100) });
  return Response.json({ ok: true });
}
