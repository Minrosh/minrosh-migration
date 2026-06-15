/**
 * Local development admin bypass — must match middleware.js behaviour.
 * Middleware can skip the login redirect on localhost; API route handlers must
 * honour the same rule or the admin UI loads while every fetch returns 401.
 */

/**
 * @param {string | null | undefined} host — request Host header (e.g. "localhost:3100")
 */
export function isLocalAdminDevBypassFromHost(host) {
  if (process.env.NODE_ENV === "production") return false;
  const h = String(host || "").trim();
  const isLocalhost = h.startsWith("localhost:") || h.startsWith("127.0.0.1:");
  const forced =
    String(process.env.ADMIN_BYPASS_LOCAL || "").toLowerCase() === "true" ||
    String(process.env.ADMIN_LOCAL_BYPASS || "").toLowerCase() === "true";
  return isLocalhost || forced;
}

/**
 * Resolve bypass in Node route handlers (uses request Host when available).
 * @param {Request | { headers?: Headers } | null | undefined} [request]
 */
export async function isLocalAdminDevBypass(request) {
  if (process.env.NODE_ENV === "production") return false;

  const hostFromRequest = request?.headers?.get?.("host");
  if (hostFromRequest) {
    return isLocalAdminDevBypassFromHost(hostFromRequest);
  }

  if (String(process.env.ADMIN_BYPASS_LOCAL || "").toLowerCase() === "true") {
    return true;
  }
  if (String(process.env.ADMIN_LOCAL_BYPASS || "").toLowerCase() === "true") {
    return true;
  }

  try {
    const { headers } = await import("next/headers");
    const host = (await headers()).get("host") || "";
    return isLocalAdminDevBypassFromHost(host);
  } catch {
    return false;
  }
}

/** Synthetic super actor when local bypass is active (read/write in dev only). */
export function getLocalAdminDevBypassActor() {
  return { email: null, role: "super", userId: null };
}
