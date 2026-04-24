import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const mainNext = path.join(root, ".next");
const standalone = path.join(mainNext, "standalone");
const staticSrc = path.join(mainNext, "static");
const staticDest = path.join(standalone, ".next", "static");
const serverSrc = path.join(mainNext, "server");
const serverDest = path.join(standalone, ".next", "server");
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

/**
 * Next standalone tracing sometimes omits server manifests PM2 needs at runtime.
 * Sync full .next/server + key root manifests from the main build output.
 */
if (fs.existsSync(serverSrc)) {
  fs.mkdirSync(path.dirname(serverDest), { recursive: true });
  fs.cpSync(serverSrc, serverDest, { recursive: true, force: true });
}

const rootNextFiles = [
  "required-server-files.json",
  "BUILD_ID",
  "routes-manifest.json",
  "prerender-manifest.json",
  "images-manifest.json",
  "export-marker.json",
  "package.json",
  "app-path-routes-manifest.json",
  "app-build-manifest.json",
  "build-manifest.json",
  "react-loadable-manifest.json",
];

for (const name of rootNextFiles) {
  const src = path.join(mainNext, name);
  const dest = path.join(standalone, ".next", name);
  if (fs.existsSync(src) && fs.statSync(src).isFile()) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    try {
      fs.copyFileSync(src, dest);
    } catch (error) {
      if (error?.code === "ENOENT") {
        console.warn(`Skipping optional manifest copy (missing during deploy): ${name}`);
        continue;
      }
      throw error;
    }
  }
}

fs.mkdirSync(path.dirname(staticDest), { recursive: true });
fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
const storageUploadsDest = path.join(standalone, "storage", "uploads");
fs.mkdirSync(storageUploadsDest, { recursive: true });

if (fs.existsSync(dataSrc)) {
  fs.mkdirSync(dataDest, { recursive: true });
  fs.cpSync(dataSrc, dataDest, { recursive: true, force: true });
}

/**
 * Standalone file tracing can omit `next/dist/server/web` (e.g. `./web/sandbox`).
 * Merge the full tree from the installed `next` package so PM2 never hits MODULE_NOT_FOUND.
 */
const nextServerWebSrc = path.join(
  root,
  "node_modules",
  "next",
  "dist",
  "server",
  "web",
);
const nextServerWebDest = path.join(
  standalone,
  "node_modules",
  "next",
  "dist",
  "server",
  "web",
);
if (fs.existsSync(nextServerWebSrc)) {
  fs.mkdirSync(path.dirname(nextServerWebDest), { recursive: true });
  fs.cpSync(nextServerWebSrc, nextServerWebDest, { recursive: true, force: true });
  console.log("Standalone: merged next/dist/server/web (sandbox + fetch helpers).");
} else {
  console.warn(
    "copy-standalone-assets: node_modules/next/dist/server/web missing — run npm ci before build.",
  );
}

const mustExist = [
  path.join(standalone, ".next", "server", "middleware-manifest.json"),
  path.join(standalone, ".next", "required-server-files.json"),
  path.join(standalone, "server.js"),
  path.join(
    standalone,
    "node_modules",
    "next",
    "dist",
    "server",
    "web",
    "sandbox",
    "index.js",
  ),
];
for (const p of mustExist) {
  if (!fs.existsSync(p)) {
    console.error(
      "Standalone bundle incomplete — missing:",
      p,
      "\nRun a full `npm run build` (not only `next build` without the copy step). PM2 will 502 without these files.",
    );
    process.exit(1);
  }
}

const publicImagesCheck = [
  path.join(standalone, "public", "images", "minrosh-logo.jpg"),
  path.join(standalone, "public", "images", "hero-sydney-real.jpg"),
];
for (const p of publicImagesCheck) {
  if (!fs.existsSync(p)) {
    console.error(
      "Standalone public assets missing — expected:",
      p,
      "\nEnsure ./public/images exists in the repo and the copy step ran. Without this, logos and hero images 404 in production.",
    );
    process.exit(1);
  }
}

console.log(
  "Standalone: synced .next/server + manifests, public, data, .next/static; ensured storage/uploads.",
);
