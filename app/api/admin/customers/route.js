import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { sanitizeCustomerForAdminDetail, toCustomerListRow } from "@/lib/admin/customer-dto";
import { readCustomers } from "@/lib/admin/json-store";
import { deleteCustomerUploadFolder } from "@/lib/admin/uploads-storage";
import {
  addCustomer,
  deleteCustomer,
  findCustomerById,
  findDuplicateCustomerCandidates,
  mergeCustomers,
  regenerateMagicLink,
  updateCustomer,
} from "@/lib/admin/customers-service";
import { getClientIp } from "@/lib/security/request-ip";
import { createVisaExpiryReminder } from "@/lib/google-calendar";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const { searchParams } = new URL(request.url);
  if (searchParams.get("duplicates") === "1") {
    return apiOk({ pairs: findDuplicateCustomerCandidates() }, context);
  }
  const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit")) || 200));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const statusParam = String(searchParams.get("status") || "").trim().toLowerCase();
  const qRaw = String(searchParams.get("q") || searchParams.get("search") || "").trim();
  const q = qRaw.toLowerCase();

  const { customers } = readCustomers();
  let list = Array.isArray(customers) ? [...customers] : [];
  if (["current", "past", "prospective"].includes(statusParam)) {
    list = list.filter((c) => String(c.status || "").toLowerCase() === statusParam);
  }
  if (qRaw) {
    list = list.filter((c) => {
      const name = String(c.name || "").toLowerCase();
      const email = String(c.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }
  const total = list.length;
  const slice = list.slice(offset, offset + limit).map((c) => toCustomerListRow(c)).filter(Boolean);
  return apiOk({ customers: slice, total, limit, offset }, context);
}

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }
  const action = body?.action;
  const ip = getClientIp(request);

  if (action === "merge") {
    const winnerId = String(body.winnerId || "").trim();
    const loserId = String(body.loserId || "").trim();
    if (!winnerId || !loserId) {
      return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "winnerId and loserId required", status: 400 }, context);
    }
    const result = mergeCustomers(winnerId, loserId);
    if (!result.ok) {
      return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: result.error || "Merge failed", status: 400 }, context);
    }
    appendAudit(AUDIT_ACTIONS.CUSTOMER_MERGE, winnerId, { ip, route: "POST /api/admin/customers merge", requestId: context.requestId });
    return apiOk({ customer: toCustomerListRow(result.customer) }, context);
  }

  if (action === "regenerateToken") {
    const regen = regenerateMagicLink(body.id);
    if (!regen) return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Not found", status: 404 }, context);
    appendAudit(AUDIT_ACTIONS.CUSTOMER_MAGIC_REGENERATE, regen.customer.id, {
      ip,
      route: "POST /api/admin/customers regenerateToken",
      requestId: context.requestId,
    });
    return apiOk({
      customer: sanitizeCustomerForAdminDetail(regen.customer),
      magicUploadToken: regen.plainToken,
    }, context);
  }

  const { customer: row, plainToken } = addCustomer({
    name: body.name,
    email: body.email,
    status: body.status,
    marketingConsent: body.marketingConsent,
  });
  appendAudit(AUDIT_ACTIONS.CUSTOMER_CREATE, row.id, { ip, route: "POST /api/admin/customers", requestId: context.requestId });
  return apiOk({
    customer: toCustomerListRow(row),
    magicUploadToken: plainToken,
  }, context);
}

export async function PATCH(request) {
  const context = requestContextFromRequest(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }
  const { id, ...rest } = body;
  if (!id) return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "id required", status: 400 }, context);
  const allowed = new Set([
    "name",
    "email",
    "status",
    "notes",
    "mobile",
    "marketingConsent",
    "visaExpiryDate",
    "company",
    "preferredChannel",
    "addressLine1",
    "addressLine2",
    "city",
    "state",
    "postcode",
    "country",
    "tags",
    "socialProfiles",
    "caseClosedAt",
  ]);
  const patch = {};
  for (const key of allowed) {
    if (rest[key] === undefined) continue;
    if (key === "name" || key === "email" || key === "notes") {
      patch[key] = String(rest[key]).trim();
    } else if (key === "mobile") {
      patch[key] = String(rest[key] || "")
        .trim()
        .slice(0, 32);
    } else if (key === "status") {
      patch[key] = rest[key];
    } else if (key === "marketingConsent") {
      patch[key] = Boolean(rest[key]);
    } else if (key === "visaExpiryDate") {
      patch[key] = String(rest[key] || "").trim().slice(0, 16);
    } else if (key === "company" || key === "preferredChannel") {
      patch[key] = String(rest[key] || "").trim().slice(0, 200);
    } else if (key === "addressLine1" || key === "addressLine2" || key === "city" || key === "state" || key === "postcode" || key === "country") {
      patch[key] = String(rest[key] || "").trim().slice(0, 200);
    } else if (key === "tags") {
      patch[key] = Array.isArray(rest[key]) ? rest[key].map((t) => String(t).trim().slice(0, 40)).filter(Boolean).slice(0, 30) : [];
    } else if (key === "socialProfiles") {
      patch[key] = rest[key] && typeof rest[key] === "object" ? rest[key] : {};
    } else if (key === "caseClosedAt") {
      if (rest[key] === null || rest[key] === "") {
        patch.caseClosedAt = null;
      } else {
        const v = String(rest[key]).trim().slice(0, 40);
        if (!Number.isFinite(Date.parse(v))) {
          return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "caseClosedAt must be a valid ISO date-time string", status: 400 }, context);
        }
        patch.caseClosedAt = v;
      }
    }
  }
  if (Object.keys(patch).length === 0) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "No valid fields to update", status: 400 }, context);
  }
  const row = updateCustomer(id, patch);
  if (!row) return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Not found", status: 404 }, context);
  if (patch.visaExpiryDate && /^\d{4}-\d{2}-\d{2}$/.test(patch.visaExpiryDate)) {
    try {
      await createVisaExpiryReminder({
        customerId: row.id,
        customerName: row.name,
        visaExpiryDate: patch.visaExpiryDate,
      });
    } catch {
      // Deadline sync is best-effort; do not block customer save.
    }
  }
  const ip = getClientIp(request);
  appendAudit(AUDIT_ACTIONS.CUSTOMER_UPDATE, id, { ip, route: "PATCH /api/admin/customers", requestId: context.requestId });
  return apiOk({ customer: toCustomerListRow(row) }, context);
}

export async function DELETE(request) {
  const context = requestContextFromRequest(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "id required", status: 400 }, context);
  const ip = getClientIp(request);
  const existing = findCustomerById(id);
  if (existing) {
    deleteCustomerUploadFolder(existing);
  }
  deleteCustomer(id);
  appendAudit(AUDIT_ACTIONS.CUSTOMER_DELETE, id, { ip, route: "DELETE /api/admin/customers", requestId: context.requestId });
  return apiOk({ deleted: true }, context);
}
