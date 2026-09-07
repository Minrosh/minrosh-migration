import { isStagingEnvironment } from "../lib/site-environment.js";

const SITE = "https://minroshmigration.com.au";

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
        allow: ["/", "/api/reviews", "/api/stats"],
        disallow: ["/admin", "/api", "/upload"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}

export default function robots() {
  return buildRobotsConfig();
}
