/**
 * Admin API: credential rotation checklist status only.
 * Never accepts or returns secret values — only status metadata.
 */

import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { getClientIp } from "@/lib/security/request-ip";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";
import fs from "node:fs";
import path from "node:path";

const CHECKLIST_PATH = path.join(process.cwd(), "data", "admin-credential-rotation-checklist.json");
const ALLOWED_STATUS = new Set(["pending", "rotated", "verified", "n_a"]);

function readChecklist() {
  const raw = fs.readFileSync(CHECKLIST_PATH, "utf8");
  return JSON.parse(raw);
}

function writeChecklist(data) {
  const tmp = `${CHECKLIST_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  fs.renameSync(tmp, CHECKLIST_PATH);
}

/** Strip any accidental secret-looking fields before response. */
function publicChecklistView(data) {
  return {
    title: data.title,
    updatedAt: data.updatedAt,
    instructions: data.instructions,
    items: (data.items || []).map((item) => ({
      id: item.id,
      label: item.label,
      envNames: item.envNames,
      status: item.status,
      confirmedBy: item.confirmedBy || "",
      confirmedAt: item.confirmedAt || "",
      notes: item.notes || "",
    })),
  };
}

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  try {
    return apiOk({ checklist: publicChecklistView(readChecklist()) }, context);
  } catch (err) {
    return apiFail(
      { code: API_ERROR_CODES.INTERNAL_ERROR, message: err?.message || "Failed to read checklist", status: 500 },
      context
    );
  }
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

  const id = String(body.id || "").trim();
  const status = String(body.status || "").trim().toLowerCase();
  if (!id || !ALLOWED_STATUS.has(status)) {
    return apiFail(
      {
        code: API_ERROR_CODES.VALIDATION_FAILED,
        message: "id and status (pending|rotated|verified|n_a) required",
        status: 400,
      },
      context
    );
  }

  // Reject any attempt to store secret material via this endpoint.
  for (const key of Object.keys(body || {})) {
    if (/pass|secret|key|token|private/i.test(key) && !["status", "notes", "confirmedBy", "confirmedAt", "id"].includes(key)) {
      return apiFail(
        {
          code: API_ERROR_CODES.VALIDATION_FAILED,
          message: "This checklist never stores secret values",
          status: 400,
        },
        context
      );
    }
  }

  try {
    const data = readChecklist();
    const idx = (data.items || []).findIndex((row) => row.id === id);
    if (idx < 0) {
      return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Checklist item not found", status: 404 }, context);
    }
    const notes = body.notes !== undefined ? String(body.notes || "").slice(0, 500) : data.items[idx].notes;
    if (/\b(BEGIN PRIVATE KEY|sk_live|AIza|xox[baprs]-)\b/i.test(notes)) {
      return apiFail(
        {
          code: API_ERROR_CODES.VALIDATION_FAILED,
          message: "Notes must not contain secret material",
          status: 400,
        },
        context
      );
    }
    data.items[idx] = {
      ...data.items[idx],
      status,
      notes,
      confirmedBy: String(body.confirmedBy || data.items[idx].confirmedBy || "").slice(0, 120),
      confirmedAt: body.confirmedAt || new Date().toISOString(),
    };
    data.updatedAt = new Date().toISOString().slice(0, 10);
    writeChecklist(data);
    appendAudit("credential_rotation_checklist_update", id, {
      ip: getClientIp(request),
      route: "PATCH /api/admin/credential-rotation-checklist",
      requestId: context.requestId,
      meta: { status, confirmedBy: data.items[idx].confirmedBy },
    });
    return apiOk({ checklist: publicChecklistView(data) }, context);
  } catch (err) {
    return apiFail(
      { code: API_ERROR_CODES.INTERNAL_ERROR, message: err?.message || "Failed to update checklist", status: 500 },
      context
    );
  }
}
