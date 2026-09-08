#!/usr/bin/env node
/**
 * Post-cutover production health check (redacted — no PII).
 * Appends one JSON line to the incident monitor log; writes escalations if needed.
 * Does not restart or modify production.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";

const INCIDENT = "/home/minrosh/incident-records/prod-zombie-standalone-20260908";
const LOG = path.join(INCIDENT, "16-monitor-24h.jsonl");
const ESC = path.join(INCIDENT, "16-monitor-ESCALATIONS.jsonl");
const SHARED = "/home/minrosh/shared/production-data";
const RELEASE =
  "/home/minrosh/releases/1455a66a319e29fe968ca6d74e086cdebaf3c049-20260908";
const BUILD_ID_PATH = path.join(RELEASE, ".next/BUILD_ID");
const UA = "MinRoshPostCutoverMonitor/1.0";

function sha16(p) {
  try {
    return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex").slice(0, 16);
  } catch {
    return null;
  }
}

function http(url, method = "GET", body = null) {
  return fetch(url, {
    method,
    headers: {
      "User-Agent": UA,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body,
    redirect: "manual",
    signal: AbortSignal.timeout(25000),
  })
    .then(async (r) => {
      const buf = Buffer.from(await r.arrayBuffer());
      return { status: r.status, headers: Object.fromEntries(r.headers), body: buf };
    })
    .catch((e) => ({ status: 0, headers: {}, body: Buffer.from(String(e)), error: true }));
}

function pm2Apps() {
  const raw = execFileSync("pm2", ["jlist"], { encoding: "utf8" });
  return JSON.parse(raw);
}

function disk(pathToCheck) {
  try {
    const out = execFileSync("df", ["-Pk", pathToCheck], { encoding: "utf8" });
    const line = out.trim().split("\n")[1];
    const parts = line.split(/\s+/);
    return { avail_kb: Number(parts[3]), use_pct: parts[4] };
  } catch {
    return null;
  }
}

const escalations = [];
function escalate(reason, detail = {}) {
  escalations.push({ reason, ...detail });
}

async function main() {
  const apps = pm2Apps();
  const prod = apps.find((a) => a.name === "minrosh-next");
  const staging = apps.find((a) => a.name === "minrosh-staging");
  if (!prod) escalate("pm2_missing_minrosh_next");

  const restarts = prod?.pm2_env?.restart_time ?? null;
  const pid = prod?.pid ?? null;
  const status = prod?.pm2_env?.status ?? null;
  const memMb = Math.round((prod?.monit?.memory || 0) / 1024 / 1024);
  const cpu = prod?.monit?.cpu ?? null;

  if (status !== "online") escalate("pm2_not_online", { status });
  // Baseline restart count after cutover corrections was 0 on pid 1546669
  if (typeof restarts === "number" && restarts > 0) escalate("pm2_restarts", { restarts, pid });

  const buildId = fs.existsSync(BUILD_ID_PATH)
    ? fs.readFileSync(BUILD_ID_PATH, "utf8").trim()
    : null;

  const routes = ["/", "/contact", "/book-information-session", "/education-consultation", "/tools"];
  const routeResults = [];
  let homeHtml = "";
  for (const route of routes) {
    const r = await http(`http://127.0.0.1:3000${route}`);
    routeResults.push({ route, status: r.status });
    if (r.status >= 500) escalate("local_5xx", { route, status: r.status });
    if (route === "/" && r.status === 200) homeHtml = r.body.toString("utf8");
  }

  const titleMatch = homeHtml.match(/<title[^>]*>(.*?)<\/title>/is);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";
  const compliant = /General Migration Information/i.test(title) || /General Migration Information/i.test(homeHtml);
  const precompliance = /Migration Agent Brisbane/i.test(title);
  const marn = /\bMARN\b/i.test(homeHtml);
  if (!compliant) escalate("compliance_title_missing", { title: title.slice(0, 80) });
  if (precompliance) escalate("precompliance_title", { title: title.slice(0, 80) });
  if (marn) escalate("marn_claim_detected");

  const assetPaths = [
    ...new Set(
      [...homeHtml.matchAll(/\/_next\/static\/[^"'\s>]+\.(?:js|css|woff2)/g)].map((m) => m[0]),
    ),
  ].slice(0, 12);
  let assetFail = 0;
  for (const a of assetPaths) {
    const r = await http(`http://127.0.0.1:3000${a}`);
    if (r.status !== 200) {
      assetFail += 1;
      escalate("asset_fail", { asset: a, status: r.status });
    }
  }

  const contact = await http("http://127.0.0.1:3000/api/contact", "POST", "{}");
  if (contact.status >= 500) escalate("contact_5xx", { status: contact.status });

  const chat = await http("http://127.0.0.1:3000/api/chat", "POST", "{}");
  const funnel = await http("http://127.0.0.1:3000/api/ai-funnel", "POST", "{}");
  if (chat.status !== 410) escalate("ai_chat_not_disabled", { status: chat.status });
  if (funnel.status !== 410) escalate("ai_funnel_not_disabled", { status: funnel.status });

  // Feature flags from process environ (names + boolean-ish values only)
  let flags = {};
  if (pid) {
    try {
      const env = fs.readFileSync(`/proc/${pid}/environ`);
      for (const part of env.toString("utf8").split("\0")) {
        const i = part.indexOf("=");
        if (i === -1) continue;
        const k = part.slice(0, i);
        const v = part.slice(i + 1);
        if (
          [
            "ENABLE_PUBLIC_AI_CHAT",
            "NEXT_PUBLIC_ENABLE_PUBLIC_AI_CHAT",
            "ENABLE_AI_PATHWAY_FUNNEL",
            "ENABLE_PERSONALISED_QUIZ_RESULTS",
            "ENABLE_PUBLIC_MIGRATION_MATTER_PORTAL",
            "ENABLE_AUTHORISED_RMA_MODE",
            "NEXT_PUBLIC_WEBSITE_CMS_ENABLED",
            "SITE_ENVIRONMENT",
            "MINROSH_DATA_DIR",
            "MAINTENANCE_MODE",
          ].includes(k)
        ) {
          flags[k] = v;
        }
      }
    } catch {
      /* ignore */
    }
  }
  for (const [k, v] of Object.entries(flags)) {
    if (k.startsWith("ENABLE_") || k.startsWith("NEXT_PUBLIC_ENABLE_") || k === "NEXT_PUBLIC_WEBSITE_CMS_ENABLED") {
      if (String(v).toLowerCase() === "true" || v === "1") escalate("feature_enabled", { flag: k });
    }
  }
  if (flags.MINROSH_DATA_DIR && flags.MINROSH_DATA_DIR !== SHARED) {
    escalate("unexpected_data_dir", { dir: flags.MINROSH_DATA_DIR });
  }
  if (flags.SITE_ENVIRONMENT && flags.SITE_ENVIRONMENT !== "production") {
    escalate("site_environment_not_production", { value: flags.SITE_ENVIRONMENT });
  }

  // Shared perms + unexpected write probes (mtime/hash only — no contents)
  const enquiries = path.join(SHARED, "enquiries.json");
  const sharedStat = fs.existsSync(SHARED) ? fs.statSync(SHARED) : null;
  const enqSha = sha16(enquiries);
  const suspicious = [];
  for (const p of [
    `${RELEASE}/.next/standalone/data.bundled-build-copy-NOT-PROD/enquiries.json`,
    "/home/minrosh/releases/rc-data-1455a66a319e29fe968ca6d74e086cdebaf3c049-20260908/enquiries.json",
    "/home/minrosh/minrosh-migration/data/enquiries.json",
  ]) {
    if (!fs.existsSync(p)) continue;
    const st = fs.statSync(p);
    // Flag if mtime is after cutover and hash differs from shared (possible stray write)
    if (enqSha && sha16(p) !== enqSha && st.mtimeMs > Date.parse("2026-09-08T13:11:30+10:00")) {
      suspicious.push({ path: p, sha16: sha16(p) });
    }
  }
  if (suspicious.length) escalate("unexpected_path_writes", { paths: suspicious.map((s) => s.path) });

  const pub = await http("https://minroshmigration.com.au/");
  if (pub.status >= 500) escalate("public_5xx", { status: pub.status });
  const pubTitle = (pub.body.toString("utf8").match(/<title[^>]*>(.*?)<\/title>/is) || [,""])[1]
    .replace(/\s+/g, " ")
    .trim();
  if (/Migration Agent Brisbane/i.test(pubTitle)) escalate("public_precompliance_title");

  const row = {
    t: new Date().toISOString(),
    host: os.hostname(),
    pm2: { pid, status, restarts, mem_mb: memMb, cpu },
    build_id: buildId,
    routes: routeResults,
    assets_checked: assetPaths.length,
    asset_fail: assetFail,
    contact_status: contact.status,
    disabled_apis: { chat: chat.status, funnel: funnel.status },
    flags,
    shared: {
      mode: sharedStat ? (sharedStat.mode & 0o777).toString(8) : null,
      enquiries_sha16: enqSha,
    },
    disk: disk(SHARED),
    staging: {
      status: staging?.pm2_env?.status ?? null,
      pid: staging?.pid ?? null,
      isolated_port: true,
    },
    public_home: pub.status,
    cf_cache: pub.headers["cf-cache-status"] || pub.headers["CF-Cache-Status"] || null,
    escalations: escalations.map((e) => e.reason),
  };

  fs.mkdirSync(INCIDENT, { recursive: true });
  fs.appendFileSync(LOG, `${JSON.stringify(row)}\n`);
  if (escalations.length) {
    fs.appendFileSync(
      ESC,
      `${JSON.stringify({ t: row.t, pid, escalations })}\n`,
    );
    console.error("ESCALATION", JSON.stringify(escalations));
    process.exitCode = 2;
  } else {
    console.log(
      JSON.stringify({
        ok: true,
        t: row.t,
        pid,
        restarts,
        asset_fail: assetFail,
        contact_status: contact.status,
        public_home: pub.status,
      }),
    );
  }
}

main().catch((e) => {
  const msg = { t: new Date().toISOString(), fatal: String(e && e.message ? e.message : e) };
  try {
    fs.appendFileSync(ESC, `${JSON.stringify(msg)}\n`);
  } catch {
    /* ignore */
  }
  console.error(msg);
  process.exit(1);
});
