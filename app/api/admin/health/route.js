import { verifyAdminRequest } from "@/lib/admin/auth-route";
import { getAdminHealthSnapshot } from "@/lib/admin/setup-status";
import { apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  const production = process.env.NODE_ENV === "production";
  const authed = await verifyAdminRequest(request);
  const snapshot = await getAdminHealthSnapshot(request);

  if (!authed) {
    return apiOk(
      {
        ok: snapshot.adminAuthConfigured,
        adminAuthConfigured: snapshot.adminAuthConfigured,
        environment: snapshot.environment,
        setupMessage: snapshot.adminAuthConfigured
          ? undefined
          : "Admin authentication is not configured. Please set ADMIN_SESSION_SECRET (24+ chars) and ADMIN_PASSWORD.",
      },
      context
    );
  }

  if (production) {
    return apiOk(
      {
        ok: snapshot.ok,
        adminAuthConfigured: snapshot.adminAuthConfigured,
        sessionCookiePresent: snapshot.sessionCookiePresent,
        environment: snapshot.environment,
      },
      context
    );
  }

  return apiOk(snapshot, context);
}
