import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { readAudit } from "@/lib/admin/json-store";
import { apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const { searchParams } = new URL(request.url);
  const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit")) || 200));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const log = readAudit();
  const entries = Array.isArray(log.entries) ? log.entries : [];
  const total = entries.length;
  return apiOk({
    entries: entries.slice(offset, offset + limit),
    total,
    limit,
    offset,
  }, context);
}
