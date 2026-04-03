import { cookies } from "next/headers";
import { isValidSessionToken } from "./session";

export async function verifyAdminRequest() {
  const jar = await cookies();
  const token = jar.get("admin_session")?.value;
  return isValidSessionToken(token);
}

export async function adminJsonUnauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
