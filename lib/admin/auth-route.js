import { cookies } from "next/headers";
import { checkAdminMutationOrigin } from "@/lib/security/admin-origin";
import { getAdminSessionValueFromJar } from "./session-cookie";
import { isValidSessionToken } from "./session";
import { getAdminRole, isSuperRole, roleCanWrite } from "./permissions";
import { websiteCanPublish, websiteCanWrite } from "@/lib/website/permissions";
import { getAdminActorFromCookies } from "./admin-identity";
import { API_ERROR_CODES, apiFail, requestContextFromRequest } from "@/lib/api/response";
import { isLocalAdminDevBypass } from "./dev-bypass";

function devAuthLog(event, detail) {
  if (process.env.NODE_ENV === "production") return;
  console.info("[admin-auth]", event, detail);
}

/**
 * @param {Request | { headers?: Headers } | null | undefined} [request]
 */
export async function verifyAdminRequest(request) {
  const bypass = await isLocalAdminDevBypass(request);
  if (bypass) {
    devAuthLog("verify", { bypass: true, ok: true });
    return true;
  }
  const jar = await cookies();
  const token = getAdminSessionValueFromJar(jar);
  const ok = await isValidSessionToken(token);
  devAuthLog("verify", { bypass: false, hasCookie: Boolean(token), ok });
  return ok;
}

export function adminJsonUnauthorized(request) {
  const context = requestContextFromRequest(request);
  return apiFail({ code: API_ERROR_CODES.AUTH_UNAUTHORIZED, message: "Unauthorized", status: 401 }, context);
}

/**
 * Session cookie + same-site Origin/Referer (production). Use for POST/PATCH/DELETE and sensitive POSTs.
 * @param {Request} request
 * @returns {Promise<Response | null>} Response to return early, or null if OK
 */
export async function requireAdminWrite(request) {
  if (!(await verifyAdminRequest(request))) return adminJsonUnauthorized(request);
  const context = requestContextFromRequest(request);
  const actor = await getAdminActorFromCookies();
  const effectiveRole = actor?.role ? actor.role : getAdminRole();
  if (!roleCanWrite(effectiveRole)) {
    return apiFail(
      { code: API_ERROR_CODES.AUTH_FORBIDDEN, message: "Forbidden (read-only role)", status: 403 },
      context
    );
  }
  const origin = checkAdminMutationOrigin(request);
  if (!origin.ok) {
    return apiFail(
      { code: API_ERROR_CODES.AUTH_FORBIDDEN, message: origin.error, status: 403 },
      context
    );
  }
  return null;
}

/**
 * Website Manager mutations (draft save, media upload).
 * @param {Request} request
 */
export async function requireWebsiteWrite(request) {
  const gate = await requireAdminWrite(request);
  if (gate) return gate;
  const actor = await getAdminActorFromCookies();
  const effectiveRole = actor?.role ? actor.role : getAdminRole();
  if (!websiteCanWrite(effectiveRole)) {
    const context = requestContextFromRequest(request);
    return apiFail(
      { code: API_ERROR_CODES.AUTH_FORBIDDEN, message: "Forbidden (website:write required)", status: 403 },
      context
    );
  }
  return null;
}

/**
 * Website Manager publish / rollback to published.
 * @param {Request} request
 */
export async function requireWebsitePublish(request) {
  const gate = await requireAdminWrite(request);
  if (gate) return gate;
  const actor = await getAdminActorFromCookies();
  const effectiveRole = actor?.role ? actor.role : getAdminRole();
  if (!websiteCanPublish(effectiveRole)) {
    const context = requestContextFromRequest(request);
    return apiFail(
      { code: API_ERROR_CODES.AUTH_FORBIDDEN, message: "Forbidden (website:publish required)", status: 403 },
      context
    );
  }
  return null;
}

/** Mutating routes that only the super account may call (user CRUD). */
export async function requireSuperAdmin(request) {
  const gate = await requireAdminWrite(request);
  if (gate) return gate;
  const actor = await getAdminActorFromCookies();
  if (!actor || !isSuperRole(actor.role)) {
    const context = requestContextFromRequest(request);
    return apiFail(
      { code: API_ERROR_CODES.AUTH_FORBIDDEN, message: "Forbidden (super admin only)", status: 403 },
      context
    );
  }
  return null;
}

/**
 * Origin/Referer only (e.g. login before a session exists).
 * @param {Request} request
 * @returns {Response | null}
 */
export function requireAdminLoginOrigin(request) {
  const context = requestContextFromRequest(request);
  const origin = checkAdminMutationOrigin(request);
  if (!origin.ok) {
    return apiFail(
      { code: API_ERROR_CODES.AUTH_FORBIDDEN, message: origin.error, status: 403 },
      context
    );
  }
  return null;
}
