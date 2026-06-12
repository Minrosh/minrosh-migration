import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "public/images/hero-brisbane-river-cbd-hd.jpg");

const variants = [
  { width: 640, out: "hero-brisbane-river-cbd-hd.lcp-640.avif" },
  { width: 1280, out: "hero-brisbane-river-cbd-hd.lcp-1280.avif" },
];

async function main() {
  if (!fs.existsSync(src)) {
    console.warn("[optimize-hero-lcp] source missing — skipping AVIF generation");
    return;
  }

  const srcMtime = fs.statSync(src).mtimeMs;
  let upToDate = true;
  for (const v of variants) {
    const dest = path.join(root, "public/images", v.out);
    if (!fs.existsSync(dest) || fs.statSync(dest).mtimeMs < srcMtime) {
      upToDate = false;
      break;
    }
  }

  if (upToDate) {
    console.log("[optimize-hero-lcp] variants up to date");
    return;
  }

  for (const v of variants) {
    const dest = path.join(root, "public/images", v.out);
    await sharp(src).resize({ width: v.width, withoutEnlargement: true }).avif({ quality: 48, effort: 4 }).toFile(dest);
    console.log(`[optimize-hero-lcp] wrote public/images/${v.out}`);
  }
}

main().catch((error) => {
  console.error("[optimize-hero-lcp] failed:", error?.message || error);
  process.exit(1);
});
