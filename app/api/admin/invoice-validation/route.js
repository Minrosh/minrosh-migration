import { adminJsonUnauthorized, requireAdminWrite, verifyAdminRequest } from "@/lib/admin/auth-route";
import { validateInvoiceThreeWay } from "@/lib/invoice/validation-service";

export async function POST(request) {
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const result = validateInvoiceThreeWay(body || {});
  if (!result.ok) return Response.json(result, { status: 400 });
  return Response.json(result);
}

export async function GET(request) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const url = new URL(request.url);
  const invoiceId = url.searchParams.get("invoiceId") || "";
  const poId = url.searchParams.get("poId") || "";
  const grnId = url.searchParams.get("grnId") || "";
  if (!invoiceId || !poId || !grnId) {
    return Response.json({ error: "invoiceId, poId, grnId required" }, { status: 400 });
  }
  const result = validateInvoiceThreeWay({ invoiceId, poId, grnId });
  if (!result.ok) return Response.json(result, { status: 400 });
  return Response.json(result);
}
