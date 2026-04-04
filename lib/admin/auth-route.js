import { cookies } from "next/headers";
import { checkAdminMutationOrigin } from "@/lib/security/admin-origin";
import { isValidSessionToken } from "./session";

export async function verifyAdminRequest() {
  const jar = await cookies();
  const token = jar.get("admin_session")?.value;
  return isValidSessionToken(token);
}

export function adminJsonUnauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * Session cookie + same-site Origin/Referer (production). Use for POST/PATCH/DELETE and sensitive POSTs.
 * @param {Request} request
 * @returns {Promise<Response | null>} Response to return early, or null if OK
 */
export async function requireAdminWrite(request) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const origin = checkAdminMutationOrigin(request);
  if (!origin.ok) {
    return Response.json({ error: origin.error }, { status: 403 });
  }
  return null;
}

/**
 * Origin/Referer only (e.g. login before a session exists).
 * @param {Request} request
 * @returns {Response | null}
 */
export function requireAdminLoginOrigin(request) {
  const origin = checkAdminMutationOrigin(request);
  if (!origin.ok) {
    return Response.json({ error: origin.error }, { status: 403 });
  }
  return null;
}
