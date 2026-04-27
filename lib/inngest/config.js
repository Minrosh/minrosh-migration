/**
 * When true, Facebook publish cron enqueues Inngest events instead of calling Graph inline.
 * Requires Inngest app + `INNGEST_EVENT_KEY` (send) and `INNGEST_SIGNING_KEY` on `/api/inngest`.
 */
export function isFacebookPublishInngestEnabled() {
  return String(process.env.FACEBOOK_PUBLISH_USE_INNGEST || "").toLowerCase() === "true";
}
