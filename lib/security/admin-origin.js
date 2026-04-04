/**
 * CSRF-style checks for browser-initiated admin mutations.
 * Validates Origin or Referer host against this deployment and configured site URL.
 *
 * Set ADMIN_ALLOW_NO_ORIGIN=true only for break-glass API/curl (not recommended in production).
 */

/**
 * @param {Request} request
 * @returns {Set<string>}
 */
function allowedHosts(request) {
  const set = new Set();
  const add = (h) => {
    if (h && typeof h === "string") set.add(h.toLowerCase().split(":")[0]);
  };

  try {
    add(new URL(request.url).hostname);
  } catch {
    /* ignore */
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      add(new URL(site).hostname);
    } catch {
      /* ignore */
    }
  }

  const vercel = process.env.VERCEL_URL;
  if (vercel) add(vercel);

  const xf = request.headers.get("x-forwarded-host");
  if (xf) {
    for (const part of xf.split(",")) {
      add(part.trim().split(":")[0]);
    }
  }

  add("localhost");
  add("127.0.0.1");

  return set;
}

/**
 * @param {string} host
 * @param {Set<string>} allowed
 */
function hostIsAllowed(host, allowed) {
  const h = String(host || "").toLowerCase().split(":")[0];
  if (!h) return false;
  if (allowed.has(h)) return true;
  return false;
}

/**
 * @param {Request} request
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function checkAdminMutationOrigin(request) {
  if (process.env.ADMIN_ALLOW_NO_ORIGIN === "true") {
    return { ok: true };
  }
  if (process.env.NODE_ENV !== "production") {
    return { ok: true };
  }

  const allowed = allowedHosts(request);
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const host = new URL(origin).hostname;
      if (hostIsAllowed(host, allowed)) return { ok: true };
      return { ok: false, error: "Request origin is not allowed." };
    } catch {
      return { ok: false, error: "Invalid Origin header." };
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const host = new URL(referer).hostname;
      if (hostIsAllowed(host, allowed)) return { ok: true };
      return { ok: false, error: "Request referer is not allowed." };
    } catch {
      return { ok: false, error: "Invalid Referer header." };
    }
  }

  return { ok: false, error: "Missing Origin or Referer (required for this request)." };
}
