import { verifyAdminRequest, adminJsonUnauthorized } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { readCustomers } from "@/lib/admin/json-store";
import {
  addCustomer,
  deleteCustomer,
  regenerateMagicLink,
  updateCustomer,
} from "@/lib/admin/customers-service";

export async function GET() {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  return Response.json(readCustomers());
}

export async function POST(request) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const action = body?.action;

  if (action === "regenerateToken") {
    const row = regenerateMagicLink(body.id);
    if (!row) return Response.json({ error: "Not found" }, { status: 404 });
    appendAudit("customer_magic_regenerate", row.id);
    return Response.json({ customer: row });
  }

  const row = addCustomer({
    name: body.name,
    email: body.email,
    status: body.status,
  });
  appendAudit("customer_create", row.id);
  return Response.json({ customer: row });
}

export async function PATCH(request) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { id, ...rest } = body;
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  const allowed = new Set(["name", "email", "status", "notes"]);
  const patch = {};
  for (const key of allowed) {
    if (rest[key] === undefined) continue;
    if (key === "name" || key === "email" || key === "notes") {
      patch[key] = String(rest[key]).trim();
    } else if (key === "status") {
      patch[key] = rest[key];
    }
  }
  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }
  const row = updateCustomer(id, patch);
  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  appendAudit("customer_update", id);
  return Response.json({ customer: row });
}

export async function DELETE(request) {
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  deleteCustomer(id);
  appendAudit("customer_delete", id);
  return Response.json({ ok: true });
}
