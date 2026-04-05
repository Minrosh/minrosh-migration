import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { toCustomerListRow } from "@/lib/admin/customer-dto";
import { readCustomers } from "@/lib/admin/json-store";
import { deleteCustomerUploadFolder } from "@/lib/admin/uploads-storage";
import {
  addCustomer,
  deleteCustomer,
  findCustomerById,
  regenerateMagicLink,
  updateCustomer,
} from "@/lib/admin/customers-service";
import { getClientIp } from "@/lib/security/request-ip";

export async function GET(request) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const { searchParams } = new URL(request.url);
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

  if (action === "regenerateToken") {
    const row = regenerateMagicLink(body.id);
    if (!row) return Response.json({ error: "Not found" }, { status: 404 });
    appendAudit("customer_magic_regenerate", row.id, { ip, route: "POST /api/admin/customers regenerateToken" });
    return Response.json({ customer: row });
  }

  const row = addCustomer({
    name: body.name,
    email: body.email,
    status: body.status,
  });
  appendAudit("customer_create", row.id, { ip, route: "POST /api/admin/customers" });
  return Response.json({ customer: toCustomerListRow(row) });
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
  const allowed = new Set(["name", "email", "status", "notes", "mobile"]);
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
    }
  }
  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }
  const row = updateCustomer(id, patch);
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
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
