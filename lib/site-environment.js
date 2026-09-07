/**
 * Site environment helpers.
 * Staging noindex / robots lockdown must only activate when SITE_ENVIRONMENT=staging.
 * Never treat missing or production values as staging.
 */

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {boolean}
 */
export function isStagingEnvironment(env = process.env) {
  return String(env.SITE_ENVIRONMENT || "").trim().toLowerCase() === "staging";
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {"staging" | "production" | "development" | "test" | "unknown"}
 */
export function getSiteEnvironment(env = process.env) {
  const raw = String(env.SITE_ENVIRONMENT || "").trim().toLowerCase();
  if (raw === "staging") return "staging";
  if (raw === "production") return "production";
  if (raw === "development" || raw === "dev") return "development";
  if (raw === "test") return "test";
  if (env.NODE_ENV === "production") return "production";
  if (env.NODE_ENV === "development") return "development";
  if (env.NODE_ENV === "test") return "test";
  return "unknown";
}
