import fs from "node:fs";
import path from "node:path";

let cachedBuildId = null;

/** Next.js BUILD_ID — changes every production deploy. */
export function getDeployBuildId() {
  if (cachedBuildId) return cachedBuildId;

  const candidates = [
    path.join(process.cwd(), ".next", "BUILD_ID"),
    path.join(process.cwd(), ".next", "standalone", ".next", "BUILD_ID"),
  ];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        cachedBuildId = fs.readFileSync(candidate, "utf8").trim();
        return cachedBuildId;
      }
    } catch {
      /* try next path */
    }
  }

  cachedBuildId = process.env.NODE_ENV === "development" ? "dev" : "unknown";
  return cachedBuildId;
}
