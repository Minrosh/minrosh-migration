export function buildAdminVerifyUrl({ requestUrl, plainVerificationToken }) {
  const envSite = String(process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  let origin = "";
  if (envSite) {
    try {
      // Accept both full URLs and bare hosts from env.
      const needsHttp = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(envSite);
      const normalized = /^https?:\/\//i.test(envSite) ? envSite : `${needsHttp ? "http" : "https"}://${envSite}`;
      origin = new URL(normalized).origin;
    } catch {
      origin = "";
    }
  }
  if (!origin) {
    origin = new URL(String(requestUrl || "")).origin;
  }
  return `${String(origin).replace(/\/$/, "")}/api/admin/verify-admin-email?t=${encodeURIComponent(String(plainVerificationToken || ""))}`;
}
