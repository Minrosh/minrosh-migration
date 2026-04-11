import { adminJsonUnauthorized, requireAdminWrite, verifyAdminRequest } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { getClientIp } from "@/lib/security/request-ip";
import { readPublishHistory } from "@/lib/intelligence/publish-history";
import { rollbackPublishedDraft } from "@/lib/intelligence/rollback";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const store = readPublishHistory();
  return Response.json({ entries: Array.isArray(store.entries) ? store.entries : [] });
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
  const id = String(body.id || "").trim();
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const store = readPublishHistory();
  const entry = (store.entries || []).find((row) => row.id === id);
  if (!entry) return Response.json({ error: "Publish history entry not found" }, { status: 404 });
  if (entry.status === "rolled_back") {
    return Response.json({ error: "Already rolled back" }, { status: 409 });
  }

  const result = rollbackPublishedDraft({
    publishHistoryEntryId: id,
    draftId: entry.intelligenceDraftId,
    faqPatchIds: Array.isArray(entry.faqPatchIds) ? entry.faqPatchIds : [],
  });

  appendAudit("intel_publish_rollback", id, {
    ip: getClientIp(request),
    route: "POST /api/admin/intelligence/publish-history",
    meta: {
      draftId: entry.intelligenceDraftId,
      ...result,
    },
  });
  return Response.json({ ok: true, entryId: id, result });
}
