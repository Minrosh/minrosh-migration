import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { readAdminSuccessStories, writeAdminSuccessStories } from "@/lib/admin/json-store";
import { getClientIp } from "@/lib/security/request-ip";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

function normalizeStoryBody(body) {
  return {
    name: String(body?.name || "").trim(),
    location: String(body?.location || "").trim(),
    visa: String(body?.visa || "").trim(),
    quote: String(body?.quote || "").trim(),
    outcome: String(body?.outcome || "").trim(),
    timeline: String(body?.timeline || "").trim(),
  };
}

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  return apiOk(readAdminSuccessStories(), context);
}

export async function POST(request) {
  const context = requestContextFromRequest(request);
  const ip = getClientIp(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }

  if (body?.action === "delete") {
    const data = readAdminSuccessStories();
    const stories = (data.stories || []).filter((_, i) => i !== Number(body.index));
    writeAdminSuccessStories({ stories });
    appendAudit(AUDIT_ACTIONS.SUCCESS_STORY_DELETE, String(body.index), {
      ip,
      route: "POST /api/admin/success-stories",
      requestId: context.requestId,
    });
    return apiOk({ stories }, context);
  }

  const story = normalizeStoryBody(body);
  if (!story.name || !story.quote) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "name and quote required", status: 400 }, context);
  }

  const data = readAdminSuccessStories();
  const stories = [story, ...(data.stories || [])];
  writeAdminSuccessStories({ stories });
  appendAudit(AUDIT_ACTIONS.SUCCESS_STORY_CREATE, story.name, {
    ip,
    route: "POST /api/admin/success-stories",
    requestId: context.requestId,
  });
  return apiOk({ story, stories }, context);
}

export async function PATCH(request) {
  const context = requestContextFromRequest(request);
  const ip = getClientIp(request);
  const denied = await requireAdminWrite(request);
  if (denied) return denied;
  let body;
  try {
    body = await request.json();
  } catch {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Invalid JSON", status: 400 }, context);
  }
  const index = Number(body?.index);
  if (!Number.isInteger(index) || index < 0) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "Valid index required", status: 400 }, context);
  }
  const story = normalizeStoryBody(body);
  if (!story.name || !story.quote) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "name and quote required", status: 400 }, context);
  }
  const data = readAdminSuccessStories();
  const stories = Array.isArray(data.stories) ? [...data.stories] : [];
  if (index >= stories.length) {
    return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "Story not found", status: 404 }, context);
  }
  stories[index] = story;
  writeAdminSuccessStories({ stories });
  appendAudit(AUDIT_ACTIONS.SUCCESS_STORY_UPDATE, `${index}:${story.name}`, {
    ip,
    route: "PATCH /api/admin/success-stories",
    requestId: context.requestId,
  });
  return apiOk({ story, stories }, context);
}
