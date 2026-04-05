import { cookies } from "next/headers";
import { revokeAdminSessionToken } from "@/lib/admin/session-store";
import { extractAdminSessionTokenFromCookie } from "@/lib/admin/session-signed-cookie";
import { checkAdminMutationOrigin } from "@/lib/security/admin-origin";
import { clearAdminSessionCookies, getAdminSessionValueFromJar } from "@/lib/admin/session-cookie";

export async function POST(request) {
  const o = checkAdminMutationOrigin(request);
  if (!o.ok) return Response.json({ error: o.error }, { status: 403 });

  const jar = await cookies();
  const cookieVal = getAdminSessionValueFromJar(jar);
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
  const token = cookieVal ? await extractAdminSessionTokenFromCookie(cookieVal, secret) : null;
  if (token) {
    revokeAdminSessionToken(token);
  }
  clearAdminSessionCookies(jar);
  return Response.json({ ok: true });
}
