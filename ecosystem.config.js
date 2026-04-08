const fs = require("fs");
const path = require("path");

/**
 * PM2's `env_file` key is only supported in newer PM2 versions; many servers ignore it,
 * which leaves SMTP_* unset and shows "SMTP is not configured" on the contact form.
 * We merge project-root .env here so mail and admin secrets always load.
 *
 * Important: `pm2 restart --update-env` does not re-read this file or .env — it reapplies
 * the saved process env. After changing .env, run: `pm2 delete minrosh-next && pm2 start ecosystem.config.js && pm2 save`
 * (or `pm2 start ecosystem.config.js --only minrosh-next` if already defined) so merged vars apply.
 */
function loadDotEnv(absPath) {
  const out = {};
  if (!fs.existsSync(absPath)) return out;
  const raw = fs.readFileSync(absPath, "utf8").replace(/^\uFEFF/, "");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const noExport = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
    const eq = noExport.indexOf("=");
    if (eq === -1) continue;
    const key = noExport.slice(0, eq).trim();
    let val = noExport.slice(eq + 1).trim();
    if (!key) continue;
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const rootDir = __dirname;
const fileEnv = loadDotEnv(path.join(rootDir, ".env"));

/**
 * PM2 runs with cwd = .next/standalone so:
 * - storage/uploads and data/*.json resolve next to server.js (matches copy-standalone-assets.mjs).
 * Runtime secrets: add them to .env in this directory (project root), not only in the shell.
 */
module.exports = {
  apps: [
    {
      name: "minrosh-next",
      cwd: path.join(rootDir, ".next", "standalone"),
      script: "server.js",
      interpreter: "node",
      env: {
        ...fileEnv,
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
