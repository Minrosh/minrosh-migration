import { runRecurringBilling } from "@/lib/invoice/recurring-service";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { runWithCronTelemetry } from "@/lib/observability/cron-telemetry";
import { obsLogger } from "@/lib/observability/logger";

function authorized(request) {
  const expected = String(process.env.INVOICE_RECURRING_CRON_SECRET || "").trim();
  if (!expected) return false;
  const got = String(request.headers.get("x-cron-secret") || new URL(request.url).searchParams.get("secret") || "").trim();
  return got && got === expected;
}

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!authorized(request)) {
    return apiFail({ code: API_ERROR_CODES.AUTH_UNAUTHORIZED, message: "Unauthorized", status: 401 }, context);
  }
  try {
    const runResult = await runWithCronTelemetry({
      requestId: context.requestId,
      jobName: "invoice-recurring",
      run: async ({ jobRunId }) => {
        const payload = runRecurringBilling(new Date());
        return {
          summary: {
            ok: Boolean(payload?.ok ?? true),
            processed: Number(payload?.processed || 0),
          },
          payload: { ...payload, jobRunId },
        };
      },
    });
    return apiOk(runResult.result.payload, context);
  } catch (error) {
    obsLogger.error("cron_invoice_recurring_failed", { requestId: context.requestId, route: "GET /api/cron/invoice-recurring", error });
    return apiFail({ code: API_ERROR_CODES.INTERNAL_ERROR, message: "Recurring billing failed.", status: 500 }, context);
  }
}

export async function POST(request) {
  return GET(request);
}
