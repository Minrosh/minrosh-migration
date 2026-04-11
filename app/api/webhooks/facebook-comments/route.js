import { appendAudit } from "@/lib/admin/audit";
import { createHmac, timingSafeEqual } from "node:crypto";
import { basicSentimentSignal } from "@/lib/intelligence/sentiment";
import { appendIntelligenceEvent, appendSocialSentimentEvent, pushAdminAlert } from "@/lib/intelligence/store";
import { createCrmHotLeadFromSocial } from "@/lib/intelligence/dm-leads";

function verifyWebhookSecret(request) {
  const expected = String(process.env.FACEBOOK_WEBHOOK_SECRET || "").trim();
  if (!expected) return false;
  const got = String(request.headers.get("x-webhook-secret") || "").trim();
  return Boolean(got && got === expected);
}

function verifyFacebookSignature(request, rawBody) {
  const appSecret = String(process.env.FACEBOOK_APP_SECRET || "").trim();
  if (!appSecret) return false;
  const signed = String(
    request.headers.get("x-hub-signature-256") || request.headers.get("x-hub-signature") || ""
  ).trim();
  if (!signed.includes("=")) return false;
  const [algo, digest] = signed.split("=", 2);
  const normalizedAlgo = String(algo || "").toLowerCase();
  if (!["sha1", "sha256"].includes(normalizedAlgo)) return false;
  const computed = createHmac(normalizedAlgo, appSecret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(String(digest || ""), "hex");
  const b = Buffer.from(computed, "hex");
  if (!a.length || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const expected = String(process.env.FACEBOOK_VERIFY_TOKEN || "").trim();
  if (mode === "subscribe" && challenge && expected && token === expected) {
    return new Response(challenge, { status: 200 });
  }
  return Response.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(request) {
  const rawBody = await request.text();
  const authorized = verifyWebhookSecret(request) || verifyFacebookSignature(request, rawBody);
  if (!authorized) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body = null;
  try {
    body = JSON.parse(rawBody || "{}");
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const commentText = String(body?.comment?.message || body?.message || "").trim();
  const signal = basicSentimentSignal(commentText);
  const hotLead = createCrmHotLeadFromSocial({ commentText, platform: "facebook" });
  const event = appendSocialSentimentEvent({
    platform: "facebook",
    postId: String(body?.postId || body?.entry?.[0]?.id || "").trim(),
    commentId: String(body?.comment?.id || "").trim(),
    commentText,
    sentimentScore: signal.score,
    negative: signal.negative,
    labels: signal.labels,
    leadIntentScore: hotLead.evaluation.intentScore,
    hotLead: hotLead.evaluation.hotLead,
    crmLeadId: hotLead.lead?.id || "",
  });

  if (signal.negative) {
    appendIntelligenceEvent({
      type: "social_sentiment_negative",
      actor: "webhook_facebook",
      country: String(body?.country || "").trim(),
      sourceName: "Facebook comments",
      sourceUrl: "",
      contentHash: "",
      payload: {
        labels: signal.labels,
        commentId: event.commentId,
        postId: event.postId,
        recommendation: "Prepare clarification post and FAQ patch in affected destination pages.",
      },
    });
    pushAdminAlert({
      type: "sentiment_negative",
      title: "Negative sentiment spike detected",
      message: `Facebook comment may require clarification response. Labels: ${signal.labels.join(", ")}`,
      href: "/admin/intelligence",
    });
  }

  appendAudit("facebook_comment_sentiment", event.id, {
    route: "POST /api/webhooks/facebook-comments",
    meta: {
      negative: signal.negative,
      score: signal.score,
      labels: signal.labels,
      hotLead: hotLead.evaluation.hotLead,
      crmLeadId: hotLead.lead?.id || "",
    },
  });

  return Response.json({
    ok: true,
    eventId: event.id,
    signal,
    leadIntent: hotLead.evaluation,
    crmLeadId: hotLead.lead?.id || null,
  });
}
