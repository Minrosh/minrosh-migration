import { adminJsonUnauthorized, requireAdminWrite, verifyAdminRequest } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { getClientIp } from "@/lib/security/request-ip";
import { readPublishHistory } from "@/lib/intelligence/publish-history";
import { rollbackPublishedDraft } from "@/lib/intelligence/rollback";
import { revalidateNewsArticlePath, revalidateNewsBoardPaths } from "@/lib/news-data";
import { NEWS_PUBLIC_BASE } from "@/lib/news-store";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const store = readPublishHistory();
  return apiOk({ entries: Array.isArray(store.entries) ? store.entries : [] }, context);
}

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }
  const id = String(body.id || "").trim();
  if (!id) return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "id required", status: 400 }, context);

  const store = readPublishHistory();
  const entry = (store.entries || []).find((row) => row.id === id);
  if (!entry) return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Publish history entry not found", status: 404 }, context);
  if (entry.status === "rolled_back") {
    return apiFail({ code: API_ERROR_CODES.CONFLICT, message: "Already rolled back", status: 409 }, context);
  }

  const result = rollbackPublishedDraft({
    publishHistoryEntryId: id,
    draftId: entry.intelligenceDraftId,
    faqPatchIds: Array.isArray(entry.faqPatchIds) ? entry.faqPatchIds : [],
  });

  appendAudit(AUDIT_ACTIONS.INTEL_PUBLISH_ROLLBACK, id, {
    ip: getClientIp(request),
    route: "POST /api/admin/intelligence/publish-history",
    requestId: context.requestId,
    meta: {
      draftId: entry.intelligenceDraftId,
      ...result,
    },
  });
  if (result.removedNews > 0) {
    revalidateNewsBoardPaths();
    const href = String(entry.newsHref || "");
    if (href.startsWith(`${NEWS_PUBLIC_BASE}/`)) {
      revalidateNewsArticlePath(href.slice(NEWS_PUBLIC_BASE.length + 1));
    }
  }
  return apiOk({ rolledBack: true, entryId: id, result }, context);
}
