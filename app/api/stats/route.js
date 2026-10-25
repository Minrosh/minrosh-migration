import { verifyAdminRequest } from "@/lib/admin/auth-route";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import { getFooterStats } from "../../../lib/site-stats";
import { rateLimitAllow } from "../../../lib/security/rate-limit";
import { getClientIp } from "../../../lib/security/request-ip";

const PRIVATE_CACHE = { "Cache-Control": "private, no-store" };

/**
 * Enquiry, newsletter, and news-store counts are operational telemetry.
 * The public footer no longer renders them. Anonymous callers receive no counts.
 * A signed-in admin session may read them. Dashboard reporting stays on /api/admin/stats.
 */
export async function GET(request) {
  const context = requestContextFromRequest(request);
  const ip = getClientIp(request);
  if (!rateLimitAllow(`public-stats:${ip}`, { windowMs: 60 * 1000, max: 120 })) {
    return apiFail(
      { code: API_ERROR_CODES.RATE_LIMITED, message: "Too many requests.", status: 429 },
      context,
      { headers: PRIVATE_CACHE }
    );
  }

  if (!(await verifyAdminRequest(request))) {
    return apiFail(
      { code: API_ERROR_CODES.AUTH_UNAUTHORIZED, message: "Unauthorized", status: 401 },
      context,
      { headers: PRIVATE_CACHE }
    );
  }

  return apiOk(getFooterStats(), context, { headers: PRIVATE_CACHE });
}
