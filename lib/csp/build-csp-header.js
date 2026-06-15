const TRUSTED_SCRIPT_HOSTS = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://maps.googleapis.com",
  "https://maps.gstatic.com",
  "https://js.hcaptcha.com",
];

/**
 * Build Content-Security-Policy for HTML responses (used by root middleware).
 *
 * Public marketing HTML is statically cached (see `x-nextjs-cache: HIT`) with script
 * nonces baked in at build time. A per-request nonce in CSP would not match those tags
 * and, with `strict-dynamic`, blocks every script — blank page / failed hydration.
 * Public routes therefore use `'self'` + `'unsafe-inline'` (no nonce / strict-dynamic).
 *
 * Admin routes stay dynamic and use nonce + strict-dynamic.
 *
 * @param {string} [nonce] — required when `opts.mode === "admin"`.
 * @param {{ production?: boolean, mode?: "public" | "admin" }} [opts]
 */
export function buildContentSecurityPolicy(nonce, opts = {}) {
  const production = opts.production === true;
  const mode = opts.mode === "admin" ? "admin" : "public";

  const scriptParts =
    mode === "admin"
      ? [
          "'self'",
          `'nonce-${nonce}'`,
          "'strict-dynamic'",
          production ? null : "'unsafe-eval'",
          ...TRUSTED_SCRIPT_HOSTS,
        ]
      : [
          "'self'",
          "'unsafe-inline'",
          production ? null : "'unsafe-eval'",
          ...TRUSTED_SCRIPT_HOSTS,
        ];

  const scriptPartsFiltered = scriptParts.filter(Boolean);

  return [
    "default-src 'self'",
    `script-src ${scriptPartsFiltered.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    [
      "connect-src 'self'",
      "https://generativelanguage.googleapis.com",
      "https://www.google-analytics.com",
      "https://region1.google-analytics.com",
      "https://www.googletagmanager.com",
      "https://maps.googleapis.com",
      "https://maps.gstatic.com",
      "https://nominatim.openstreetmap.org",
      "https://hcaptcha.com",
      "https://*.hcaptcha.com",
    ].join(" "),
    "frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}
