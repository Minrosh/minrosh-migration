import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const standalone = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(standalone, ".next", "static");
const publicSrc = path.join(root, "public");
const publicDest = path.join(standalone, "public");
const dataSrc = path.join(root, "data");
const dataDest = path.join(standalone, "data");

if (!fs.existsSync(standalone)) {
  console.error("Missing .next/standalone — run next build first.");
  process.exit(1);
}

if (!fs.existsSync(staticSrc)) {
  console.error("Missing .next/static — run next build first.");
  process.exit(1);
}

fs.mkdirSync(path.dirname(staticDest), { recursive: true });
fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
const uploadsDest = path.join(publicDest, "uploads");
fs.mkdirSync(uploadsDest, { recursive: true });

if (fs.existsSync(dataSrc)) {
  fs.mkdirSync(dataDest, { recursive: true });
  fs.cpSync(dataSrc, dataDest, { recursive: true, force: true });
}

console.log(
  "Standalone: copied public, data, and .next/static into .next/standalone (uploads dir ensured)."
);
