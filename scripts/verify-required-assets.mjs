import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicImages = path.join(root, "public", "images");
const publicAssets = path.join(root, "public", "assets");

// Keep this list minimal and critical for homepage/brand rendering.
// We enforce minimum byte sizes to prevent placeholder "tiny image" regressions.
const requiredAssets = [
  { name: "minrosh-logo.jpg", minBytes: 30_000 },
  { name: "minrosh-logo.png", minBytes: 30_000 },
  { name: "hero-sydney-real.jpg", minBytes: 100_000 },
  { name: "team-office-real.jpg", minBytes: 80_000 },
  { name: "brisbane-skyline.jpg", minBytes: 100_000 },
  { name: "visual-strip-destinations.jpg", minBytes: 100_000 },
];

const missing = [];
for (const { name, minBytes } of requiredAssets) {
  const abs = path.join(publicImages, name);
  if (!fs.existsSync(abs)) {
    missing.push(`${name} (missing)`);
    continue;
  }
  const size = fs.statSync(abs).size;
  if (!Number.isFinite(size) || size <= 0) {
    missing.push(`${name} (empty file)`);
    continue;
  }
  if (size < minBytes) {
    missing.push(`${name} (too small: ${size} bytes, expected >= ${minBytes})`);
  }
}

const brochureFile = path.join(publicAssets, "minrosh-email-brochure.pdf");
if (!fs.existsSync(brochureFile)) {
  missing.push("minrosh-email-brochure.pdf (missing)");
} else {
  const brochureSize = fs.statSync(brochureFile).size;
  if (brochureSize < 50_000) {
    missing.push(`minrosh-email-brochure.pdf (too small: ${brochureSize} bytes, expected >= 50000)`);
  }
}

if (missing.length > 0) {
  console.error("Required image assets check failed.");
  console.error("Fix these files in public/images before building:");
  for (const m of missing) console.error(`- ${m}`);
  process.exit(1);
}

console.log("Required image assets check passed.");
