import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const manifestPath = path.join(ROOT, ".next/server/app-paths-manifest.json");
const baselinePath = path.join(ROOT, "scripts/route-parity-baseline.json");

function normalizeManifestRoute(key) {
  if (key.endsWith("/page")) return (key.slice(0, -5) || "/").replace("/(secure)", "");
  if (key.endsWith("/route")) return (key.slice(0, -6) || "/").replace("/(secure)", "");
  return null;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

if (!fs.existsSync(manifestPath)) {
  console.error(`Route parity check failed: manifest not found at ${manifestPath}`);
  console.error("Run `npm run build` before `npm run routes:verify`.");
  process.exit(1);
}

if (!fs.existsSync(baselinePath)) {
  console.error(`Route parity check failed: baseline not found at ${baselinePath}`);
  process.exit(1);
}

const manifest = readJson(manifestPath);
const baseline = readJson(baselinePath);

const currentRoutes = new Set(
  Object.keys(manifest)
    .map(normalizeManifestRoute)
    .filter(Boolean)
);
const requiredRoutes = Array.isArray(baseline.requiredRoutes) ? baseline.requiredRoutes : [];

const missing = requiredRoutes.filter((route) => !currentRoutes.has(route));

if (missing.length) {
  console.error("Route parity check failed. Missing required routes:");
  for (const route of missing) console.error(`- ${route}`);
  process.exit(1);
}

console.log(`Route parity check passed (${requiredRoutes.length} required routes).`);
