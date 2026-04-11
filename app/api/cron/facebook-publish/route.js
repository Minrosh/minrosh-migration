import { appendAudit } from "@/lib/admin/audit";
import { readFacebookPostsStore, publishFacebookPost, markFacebookPostResult } from "@/lib/intelligence/facebook";
import { pushAdminAlert } from "@/lib/intelligence/store";

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
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  for (const post of queue.slice(0, 15)) {
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
      meta: {
        ok: result.ok,
        remoteId: result.remoteId || "",
        error: result.error || "",
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

  return Response.json({
    ok: true,
    queued: queue.length,
    processed: results.length,
    results,
  });
}

export async function GET(request) {
  return runFacebookPublishCron(request);
}

export async function POST(request) {
  return runFacebookPublishCron(request);
}
