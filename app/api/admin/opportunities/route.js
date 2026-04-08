import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { listOpportunities, updateOpportunityStage } from "@/lib/crm/opportunities-service";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  return Response.json({ opportunities: listOpportunities() });
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
  const result = updateOpportunityStage(id, {
    stage: body.stage,
    expectedVersion: body.expectedVersion,
    note: body.note,
  });
  if (!result.ok) {
    return Response.json(result, { status: result.error === "version_conflict" ? 409 : 404 });
  }
  return Response.json(result);
}
