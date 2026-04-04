import { requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import {
  hasAdminPasswordConfigured,
  setAdminPassword,
  verifyAdminPassword,
} from "@/lib/admin/admin-auth";

export async function POST(request) {
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const currentPassword = String(body?.currentPassword || "");
  const newPassword = String(body?.newPassword || "");

  if (!hasAdminPasswordConfigured()) {
    return Response.json({ error: "Admin password not configured" }, { status: 503 });
  }
  if (!verifyAdminPassword(currentPassword)) {
    return Response.json({ error: "Current password is incorrect" }, { status: 401 });
  }
  if (newPassword.length < 8) {
    return Response.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }
  if (newPassword === currentPassword) {
    return Response.json(
      { error: "New password must be different from current password" },
      { status: 400 }
    );
  }

  setAdminPassword(newPassword);
  appendAudit("admin_password_change", "Password updated from admin panel");
  return Response.json({
    ok: true,
    note: "Password updated. Remove ADMIN_PASSWORD from .env to use this managed password.",
  });
}
