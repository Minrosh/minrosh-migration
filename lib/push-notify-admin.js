import webpush from "web-push";

/**
 * Optional admin alert when a high-scoring quiz lead is submitted (score >= 85).
 * Requires VAPID keys and INTERNAL_PUSH_SUBSCRIPTION_JSON in server .env.
 */
export async function notifyAdminHighPriorityQuizLead({ quizLeadId, name, score }) {
  const subJson = process.env.INTERNAL_PUSH_SUBSCRIPTION_JSON?.trim();
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!subJson || !publicKey || !privateKey) {
    return { ok: false, skipped: true };
  }

  try {
    const subscription = JSON.parse(subJson);
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT?.trim() || "mailto:info@minroshmigration.com.au",
      publicKey,
      privateKey
    );
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "High-priority quiz lead",
        body: `${name || "Visitor"} scored ${score} — ${quizLeadId}`,
        data: { url: "/admin/leads" },
      })
    );
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
