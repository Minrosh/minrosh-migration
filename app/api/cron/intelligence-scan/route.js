import { runIntelligenceScan } from "@/lib/intelligence/scan";
import { sendIntelligenceScanDigestEmail } from "@/lib/intelligence/notifications";
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
  const secret = String(process.env.INTELLIGENCE_CRON_SECRET || "").trim();
  if (!secret) return false;
  if (process.env.NODE_ENV === "production" && secret.length < 16) return false;
  return cronSecretFromRequest(request) === secret;
}

export async function POST(request) {
  const context = requestContextFromRequest(request);
  if (!isAuthorized(request)) {
    return apiFail({ code: API_ERROR_CODES.AUTH_UNAUTHORIZED, message: "Unauthorized", status: 401 }, context);
  }
  try {
    const runResult = await runWithCronTelemetry({
      requestId: context.requestId,
      jobName: "intelligence-scan",
      run: async ({ jobRunId, startedAt }) => {
        const result = await runIntelligenceScan({ actor: "cron" });
        const finishedAt = new Date().toISOString();
        const startedIso = startedAt.toISOString();
        let digest = { sent: false, reason: "skipped" };
        try {
          digest = await sendIntelligenceScanDigestEmail({
            result,
            startedAt: startedIso,
            finishedAt,
          });
        } catch {
          digest = { sent: false, reason: "digest_exception" };
        }
        return {
          summary: {
            ok: Boolean(result?.ok),
            events: Number(result?.events || 0),
            drafts: Number(result?.drafts || 0),
            digestSent: Boolean(digest?.sent),
          },
          payload: {
            ...result,
            startedAt: startedIso,
            finishedAt,
            digestEmail: digest,
            jobRunId,
          },
        };
      },
    });
    return apiOk(runResult.result.payload, context);
  } catch (error) {
    obsLogger.error("cron_intelligence_scan_failed", { requestId: context.requestId, route: "POST /api/cron/intelligence-scan", error });
    return apiFail(
      { code: API_ERROR_CODES.INTERNAL_ERROR, message: "Intelligence scan failed.", status: 500 },
      context
    );
  }
}
