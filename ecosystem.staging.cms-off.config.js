const fs = require("fs");
const path = require("path");

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

module.exports = {
  apps: [
    {
      name: "minrosh-staging",
      cwd: path.join(rootDir, ".next", "standalone"),
      script: "server.js",
      interpreter: "node",
      env: {
        ...fileEnv,
        NODE_ENV: "production",
        PORT: 3001,
        HOSTNAME: "0.0.0.0",
        STAGING_SITE: "true",
        NEXT_PUBLIC_WEBSITE_CMS_ENABLED: "false",
        NEXT_PUBLIC_SITE_URL: "https://staging.minroshmigration.com.au",
        PUBLIC_SITE_URL: "https://staging.minroshmigration.com.au",
        MINROSH_DATA_DIR: path.join(rootDir, ".next", "standalone", "data-staging"),
      },
    },
  ],
};
