import { getFooterStats } from "../../../lib/site-stats";
import { rateLimitAllow } from "../../../lib/security/rate-limit";
import { getClientIp } from "../../../lib/security/request-ip";

export async function GET(request) {
  const ip = getClientIp(request);
  if (!rateLimitAllow(`public-stats:${ip}`, { windowMs: 60 * 1000, max: 120 })) {
    return Response.json({ error: "Too many requests." }, { status: 429 });
  }

  const stats = getFooterStats();
  return Response.json({
    ok: true,
    ...stats,
  });
}
