import { appendAudit } from "@/lib/admin/audit";
import { runClosedCaseUploadRetention } from "@/lib/admin/upload-retention";
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
  const dedicated = String(process.env.UPLOAD_RETENTION_CRON_SECRET || "").trim();
  if (dedicated && got === dedicated) return true;
  const nurture = String(process.env.NURTURE_CRON_SECRET || "").trim();
  if (nurture && got === nurture) return true;
  const vercel = String(process.env.CRON_SECRET || "").trim();
  return Boolean(vercel && got === vercel);
}

export async function POST(request) {
  const context = requestContextFromRequest(request);
  if (!isAuthorized(request)) {
    return apiFail({ code: API_ERROR_CODES.AUTH_UNAUTHORIZED, message: "Unauthorized", status: 401 }, context);
  }
  try {
    const runResult = await runWithCronTelemetry({
      requestId: context.requestId,
      jobName: "upload-retention",
      run: async ({ jobRunId }) => {
        const result = runClosedCaseUploadRetention();
        appendAudit("upload_retention_run", "cron", {
          route: "POST /api/cron/upload-retention",
          requestId: context.requestId,
          meta: {
            days: result.days,
            purgedCount: result.purgedCustomerIds.length,
            errors: result.errors,
            jobRunId,
          },
        });
        return {
          summary: {
            ok: true,
            purgedCount: Number(result.purgedCustomerIds?.length || 0),
            errorCount: Number(result.errors?.length || 0),
          },
          payload: { ...result, jobRunId },
        };
      },
    });
    return apiOk(runResult.result.payload, context);
  } catch (error) {
    obsLogger.error("cron_upload_retention_failed", { requestId: context.requestId, route: "POST /api/cron/upload-retention", error });
    return apiFail({ code: API_ERROR_CODES.INTERNAL_ERROR, message: "Upload retention run failed.", status: 500 }, context);
  }
}

export async function GET(request) {
  return POST(request);
}
