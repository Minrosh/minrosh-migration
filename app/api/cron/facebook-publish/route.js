import { appendAudit } from "@/lib/admin/audit";
import { readFacebookPostsStore, publishFacebookPost, markFacebookPostResult } from "@/lib/intelligence/facebook";
import { pushAdminAlert } from "@/lib/intelligence/store";
import { isFacebookPublishInngestEnabled } from "@/lib/inngest/config";
import { inngest } from "@/lib/inngest/client";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { runWithCronTelemetry } from "@/lib/observability/cron-telemetry";
import { obsLogger } from "@/lib/observability/logger";

function cronSecretFromRequest(request) {
  const header = String(request.headers.get("x-cron-secret") || "").trim();
  if (header) return header;
  const auth = String(request.headers.get("authorization") || "").trim();
  const m = /^Bearer\s+(\S+)/i.exec(auth);
  return m ? m[1].trim() : "";
}

function isAuthorized(request) {
  const got = cronSecretFromRequest(request);
  if (!got) return false;
  if (process.env.NODE_ENV === "production" && got.length < 16) return false;
  const vercelCron = String(process.env.CRON_SECRET || "").trim();
  const facebookCron = String(process.env.FACEBOOK_CRON_SECRET || "").trim();
  if (vercelCron && got === vercelCron) return true;
  if (facebookCron && got === facebookCron) return true;
  return false;
}

async function runFacebookPublishCron(request) {
  const context = requestContextFromRequest(request);
  if (!isAuthorized(request)) {
    return apiFail({ code: API_ERROR_CODES.AUTH_UNAUTHORIZED, message: "Unauthorized", status: 401 }, context);
  }
  try {
    const runResult = await runWithCronTelemetry({
      requestId: context.requestId,
      jobName: "facebook-publish",
      run: async ({ jobRunId }) => {
        const store = readFacebookPostsStore();
        const now = Date.now();
        const queue = (Array.isArray(store.posts) ? store.posts : []).filter((item) => {
          const statusEligible = item.status === "ready_auto_publish" || item.status === "publish_failed";
          if (!statusEligible) return false;
          if (!item.nextAttemptAt) return true;
          return new Date(item.nextAttemptAt).getTime() <= now;
        });
        const results = [];
        const routeLabel = `/api/cron/facebook-publish (${request.method})`;
        const batch = queue.slice(0, 15);

        if (isFacebookPublishInngestEnabled()) {
          await inngest.send(
            batch.map((post) => ({
              name: "minrosh/facebook.publish.post",
              data: { postId: post.id },
            }))
          );
          for (const post of batch) results.push({ id: post.id, ok: true, queued: true, mode: "inngest" });
          appendAudit("facebook_publish_cron_queued", "inngest", {
            route: routeLabel,
            requestId: context.requestId,
            meta: { count: batch.length, jobRunId },
          });
          return {
            summary: { mode: "inngest", queued: queue.length, processed: results.length, errors: 0 },
            payload: { mode: "inngest", queued: queue.length, processed: results.length, results, jobRunId },
          };
        }

        for (const post of batch) {
          const result = await publishFacebookPost(post);
          const saved = markFacebookPostResult(post.id, result);
          results.push({ id: post.id, ok: result.ok, error: result.error || null, remoteId: result.remoteId || null });
          if (!result.ok) {
            pushAdminAlert({
              type: "facebook_publish_failed",
              title: "Facebook publish failed",
              message: `Post ${post.id} failed: ${result.error || "unknown error"}`,
              href: "/admin/intelligence",
            });
          }
          appendAudit(result.ok ? "facebook_post_published" : "facebook_post_failed", post.id, {
            route: routeLabel,
            requestId: context.requestId,
            meta: {
              ok: result.ok,
              remoteId: result.remoteId || "",
              error: result.error || "",
              instagramMediaId: result.instagramMediaId || "",
              instagramError: result.instagramError || "",
              jobRunId,
            },
          });
          if (!saved) {
            pushAdminAlert({
              type: "facebook_publish_warning",
              title: "Facebook publish state warning",
              message: `Could not persist publish result for ${post.id}.`,
              href: "/admin/intelligence",
            });
          }
        }
        return {
          summary: {
            mode: "inline",
            queued: queue.length,
            processed: results.length,
            errors: results.filter((r) => !r.ok).length,
          },
          payload: { mode: "inline", queued: queue.length, processed: results.length, results, jobRunId },
        };
      },
    });
    return apiOk(runResult.result.payload, context);
  } catch (error) {
    obsLogger.error("cron_facebook_publish_failed", { requestId: context.requestId, route: `/api/cron/facebook-publish (${request.method})`, error });
    return apiFail({ code: API_ERROR_CODES.UPSTREAM_ERROR, message: "Facebook publish run failed.", status: 502 }, context);
  }
}

export async function GET(request) {
  return runFacebookPublishCron(request);
}

export async function POST(request) {
  return runFacebookPublishCron(request);
}
