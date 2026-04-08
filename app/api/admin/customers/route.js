import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
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

export async function GET(request) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const { searchParams } = new URL(request.url);
  if (searchParams.get("duplicates") === "1") {
    return Response.json({ pairs: findDuplicateCustomerCandidates() });
  }
  const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit")) || 200));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const { customers } = readCustomers();
  const list = Array.isArray(customers) ? customers : [];
  const total = list.length;
  const slice = list.slice(offset, offset + limit).map((c) => toCustomerListRow(c)).filter(Boolean);
  return Response.json({ customers: slice, total, limit, offset });
}

export async function POST(request) {
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const action = body?.action;
  const ip = getClientIp(request);

  if (action === "merge") {
    const winnerId = String(body.winnerId || "").trim();
    const loserId = String(body.loserId || "").trim();
    if (!winnerId || !loserId) {
      return Response.json({ error: "winnerId and loserId required" }, { status: 400 });
    }
    const result = mergeCustomers(winnerId, loserId);
    if (!result.ok) {
      return Response.json({ error: result.error || "Merge failed" }, { status: 400 });
    }
    appendAudit("customer_merge", winnerId, { ip, route: "POST /api/admin/customers merge" });
    return Response.json({ customer: toCustomerListRow(result.customer) });
  }

  if (action === "regenerateToken") {
    const regen = regenerateMagicLink(body.id);
    if (!regen) return Response.json({ error: "Not found" }, { status: 404 });
    appendAudit("customer_magic_regenerate", regen.customer.id, {
      ip,
      route: "POST /api/admin/customers regenerateToken",
    });
    return Response.json({
      customer: sanitizeCustomerForAdminDetail(regen.customer),
      magicUploadToken: regen.plainToken,
    });
  }

  const { customer: row, plainToken } = addCustomer({
    name: body.name,
    email: body.email,
    status: body.status,
    marketingConsent: body.marketingConsent,
  });
  appendAudit("customer_create", row.id, { ip, route: "POST /api/admin/customers" });
  return Response.json({
    customer: toCustomerListRow(row),
    magicUploadToken: plainToken,
  });
}

export async function PATCH(request) {
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { id, ...rest } = body;
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
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
    }
  }
  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }
  const row = updateCustomer(id, patch);
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
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
  appendAudit("customer_update", id, { ip, route: "PATCH /api/admin/customers" });
  return Response.json({ customer: toCustomerListRow(row) });
}

export async function DELETE(request) {
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  const ip = getClientIp(request);
  const existing = findCustomerById(id);
  if (existing) {
    deleteCustomerUploadFolder(existing);
  }
  deleteCustomer(id);
  appendAudit("customer_delete", id, { ip, route: "DELETE /api/admin/customers" });
  return Response.json({ ok: true });
}
