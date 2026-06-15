import { hasAdminPasswordConfigured, hasAdminSessionSigningSecret } from "./admin-auth";
import { isLocalAdminDevBypass } from "./dev-bypass";

/**
 * Safe admin auth readiness checks (no secrets exposed).
 */
export function getAdminSetupStatus() {
  const sessionSecret = String(process.env.ADMIN_SESSION_SECRET || "").trim();
  return {
    adminAuthConfigured: hasAdminPasswordConfigured() && hasAdminSessionSigningSecret(),
    hasPassword: hasAdminPasswordConfigured(),
    hasSessionSecret: hasAdminSessionSigningSecret(),
    sessionSecretLength: sessionSecret.length,
    sessionSecretMinLength: 24,
    sessionSecretOk: sessionSecret.length >= 24,
  };
}

/**
 * @param {Request | { headers?: Headers } | null | undefined} [request]
 */
export async function getAdminHealthSnapshot(request) {
  const setup = getAdminSetupStatus();
  const devBypass = await isLocalAdminDevBypass(request);
  let sessionCookiePresent = false;
  try {
    const { cookies } = await import("next/headers");
    const { getAdminSessionValueFromJar } = await import("./session-cookie");
    const jar = await cookies();
    sessionCookiePresent = Boolean(getAdminSessionValueFromJar(jar));
  } catch {
    sessionCookiePresent = false;
  }

  return {
    ok: setup.adminAuthConfigured,
    adminAuthConfigured: setup.adminAuthConfigured,
    devBypass,
    sessionCookiePresent,
    environment: process.env.NODE_ENV === "production" ? "production" : "development",
    setup,
    adminRoutesAvailable: [
      "/api/admin/stats",
      "/api/admin/enquiries",
      "/api/admin/audit",
      "/api/admin/leads",
      "/api/admin/me",
      "/api/admin/login",
    ],
  };
}
