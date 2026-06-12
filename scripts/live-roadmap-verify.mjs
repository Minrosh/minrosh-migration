#!/usr/bin/env node
/**
 * Live roadmap verification (production smoke vs merged main).
 *
 * Checks:
 * - GET /tools/student-country-cost-planner → 200
 * - GET /tools/pr-pathway-explorer → 200
 * - sitemap.xml lists both tool paths
 * - homepage HTML does not contain deprecated hype strings (post-positioning deploy)
 *
 * Usage:
 *   node scripts/live-roadmap-verify.mjs
 *   SITE_URL=https://minroshmigration.com.au node scripts/live-roadmap-verify.mjs
 *
 * Exit 1 if any check fails (expect failures until production deploy catches up main).
 */
const base = (process.env.SITE_URL || "https://minroshmigration.com.au").replace(/\/$/, "");

const TOOL_PATHS = ["/tools/student-country-cost-planner", "/tools/pr-pathway-explorer"];

/** Strings that indicate an older production bundle (pre roadmap homepage refresh). */
const HOMEPAGE_FORBIDDEN = [
  "MinRosh Intelligence v3.4",
  "The Island.",
  "Live Activity</span>",
  "Preparing your migration portal",
];

async function getStatus(path) {
  const url = `${base}${path}`;
  const res = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: { Accept: "text/html,application/xml;q=0.9,*/*;q=0.8" },
  });
  return { url, status: res.status, ok: res.ok, res };
}

/** Short snippet for debugging 5xx HTML bodies (Next.js error pages, nginx). */
async function peekErrorBody(res, maxLen = 280) {
  try {
    const ct = res.headers.get("content-type") || "";
    if (!/text\/(html|plain)|application\/json/i.test(ct)) return "";
    const t = await res.clone().text();
    const oneLine = t.replace(/\s+/g, " ").trim();
    return oneLine.length > maxLen ? `${oneLine.slice(0, maxLen)}…` : oneLine;
  } catch {
    return "";
  }
}

function hintForHttpStatus(status) {
  if (status >= 500) {
    return "Runtime/upstream failure (app threw or proxy error). On the host: `pm2 logs` for the Next process, `nginx -t` + error.log, disk space, and `.env` required vars — not the same as “routes missing”.";
  }
  if (status === 404) {
    return "Not found — production build may still be behind `main`, or the path is wrong.";
  }
  if (status >= 400) {
    return "Client/forbidden issue — check auth headers, WAF, or maintenance mode.";
  }
  return "";
}

async function main() {
  let failed = false;
  let saw5xx = false;

  console.log(`Live roadmap verify → ${base}\n`);

  for (const p of TOOL_PATHS) {
    try {
      const r = await getStatus(p);
      if (!r.ok) {
        if (r.status >= 500) saw5xx = true;
        const peek = r.status >= 500 ? await peekErrorBody(r.res) : "";
        console.error(`FAIL ${r.url} → HTTP ${r.status} (expected 200)`);
        if (peek) console.error(`     body: ${peek}`);
        console.error(`     ${hintForHttpStatus(r.status)}`);
        failed = true;
      } else {
        console.log(`OK   ${r.url} → HTTP ${r.status}`);
      }
    } catch (e) {
      console.error(`FAIL ${base}${p}`, e?.message || e);
      failed = true;
    }
  }

  try {
    const smUrl = `${base}/sitemap.xml`;
    const smRes = await fetch(smUrl, { redirect: "follow" });
    if (!smRes.ok) {
      if (smRes.status >= 500) saw5xx = true;
      const peek = smRes.status >= 500 ? await peekErrorBody(smRes) : "";
      console.error(`FAIL ${smUrl} → HTTP ${smRes.status}`);
      if (peek) console.error(`     body: ${peek}`);
      console.error(`     ${hintForHttpStatus(smRes.status)}`);
      failed = true;
    } else {
      const text = await smRes.text();
      for (const slug of ["student-country-cost-planner", "pr-pathway-explorer"]) {
        if (!text.includes(slug)) {
          console.error(`FAIL sitemap missing segment "${slug}"`);
          failed = true;
        } else {
          console.log(`OK   sitemap contains "${slug}"`);
        }
      }
    }
  } catch (e) {
    console.error("FAIL sitemap fetch", e?.message || e);
    failed = true;
  }

  try {
    const homeUrl = `${base}/`;
    const homeRes = await fetch(homeUrl, { redirect: "follow" });
    if (!homeRes.ok) {
      if (homeRes.status >= 500) saw5xx = true;
      const peek = homeRes.status >= 500 ? await peekErrorBody(homeRes) : "";
      console.error(`FAIL ${homeUrl} → HTTP ${homeRes.status}`);
      if (peek) console.error(`     body: ${peek}`);
      console.error(`     ${hintForHttpStatus(homeRes.status)}`);
      failed = true;
    } else {
      const html = await homeRes.text();
      let homepageDeprecated = false;
      for (const needle of HOMEPAGE_FORBIDDEN) {
        if (html.includes(needle)) {
          console.error(`FAIL homepage still contains deprecated snippet: ${needle}`);
          homepageDeprecated = true;
          failed = true;
        }
      }
      if (!homepageDeprecated) {
        console.log(`OK   homepage HTML passes deprecated-string checks`);
      }
    }
  } catch (e) {
    console.error("FAIL homepage fetch", e?.message || e);
    failed = true;
  }

  if (failed) {
    if (saw5xx) {
      console.error(
        "\nLive roadmap verify: production returned 5xx — fix the running app/proxy first (logs above), then re-run.",
      );
    } else {
      console.error(
        "\nLive roadmap verify: production is not aligned with current main (deploy gap), or homepage copy not yet shipped.",
      );
      console.error("After fixing: cd ~/minrosh-migration && bash scripts/update-server.sh\n");
    }
    process.exit(1);
  }

  console.log("\nLive roadmap verify: all checks passed.\n");
  process.exit(0);
}

main();
