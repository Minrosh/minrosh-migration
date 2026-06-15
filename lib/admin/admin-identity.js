import { cookies } from "next/headers";
import { getAdminSessionValueFromJar } from "./session-cookie";
import { getSessionMetaFromSignedCookieValue } from "./session";
import { getAdminRole } from "./permissions";
import { getLocalAdminDevBypassActor, isLocalAdminDevBypass } from "./dev-bypass";

/**
 * @returns {Promise<{ email: string | null, role: string, userId: string | null } | null>}
 */
export async function getAdminActorFromCookies() {
  if (await isLocalAdminDevBypass()) {
    return getLocalAdminDevBypassActor();
  }
  const jar = await cookies();
  const val = getAdminSessionValueFromJar(jar);
  const meta = await getSessionMetaFromSignedCookieValue(val);
  return meta;
}

/** Effective role for RBAC: session role when present, else env ADMIN_ROLE. */
export async function getEffectiveAdminRole() {
  const actor = await getAdminActorFromCookies();
  if (actor?.role) return actor.role;
  return getAdminRole();
}
