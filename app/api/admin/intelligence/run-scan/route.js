import { requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { getClientIp } from "@/lib/security/request-ip";
import { runIntelligenceScan } from "@/lib/intelligence/scan";

export async function POST(request) {
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  const result = await runIntelligenceScan({ actor: "admin_manual" });
  appendAudit("intel_scan_manual", `changed=${result.changed}`, {
    ip: getClientIp(request),
    route: "POST /api/admin/intelligence/run-scan",
  });
  return Response.json(result);
}
