import { adminJsonUnauthorized, requireAdminWrite, verifyAdminRequest } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { getClientIp } from "@/lib/security/request-ip";
import { readIntelligenceDrafts, updateDraftStatus } from "@/lib/intelligence/store";
import { publishDraftToNewsStore } from "@/lib/intelligence/publish";
import { evaluateDraftGrounding } from "@/lib/intelligence/grounding";
import { applyFaqSuggestionsFromDraft } from "@/lib/intelligence/faq";
import { queueFacebookPostFromDraft } from "@/lib/intelligence/facebook";
import { queueNewsletterFromDraft } from "@/lib/intelligence/channels";
import { appendPublishHistory } from "@/lib/intelligence/publish-history";

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
  const previous = readIntelligenceDrafts().drafts?.find((d) => d.id === id) || null;
  const draft = updateDraftStatus({
    id,
    status,
    moderationNote: body.moderationNote,
    edits: body.edits,
  });
  if (!draft) return Response.json({ error: "Draft not found" }, { status: 404 });
  let publishedNews = null;
  let faqPatches = [];
  let facebookPost = null;
  let newsletterQueueItem = null;
  let publishHistoryEntry = null;
  if (status === "approved") {
    const grounding = evaluateDraftGrounding(draft);
    if (!grounding.ok) {
      return Response.json(
        {
          error: "Grounding verification failed. Draft cannot be approved.",
          grounding,
        },
        { status: 409 }
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
      },
    });
  }
  appendAudit(`intel_draft_${status}`, id, {
    ip: getClientIp(request),
    route: "PATCH /api/admin/intelligence/drafts",
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
  return Response.json({
    draft,
    publishedNews,
    faqPatches,
    facebookPost,
    newsletterQueueItem,
    publishHistoryEntry,
  });
}
