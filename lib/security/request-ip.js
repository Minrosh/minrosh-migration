/**
 * Client IP for rate limiting (honor reverse-proxy headers when present).
 * @param {Request} request
 */
export function getClientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") || "unknown";
}
