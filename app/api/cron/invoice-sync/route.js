import { runAccountingSync } from "@/lib/invoice/accounting-sync-service";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { runWithCronTelemetry } from "@/lib/observability/cron-telemetry";
import { obsLogger } from "@/lib/observability/logger";

function authorized(request) {
  const expected = String(process.env.INVOICE_SYNC_CRON_SECRET || "").trim();
  if (!expected) return false;
  const got = String(request.headers.get("x-cron-secret") || new URL(request.url).searchParams.get("secret") || "").trim();
  return got && got === expected;
}

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!authorized(request)) {
    return apiFail({ code: API_ERROR_CODES.AUTH_UNAUTHORIZED, message: "Unauthorized", status: 401 }, context);
  }
  const provider = new URL(request.url).searchParams.get("provider") || "xero";
  try {
    const runResult = await runWithCronTelemetry({
      requestId: context.requestId,
      jobName: "invoice-sync",
      run: async ({ jobRunId }) => {
        const payload = runAccountingSync(provider);
        return {
          summary: {
            ok: Boolean(payload?.ok ?? true),
            provider: String(provider),
          },
          payload: { ...payload, provider, jobRunId },
        };
      },
    });
    return apiOk(runResult.result.payload, context);
  } catch (error) {
    obsLogger.error("cron_invoice_sync_failed", { requestId: context.requestId, route: "GET /api/cron/invoice-sync", provider, error });
    return apiFail({ code: API_ERROR_CODES.INTERNAL_ERROR, message: "Invoice sync failed.", status: 500 }, context);
  }
}

export async function POST(request) {
  return GET(request);
}
