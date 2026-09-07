import { isStagingEnvironment } from "./site-environment";

/**
 * Public HTML robots meta for root layout (and similar metadata exports).
 * Staging noindex only when SITE_ENVIRONMENT=staging.
 * @param {NodeJS.ProcessEnv} [env]
 */
export function rootRobotsMetadata(env = process.env) {
  if (isStagingEnvironment(env)) {
    return {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    };
  }
  return { index: true, follow: true };
}

/**
 * Apply staging X-Robots-Tag on a middleware response when appropriate.
 * @param {import("next/server").NextResponse} response
 * @param {NodeJS.ProcessEnv} [env]
 */
export function applyStagingRobotsHeader(response, env = process.env) {
  if (isStagingEnvironment(env)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}
