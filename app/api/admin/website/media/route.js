import fs from "node:fs";
import path from "node:path";
import { verifyAdminRequest, adminJsonUnauthorized, requireWebsiteWrite } from "@/lib/admin/auth-route";
import { getAdminActorFromCookies } from "@/lib/admin/admin-identity";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { getClientIp } from "@/lib/security/request-ip";
import { addWebsiteMediaItem, listMediaItems } from "@/lib/website/media-store";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  const listed = listMediaItems();
  if (!listed.ok) {
    return apiFail(
      { code: API_ERROR_CODES.INTERNAL_ERROR, message: listed.error || "Could not read media", status: 500 },
      context
    );
  }
  return apiOk({ items: listed.items }, context);
}

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const denied = await requireWebsiteWrite(request);
  if (denied) return denied;

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid form data", status: 400 }, context);
  }

  const file = formData.get("file");
  const alt = String(formData.get("alt") || "").trim();
  if (!file || typeof file === "string") {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "file required", status: 400 }, context);
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const actor = await getAdminActorFromCookies();
    const item = addWebsiteMediaItem({
      buffer,
      originalName: file.name || "upload",
      alt,
      uploadedBy: actor?.email || actor?.role || "admin",
    });
    appendAudit(AUDIT_ACTIONS.WEBSITE_MEDIA_UPLOAD, item.id, {
      ip: getClientIp(request),
      route: "POST /api/admin/website/media",
      requestId: context.requestId,
    });
    return apiOk({ item }, context);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message, status: 400 }, context);
  }
}
