import { verifyAdminRequest, adminJsonUnauthorized, requireAdminWrite } from "@/lib/admin/auth-route";
import { appendAudit } from "@/lib/admin/audit";
import { AUDIT_ACTIONS } from "@/lib/admin/audit-actions";
import { getClientIp } from "@/lib/security/request-ip";
import {
  readNewsList,
  writeNewsList,
  withNewsMutation,
  makeUniqueNewsSlug,
  newNewsItemId,
  NEWS_PUBLIC_BASE,
} from "@/lib/news-store";
import { revalidateNewsArticlePath, revalidateNewsBoardPaths } from "@/lib/news-data";
import { API_ERROR_CODES, apiFail, apiOk, requestContextFromRequest } from "@/lib/api/response";

function isValidHttpUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(request) {
  const context = requestContextFromRequest(request);
  if (!(await verifyAdminRequest())) return adminJsonUnauthorized(request);
  return apiOk({ items: readNewsList() }, context);
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

  const title = String(body.title || "").trim();
  const summary = String(body.summary || "").trim();
  if (!title || !summary) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "title and summary are required", status: 400 }, context);
  }

  const country = String(body.country || "Australia").trim();
  const source = String(body.source || "Official source").trim();
  const sourceUrl = String(body.sourceUrl || "").trim();
  if (sourceUrl && !isValidHttpUrl(sourceUrl)) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "sourceUrl must be a valid http(s) URL", status: 400 }, context);
  }

  const bodyText = String(body.body || "").trim() || summary;
  const date = String(body.date || "").trim() || new Date().toISOString().slice(0, 10);
  let requestedSlug = String(body.slug || "").trim();

  const row = withNewsMutation(() => {
    const entries = readNewsList();
    const used = new Set(entries.map((e) => String(e.slug || "").trim()).filter(Boolean));
    let slug = requestedSlug;
    if (!slug) slug = makeUniqueNewsSlug(title, used);
    else if (used.has(slug)) slug = makeUniqueNewsSlug(`${title}-${slug}`, used);

    const item = {
      id: newNewsItemId(),
      slug,
      date,
      country,
      source,
      sourceUrl,
      href: `${NEWS_PUBLIC_BASE}/${slug}`,
      title,
      summary,
      body: bodyText,
    };
    writeNewsList([item, ...entries].slice(0, 300));
    return item;
  });

  revalidateNewsBoardPaths();
  revalidateNewsArticlePath(row.slug);
  appendAudit(AUDIT_ACTIONS.NEWS_CREATE, row.id, {
    ip: getClientIp(request),
    route: "POST /api/admin/news",
    requestId: context.requestId,
    meta: { slug: row.slug, title: row.title },
  });
  return apiOk({ item: row, items: readNewsList() }, context);
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
  if (!id) return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "id required", status: 400 }, context);

  const sourceUrl = body.sourceUrl !== undefined ? String(body.sourceUrl || "").trim() : undefined;
  if (sourceUrl !== undefined && sourceUrl && !isValidHttpUrl(sourceUrl)) {
    return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "sourceUrl must be a valid http(s) URL", status: 400 }, context);
  }

  const prevSlug = withNewsMutation(() => {
    const entries = readNewsList();
    const idx = entries.findIndex((e) => e.id === id);
    if (idx < 0) return null;
    const prev = entries[idx];
    const next = { ...entries[idx] };
    if (body.title !== undefined) next.title = String(body.title || "").trim() || next.title;
    if (body.summary !== undefined) next.summary = String(body.summary || "").trim() || next.summary;
    if (body.body !== undefined) next.body = String(body.body || "").trim();
    if (body.country !== undefined) next.country = String(body.country || "").trim() || next.country;
    if (body.source !== undefined) next.source = String(body.source || "").trim() || next.source;
    if (body.date !== undefined) next.date = String(body.date || "").trim() || next.date;
    if (sourceUrl !== undefined) next.sourceUrl = sourceUrl;

    if (body.slug !== undefined) {
      const raw = String(body.slug || "").trim();
      const used = new Set(entries.map((e) => String(e.slug || "").trim()).filter(Boolean));
      used.delete(String(prev.slug || "").trim());
      let slug = raw ? makeUniqueNewsSlug(raw, used) : String(prev.slug || "").trim();
      if (!slug) slug = makeUniqueNewsSlug(next.title, used);
      next.slug = slug;
      next.href = `${NEWS_PUBLIC_BASE}/${slug}`;
    }

    entries[idx] = next;
    writeNewsList(entries);
    return String(prev.slug || "").trim();
  });

  if (prevSlug === null) return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "News item not found", status: 404 }, context);

  const updated = readNewsList().find((e) => e.id === id);
  revalidateNewsBoardPaths();
  if (prevSlug && prevSlug !== updated?.slug) revalidateNewsArticlePath(prevSlug);
  if (updated?.slug) revalidateNewsArticlePath(updated.slug);

  appendAudit(AUDIT_ACTIONS.NEWS_UPDATE, id, {
    ip: getClientIp(request),
    route: "PATCH /api/admin/news",
    requestId: context.requestId,
    meta: { slug: updated?.slug },
  });
  return apiOk({ item: updated, items: readNewsList() }, context);
}

export async function DELETE(request) {
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
  if (!id) return apiFail({ code: API_ERROR_CODES.VALIDATION_FAILED, message: "id required", status: 400 }, context);

  const removedSlug = withNewsMutation(() => {
    const entries = readNewsList();
    const victim = entries.find((e) => e.id === id);
    const next = entries.filter((e) => e.id !== id);
    if (next.length === entries.length) return null;
    writeNewsList(next);
    return victim?.slug || null;
  });

  if (removedSlug === null) return apiFail({ code: API_ERROR_CODES.NOT_FOUND, message: "News item not found", status: 404 }, context);

  revalidateNewsBoardPaths();
  revalidateNewsArticlePath(removedSlug);
  appendAudit(AUDIT_ACTIONS.NEWS_DELETE, id, {
    ip: getClientIp(request),
    route: "DELETE /api/admin/news",
    requestId: context.requestId,
    meta: { slug: removedSlug },
  });
  return apiOk({ deleted: true, items: readNewsList() }, context);
}
