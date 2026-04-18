import { requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { API_ERROR_CODES, apiFail, requestContextFromRequest } from "@/lib/api/response";
import { generateVisaNewsPng } from "@/lib/social/visa-news-image";
import { getClientIp } from "@/lib/security/request-ip";

export const dynamic = "force-dynamic";

/** POST JSON { headline, country?, summary? } → PNG (1080×1350) for admin preview. */
export async function POST(request) {
  const context = requestContextFromRequest(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }
  const headline = String(body.headline || "").trim() || "Visa update";
  const country = body.country;
  const summary = String(body.summary || "").trim();
  appendAudit(AUDIT_ACTIONS.INTEL_SOCIAL_POSTER_PREVIEW_GENERATE, headline.slice(0, 120), {
    ip: getClientIp(request),
    route: "POST /api/admin/intelligence/social-poster-preview",
    requestId: context.requestId,
    meta: {
      country: String(country || ""),
      summaryLength: summary.length,
    },
  });
  try {
    const png = await generateVisaNewsPng({ headline, country, summary });
    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return apiFail({ code: API_ERROR_CODES.INTERNAL_ERROR, message: e?.message || "Render failed", status: 500 }, context);
  }
}
