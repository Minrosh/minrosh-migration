import { adminJsonUnauthorized, verifyAdminRequest } from "@/lib/admin/auth-route";
import { readAdminAlerts } from "@/lib/intelligence/store";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const store = readAdminAlerts();
  return Response.json({ alerts: Array.isArray(store.alerts) ? store.alerts : [] });
}
