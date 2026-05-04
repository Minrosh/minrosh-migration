import { getRequestIdFromHeaders, REQUEST_ID_HEADER } from "@/lib/observability/request-id";

export const API_ERROR_CODES = {
  AUTH_UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  AUTH_FORBIDDEN: "AUTH_FORBIDDEN",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  UPSTREAM_ERROR: "UPSTREAM_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  /** Transactional site email could not be sent (timeout or SMTP error), e.g. contact or quiz notification. */
  MAIL_DELIVERY_FAILED: "MAIL_DELIVERY_FAILED",
};

export function requestContextFromRequest(request) {
  const requestId = getRequestIdFromHeaders(request?.headers);
  return { requestId };
}

function withRequestId(response, requestId) {
  if (requestId) response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}

export function apiOk(data = {}, context = {}, init = {}) {
  const payload = {
    ok: true,
    requestId: context.requestId || "",
    data,
  };
  return withRequestId(Response.json(payload, init), context.requestId);
}

export function apiFail(error, context = {}, init = {}) {
  const payload = {
    ok: false,
    requestId: context.requestId || "",
    error: {
      code: String(error?.code || API_ERROR_CODES.INTERNAL_ERROR),
      message: String(error?.message || "Something went wrong."),
      ...(error?.details ? { details: error.details } : {}),
    },
  };
  const status = Number(error?.status || init.status || 500);
  return withRequestId(Response.json(payload, { ...init, status }), context.requestId);
}
