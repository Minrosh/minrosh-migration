/**
 * Admin session cookie names. __Host- prefix requires Secure + Path=/ + no Domain.
 */

export const ADMIN_SESSION_COOKIE_FALLBACK = "admin_session";
export const ADMIN_SESSION_COOKIE_HOST = "__Host-admin_session";

export function adminSessionCookieName(secure) {
  return secure ? ADMIN_SESSION_COOKIE_HOST : ADMIN_SESSION_COOKIE_FALLBACK;
}

/** Read value from Next.js cookies() jar (sync .get). */
export function getAdminSessionValueFromJar(jar) {
  const a = jar.get(ADMIN_SESSION_COOKIE_HOST)?.value;
  if (a) return a;
  return jar.get(ADMIN_SESSION_COOKIE_FALLBACK)?.value || "";
}

/** Read from RequestCookies (middleware / Request). */
export function getAdminSessionValueFromRequestCookies(cookieStore) {
  const a = cookieStore.get(ADMIN_SESSION_COOKIE_HOST)?.value;
  if (a) return a;
  return cookieStore.get(ADMIN_SESSION_COOKIE_FALLBACK)?.value || "";
}

export function clearAdminSessionCookies(jar) {
  jar.delete(ADMIN_SESSION_COOKIE_HOST);
  jar.delete(ADMIN_SESSION_COOKIE_FALLBACK);
}
