import { adminJsonUnauthorized, requireAdminWrite, verifyAdminRequest } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { getClientIp } from "@/lib/security/request-ip";
import { readIntelligenceDrafts, updateDraftStatus } from "@/lib/intelligence/store";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const store = readIntelligenceDrafts();
  return Response.json({ drafts: Array.isArray(store.drafts) ? store.drafts : [] });
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
  const status = String(body.status || "").trim();
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  if (!["pending", "approved", "rejected"].includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }
  const draft = updateDraftStatus({
    id,
    status,
    moderationNote: body.moderationNote,
    edits: body.edits,
  });
  if (!draft) return Response.json({ error: "Draft not found" }, { status: 404 });
  appendAudit(`intel_draft_${status}`, id, {
    ip: getClientIp(request),
    route: "PATCH /api/admin/intelligence/drafts",
  });
  return Response.json({ draft });
}
