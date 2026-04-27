import { getFooterStats } from "../../../lib/site-stats";
import { rateLimitAllow } from "../../../lib/security/rate-limit";
import { getClientIp } from "../../../lib/security/request-ip";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  const ip = getClientIp(request);
  if (!rateLimitAllow(`public-stats:${ip}`, { windowMs: 60 * 1000, max: 120 })) {
    return apiFail({ code: API_ERROR_CODES.RATE_LIMITED, message: "Too many requests.", status: 429 }, context);
  }

  const stats = getFooterStats();
  return apiOk(stats, context);
}
