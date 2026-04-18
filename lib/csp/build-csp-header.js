/**
 * Build Content-Security-Policy for HTML responses (used by root middleware).
 * @param {string} nonce — base64-ish token for script-src (must match <script nonce> on the page).
 * @param {{ production?: boolean }} [opts]
 */
export function buildContentSecurityPolicy(nonce, opts = {}) {
  const production = opts.production === true;
  const scriptParts = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    production ? null : "'unsafe-eval'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://maps.googleapis.com",
    "https://maps.gstatic.com",
  ].filter(Boolean);

  return [
    "default-src 'self'",
    `script-src ${scriptParts.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    [
      "connect-src 'self'",
      "https://api.openai.com",
      "https://generativelanguage.googleapis.com",
      "https://www.google-analytics.com",
      "https://region1.google-analytics.com",
      "https://www.googletagmanager.com",
      "https://maps.googleapis.com",
      "https://maps.gstatic.com",
    ].join(" "),
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}
