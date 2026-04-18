import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { readEnquiriesList } from "@/lib/admin/enquiries-read";
import { readCustomers } from "@/lib/admin/json-store";
import { listInvoices } from "@/lib/admin/invoices-service";
import { readAdminSuccessStories, readAudit } from "@/lib/admin/json-store";
import { getLeadSheetSummary } from "@/lib/google-sheets-crm";
import { apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const { customers = [] } = readCustomers();
  const { stories = [] } = readAdminSuccessStories();
  const { entries = [] } = readAudit();
  let sheetSummary = { ok: false };
  try {
    sheetSummary = await getLeadSheetSummary();
  } catch {
    sheetSummary = { ok: false };
  }
  return apiOk({
    enquiries: readEnquiriesList().length,
    customers: customers.length,
    prospective: customers.filter((c) => c.status === "prospective").length,
    invoices: listInvoices().length,
    pendingInvoices: listInvoices().filter((i) => i.status === "pending").length,
    successStories: stories.length,
    auditEntries: entries.length,
    leadSheet: sheetSummary,
  }, context);
}
