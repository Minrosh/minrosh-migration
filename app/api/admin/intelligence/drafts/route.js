import { adminJsonUnauthorized, requireAdminWrite, verifyAdminRequest } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { getClientIp } from "@/lib/security/request-ip";
import { readIntelligenceDrafts, updateDraftStatus } from "@/lib/intelligence/store";
import { publishDraftToNewsStore } from "@/lib/intelligence/publish";
import { evaluateDraftGrounding } from "@/lib/intelligence/grounding";
import { applyFaqSuggestionsFromDraft } from "@/lib/intelligence/faq";
import { queueFacebookPostFromDraft } from "@/lib/intelligence/facebook";
import { queueNewsletterFromDraft } from "@/lib/intelligence/channels";
import { appendPublishHistory } from "@/lib/intelligence/publish-history";
import { revalidateNewsArticlePath, revalidateNewsBoardPaths } from "@/lib/news-data";

const DRAFT_STATUS_AUDIT_ACTIONS = {
  approved: AUDIT_ACTIONS.INTEL_DRAFT_APPROVED,
  pending: AUDIT_ACTIONS.INTEL_DRAFT_PENDING,
  rejected: AUDIT_ACTIONS.INTEL_DRAFT_REJECTED,
};

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const store = readIntelligenceDrafts();
  return apiOk({ drafts: Array.isArray(store.drafts) ? store.drafts : [] }, context);
}

export async function PATCH(request) {
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
  const status = String(body.status || "").trim();
  if (!id) return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "id required", status: 400 }, context);
  if (!["pending", "approved", "rejected"].includes(status)) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid status", status: 400 }, context);
  }
  if (status === "approved" && body.sourcesVerified !== true) {
    return apiFail(
      {
        code: API_ERROR_CODES.VALIDATION_FAILED,
        message:
          "Human verification required: confirm you have checked official sources (checkbox) before approving this draft.",
        status: 400,
      },
      context
    );
  }
  const previous = readIntelligenceDrafts().drafts?.find((d) => d.id === id) || null;
  const draft = updateDraftStatus({
    id,
    status,
    moderationNote: body.moderationNote,
    edits: body.edits,
  });
  if (!draft) return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Draft not found", status: 404 }, context);
  let publishedNews = null;
  let faqPatches = [];
  let facebookPost = null;
  let newsletterQueueItem = null;
  let publishHistoryEntry = null;
  if (status === "approved") {
    const grounding = evaluateDraftGrounding(draft);
    if (!grounding.ok) {
      return apiFail(
        {
          code: API_ERROR_CODES.CONFLICT,
          message: "Grounding verification failed. Draft cannot be approved.",
          status: 409,
          details: { grounding },
        },
        context
      );
    }
    publishedNews = publishDraftToNewsStore(draft);
    faqPatches = applyFaqSuggestionsFromDraft(draft);
    facebookPost = queueFacebookPostFromDraft(draft, publishedNews);
    newsletterQueueItem = queueNewsletterFromDraft(draft, publishedNews);
    publishHistoryEntry = appendPublishHistory({
      intelligenceDraftId: draft.id,
      faqPatchIds: faqPatches.map((p) => p.id),
      facebookPostId: facebookPost?.id || "",
      newsletterChannelItemId: newsletterQueueItem?.id || "",
      newsHref: publishedNews?.href || "",
      newsTitle: publishedNews?.title || "",
    });
    updateDraftStatus({
      id,
      status,
      moderationNote: body.moderationNote,
      edits: {
        publishedNewsHref: publishedNews?.href || "",
        publishedNewsDate: publishedNews?.date || "",
        publishedNewsTitle: publishedNews?.title || "",
        faqPatchIds: faqPatches.map((p) => p.id),
        facebookPostId: facebookPost?.id || "",
        newsletterChannelItemId: newsletterQueueItem?.id || "",
        publishHistoryId: publishHistoryEntry?.id || "",
        groundingApprovedAt: new Date().toISOString(),
        sourcesVerifiedAt: new Date().toISOString(),
        sourcesVerifiedIp: getClientIp(request),
      },
    });
    revalidateNewsBoardPaths();
    if (publishedNews?.slug) revalidateNewsArticlePath(publishedNews.slug);
  }
  appendAudit(DRAFT_STATUS_AUDIT_ACTIONS[status], id, {
    ip: getClientIp(request),
    route: "PATCH /api/admin/intelligence/drafts",
    requestId: context.requestId,
    meta: {
      fromStatus: previous?.status || "unknown",
      toStatus: status,
      country: draft.country,
      headline: draft.headline,
      sourceName: draft.sourceName,
      moderationNote: String(body.moderationNote || "").slice(0, 500),
      publishedNewsHref: publishedNews?.href || "",
      faqPatchCount: faqPatches.length,
      facebookPostId: facebookPost?.id || "",
      newsletterChannelItemId: newsletterQueueItem?.id || "",
    },
  });
  return apiOk({
    draft,
    publishedNews,
    faqPatches,
    facebookPost,
    newsletterQueueItem,
    publishHistoryEntry,
  }, context);
}
