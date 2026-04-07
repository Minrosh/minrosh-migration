import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicImages = path.join(root, "public", "images");

// Keep this list minimal and critical for homepage/brand rendering.
const requiredAssets = [
  "minrosh-logo.jpg",
  "hero-sydney-real.jpg",
  "team-office-real.jpg",
  "brisbane-skyline.jpg",
];

const missing = [];
for (const name of requiredAssets) {
  const abs = path.join(publicImages, name);
  if (!fs.existsSync(abs)) {
    missing.push(`${name} (missing)`);
    continue;
  }
  const size = fs.statSync(abs).size;
  if (!Number.isFinite(size) || size <= 0) {
    missing.push(`${name} (empty file)`);
  }
}

if (missing.length > 0) {
  console.error("Required image assets check failed.");
  console.error("Fix these files in public/images before building:");
  for (const m of missing) console.error(`- ${m}`);
  process.exit(1);
}

console.log("Required image assets check passed.");
