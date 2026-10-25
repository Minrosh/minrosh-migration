import { isStagingEnvironment } from "../lib/site-environment.js";

const SITE = "https://minroshmigration.com.au";

/**
 * Evaluate robots at request time so a production process never serves a
 * staging `Disallow: /` body that was baked when the build shell inherited
 * `SITE_ENVIRONMENT=staging`.
 *
 * @see docs/ops/ROBOTS-BUILD-AND-RUNTIME.md
 */
export const dynamic = "force-dynamic";

/**
 * @param {NodeJS.ProcessEnv} [env]
 */
export function buildRobotsConfig(env = process.env) {
  if (isStagingEnvironment(env)) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: ["/"],
        },
      ],
    };
  }

  return {
    host: SITE,
    rules: [
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      {
        userAgent: "*",
        allow: ["/", "/api/reviews"],
        disallow: ["/admin", "/api", "/upload"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}

export default function robots() {
  return buildRobotsConfig();
}
