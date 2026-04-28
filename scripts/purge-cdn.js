#!/usr/bin/env node

/**
 * Cloudflare CDN purge utility.
 *
 * Required environment variables:
 * - CLOUDFLARE_ZONE_ID
 * - CLOUDFLARE_API_TOKEN
 *
 * Optional:
 * - CLOUDFLARE_PURGE_EVERYTHING=true|false (default: false)
 * - CLOUDFLARE_PURGE_FILES='["https://example.com/","https://example.com/_next/static/..."]'
 *
 * Usage examples:
 *   CLOUDFLARE_ZONE_ID=... CLOUDFLARE_API_TOKEN=... CLOUDFLARE_PURGE_EVERYTHING=true node scripts/purge-cdn.js
 *   CLOUDFLARE_ZONE_ID=... CLOUDFLARE_API_TOKEN=... CLOUDFLARE_PURGE_FILES='["https://minroshmigration.com.au/","https://minroshmigration.com.au/_next/static/chunks/app/layout.js"]' node scripts/purge-cdn.js
 */

const zoneId = process.env.CLOUDFLARE_ZONE_ID || "";
const apiToken = process.env.CLOUDFLARE_API_TOKEN || "";
const purgeEverything = (process.env.CLOUDFLARE_PURGE_EVERYTHING || "").toLowerCase() === "true";
const filesRaw = process.env.CLOUDFLARE_PURGE_FILES || "";

if (!zoneId || !apiToken) {
  console.error("Missing required env vars: CLOUDFLARE_ZONE_ID and/or CLOUDFLARE_API_TOKEN");
  process.exit(1);
}

let files = [];
if (filesRaw) {
  try {
    files = JSON.parse(filesRaw);
    if (!Array.isArray(files)) throw new Error("CLOUDFLARE_PURGE_FILES must be a JSON array");
  } catch (error) {
    console.error("Failed to parse CLOUDFLARE_PURGE_FILES:", error.message);
    process.exit(1);
  }
}

if (!purgeEverything && files.length === 0) {
  console.error("Nothing to purge. Set CLOUDFLARE_PURGE_EVERYTHING=true or provide CLOUDFLARE_PURGE_FILES.");
  process.exit(1);
}

const payload = purgeEverything ? { purge_everything: true } : { files };
const endpoint = `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`;

async function run() {
  console.log(`[purge-cdn] Requesting purge for zone ${zoneId}...`);
  console.log(`[purge-cdn] Mode: ${purgeEverything ? "purge_everything" : `files(${files.length})`}`);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || body.success !== true) {
    console.error("[purge-cdn] Purge failed.");
    console.error(JSON.stringify(body, null, 2));
    process.exit(1);
  }

  console.log("[purge-cdn] Purge succeeded.");
  console.log(JSON.stringify(body, null, 2));
}

run().catch((error) => {
  console.error("[purge-cdn] Unexpected error:", error.message);
  process.exit(1);
});
