#!/usr/bin/env node
/**
 * SEO metadata auditor for data/seo-pages.json.
 *
 * Default: report-only (writes reports/seo-meta-audit.md).
 * --write: apply safe transforms and update data/seo-pages.json.
 *
 * Usage:
 *   node scripts/seo-auto-update.js
 *   node scripts/seo-auto-update.js --write
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SEO_PAGES_PATH = path.join(ROOT, "data/seo-pages.json");
const REPORT_PATH = path.join(ROOT, "reports/seo-meta-audit.md");

const TITLE_SUFFIX = " | MinRosh Migration";
const TITLE_RENDERED_MIN = 55;
const TITLE_RENDERED_MAX = 60;
const DESC_WARN_MIN = 120;
const DESC_WARN_MAX = 155;

const SECTIONS = ["servicePages", "guidePages"];

const SUFFIX_PATTERNS = [
  /\s*\|\s*MinRosh Migration\s*$/i,
  /\s*\|\s*MinRosh Guide\s*$/i,
  /\s*\|\s*MinRosh\s*$/i,
];

const FILLER_SEGMENTS = new Set(
  [
    "guidance",
    "help",
    "consultation",
    "news",
    "onshore evidence help",
    "offshore preparation",
    "registered agent brisbane",
    "minrosh guide",
    "minrosh migration",
    "brisbane consultation",
  ].map((s) => s.toLowerCase())
);

const PROTECTED_SEGMENT = /\b(189|190|491|309|100|820|801|500|brisbane|australia|canada|uk|nz|new zealand|sri lanka)\b/i;

const writeMode = process.argv.includes("--write");

function renderedTitle(metaTitle) {
  return `${metaTitle}${TITLE_SUFFIX}`;
}

function renderedLength(metaTitle) {
  return renderedTitle(metaTitle).length;
}

function stripSuffixes(title) {
  let out = title.trim();
  let changed = true;
  while (changed) {
    changed = false;
    for (const pattern of SUFFIX_PATTERNS) {
      const next = out.replace(pattern, "").trim();
      if (next !== out) {
        out = next;
        changed = true;
      }
    }
  }
  return out;
}

function segmentIsRemovable(segment) {
  const trimmed = segment.trim();
  if (!trimmed) return false;
  if (PROTECTED_SEGMENT.test(trimmed)) return false;
  return FILLER_SEGMENTS.has(trimmed.toLowerCase());
}

function removeTrailingFillerSegment(title) {
  const parts = title.split(/\s*\|\s*/);
  if (parts.length < 2) return title;
  const last = parts[parts.length - 1];
  if (!segmentIsRemovable(last)) return title;
  return parts.slice(0, -1).join(" | ").trim();
}

function compactSeparators(title) {
  return title.replace(/\s*\|\s*/g, " – ").replace(/\s{2,}/g, " ").trim();
}

/** Safe rewrites for long (2026) guide titles — applied only while over the limit. */
function applyGuideTitleRewrites(title) {
  const rewrites = [
    (t) => t.replace(/\s*\(2026 Guide\)$/i, " (2026)"),
    (t) => t.replace(/\s+Guide\s+\(2026\)$/i, " (2026)"),
    (t) => t.replace(/\s+Explained\s+\(2026\)$/i, " (2026)"),
    (t) => t.replace(/^How to Apply for a /i, ""),
    (t) => t.replace(/Student Visa Australia Requirements/i, "Student Visa Requirements"),
    (t) => t.replace(/Fees and Costs/i, "Visa Fees"),
    (t) => t.replace(/Document Checklist/i, "Visa Checklist"),
    (t) => t.replace(/Australia Points/i, "Points"),
  ];

  let out = title;
  for (const rewrite of rewrites) {
    if (renderedLength(out) <= TITLE_RENDERED_MAX) break;
    const next = rewrite(out).replace(/\s{2,}/g, " ").trim();
    if (next !== out) out = next;
  }
  return out;
}

function transformTitle(original) {
  const steps = [];
  let title = original;

  const afterSuffix = stripSuffixes(title);
  if (afterSuffix !== title) {
    title = afterSuffix;
    steps.push("suffix-strip");
  }

  let guard = 0;
  while (renderedLength(title) > TITLE_RENDERED_MAX && guard < 8) {
    const before = title;
    title = removeTrailingFillerSegment(title);
    if (title !== before) {
      steps.push("segment-remove");
      guard += 1;
      continue;
    }
    break;
  }

  if (renderedLength(title) > TITLE_RENDERED_MAX) {
    const compacted = compactSeparators(title);
    if (compacted !== title) {
      title = compacted;
      steps.push("separator-compact");
    }
  }

  if (renderedLength(title) > TITLE_RENDERED_MAX) {
    const rewritten = applyGuideTitleRewrites(title);
    if (rewritten !== title) {
      title = rewritten;
      steps.push("guide-rewrite");
    }
  }

  const needsManualReview = renderedLength(title) > TITLE_RENDERED_MAX;
  return { title, steps, needsManualReview };
}

function ensureSentenceEnd(text) {
  const trimmed = text.replace(/[,;:\s]+$/, "").trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function trimDescription(description) {
  if (description.length <= DESC_WARN_MAX) {
    return { text: description, trimmed: false };
  }

  const sentenceParts = description.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [description];
  if (sentenceParts.length > 1) {
    let assembled = "";
    for (const part of sentenceParts) {
      const candidate = (assembled + part).trim();
      if (candidate.length <= DESC_WARN_MAX) {
        assembled = candidate;
      } else {
        break;
      }
    }
    if (assembled.length >= DESC_WARN_MIN && assembled.length <= DESC_WARN_MAX) {
      return { text: assembled, trimmed: assembled !== description };
    }
  }

  if (description.includes(",")) {
    const clauses = description.split(/,\s*/);
    let assembled = clauses[0];
    for (let i = 1; i < clauses.length; i += 1) {
      const candidate = `${assembled}, ${clauses[i]}`;
      if (candidate.length <= DESC_WARN_MAX) {
        assembled = candidate;
      } else {
        break;
      }
    }
    assembled = ensureSentenceEnd(assembled);
    if (assembled.length >= DESC_WARN_MIN && assembled.length <= DESC_WARN_MAX) {
      return { text: assembled, trimmed: assembled !== description };
    }
  }

  let cut = description.slice(0, DESC_WARN_MAX);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > DESC_WARN_MIN) {
    cut = cut.slice(0, lastSpace);
  }
  return { text: ensureSentenceEnd(cut), trimmed: true };
}

function scanEntry(section, key, entry) {
  const metaTitle = entry.metaTitle ?? "";
  const metaDescription = entry.metaDescription ?? "";
  const titleLen = renderedLength(metaTitle);
  const descLen = metaDescription.length;

  const titleFail = titleLen > TITLE_RENDERED_MAX;
  const titleWarn = titleLen < TITLE_RENDERED_MIN;
  const descFail = descLen > DESC_WARN_MAX;
  const descWarn = descLen < DESC_WARN_MIN;

  return {
    section,
    key,
    path: entry.path ?? "",
    metaTitle,
    metaDescription,
    renderedTitle: renderedTitle(metaTitle),
    titleLen,
    descLen,
    titleFail,
    titleWarn,
    descFail,
    descWarn,
    needsManualReview: false,
    changes: [],
  };
}

function applyWriteTransforms(data) {
  const allChanges = [];

  for (const section of SECTIONS) {
    const pages = data[section];
    if (!pages || typeof pages !== "object") continue;

    for (const [key, entry] of Object.entries(pages)) {
      if (!entry || typeof entry !== "object") continue;

      if (typeof entry.metaTitle === "string") {
        const before = entry.metaTitle;
        const { title, steps, needsManualReview } = transformTitle(before);
        if (title !== before) {
          entry.metaTitle = title;
          allChanges.push({
            section,
            key,
            field: "metaTitle",
            before,
            after: title,
            reason: steps.join(", ") || "transform",
            needsManualReview,
          });
        } else if (needsManualReview) {
          allChanges.push({
            section,
            key,
            field: "metaTitle",
            before,
            after: before,
            reason: "manual-review",
            needsManualReview: true,
          });
        }
      }

      if (typeof entry.metaDescription === "string") {
        const before = entry.metaDescription;
        const { text, trimmed } = trimDescription(before);
        if (trimmed && text !== before) {
          entry.metaDescription = text;
          allChanges.push({
            section,
            key,
            field: "metaDescription",
            before,
            after: text,
            reason: "desc-trim",
            needsManualReview: false,
          });
        }
      }
    }
  }

  return allChanges;
}

function collectResults(data) {
  const results = [];

  for (const section of SECTIONS) {
    const pages = data[section];
    if (!pages || typeof pages !== "object") continue;

    for (const [key, entry] of Object.entries(pages)) {
      if (!entry || typeof entry !== "object") continue;
      if (!entry.metaTitle && !entry.metaDescription) continue;
      results.push(scanEntry(section, key, entry));
    }
  }

  return results;
}

function markManualReview(results, writeChanges) {
  const manualKeys = new Set(
    writeChanges
      .filter((c) => c.needsManualReview)
      .map((c) => `${c.section}.${c.key}`)
  );

  for (const row of results) {
    const id = `${row.section}.${row.key}`;
    if (manualKeys.has(id)) {
      row.needsManualReview = true;
    }
    if (writeMode && row.titleFail) {
      row.needsManualReview = true;
    }
  }
}

function escapeMd(value) {
  return String(value).replace(/\|/g, "\\|");
}

function buildReport(results, writeChanges) {
  const now = new Date().toISOString();
  const mode = writeMode ? "write" : "audit";

  const hardFailures = results.filter((r) => r.titleFail || r.descFail);
  const warnings = results.filter(
    (r) => (r.titleWarn || r.descWarn) && !r.titleFail && !r.descFail
  );
  const manualReview = results.filter((r) => r.needsManualReview);
  const okCount = results.filter(
    (r) => !r.titleFail && !r.descFail && !r.needsManualReview
  ).length;

  const lines = [];
  lines.push("# SEO meta audit");
  lines.push("");
  lines.push(`- **Generated:** ${now}`);
  lines.push(`- **Mode:** ${mode}`);
  lines.push(`- **Source:** \`data/seo-pages.json\``);
  lines.push(`- **Rendered title rule:** \`metaTitle + "${TITLE_SUFFIX}"\``);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`| Metric | Count |`);
  lines.push(`| --- | ---: |`);
  lines.push(`| Entries scanned | ${results.length} |`);
  lines.push(`| OK (hard limits) | ${okCount} |`);
  lines.push(`| Warnings | ${warnings.length} |`);
  lines.push(`| Hard failures | ${hardFailures.length} |`);
  lines.push(`| Manual review | ${manualReview.length} |`);
  lines.push(`| Changes applied | ${writeChanges.length} |`);
  lines.push("");

  if (hardFailures.length) {
    lines.push("## Hard failures");
    lines.push("");
    lines.push("| Key | Path | Issue | Value |");
    lines.push("| --- | --- | --- | --- |");
    for (const r of hardFailures) {
      const issues = [];
      if (r.titleFail) issues.push(`title ${r.titleLen} chars (max ${TITLE_RENDERED_MAX})`);
      if (r.descFail) issues.push(`description ${r.descLen} chars (max ${DESC_WARN_MAX})`);
      lines.push(
        `| ${r.section}.${r.key} | ${r.path || "—"} | ${issues.join("; ")} | ${escapeMd(r.renderedTitle)} |`
      );
    }
    lines.push("");
  }

  if (warnings.length) {
    lines.push("## Warnings");
    lines.push("");
    lines.push("| Key | Path | Issue |");
    lines.push("| --- | --- | --- |");
    for (const r of warnings) {
      const issues = [];
      if (r.titleWarn) issues.push(`title ${r.titleLen} chars (below ${TITLE_RENDERED_MIN})`);
      if (r.descWarn) issues.push(`description ${r.descLen} chars (below ${DESC_WARN_MIN})`);
      lines.push(`| ${r.section}.${r.key} | ${r.path || "—"} | ${issues.join("; ")} |`);
    }
    lines.push("");
  }

  if (writeChanges.length) {
    lines.push("## Changes applied");
    lines.push("");
    lines.push("| Key | Field | Reason | Before | After |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const c of writeChanges) {
      lines.push(
        `| ${c.section}.${c.key} | ${c.field} | ${c.reason} | ${escapeMd(c.before)} | ${escapeMd(c.after)} |`
      );
    }
    lines.push("");
  }

  if (manualReview.length) {
    lines.push("## Manual review queue");
    lines.push("");
    lines.push("Titles still exceed the rendered limit after safe transforms.");
    lines.push("");
    lines.push("| Key | Path | Rendered title | Length |");
    lines.push("| --- | --- | --- | ---: |");
    for (const r of manualReview) {
      lines.push(
        `| ${r.section}.${r.key} | ${r.path || "—"} | ${escapeMd(r.renderedTitle)} | ${r.titleLen} |`
      );
    }
    lines.push("");
  }

  lines.push("## All entries");
  lines.push("");
  lines.push("| Key | Rendered title len | Desc len | Status |");
  lines.push("| --- | ---: | ---: | --- |");
  for (const r of results) {
    const status = r.needsManualReview
      ? "manual-review"
      : r.titleFail || r.descFail
        ? "fail"
        : r.titleWarn || r.descWarn
          ? "warn"
          : "ok";
    lines.push(
      `| ${r.section}.${r.key} | ${r.titleLen} | ${r.descLen} | ${status} |`
    );
  }
  lines.push("");

  return lines.join("\n");
}

function printSummary(results, writeChanges) {
  const hardFailures = results.filter((r) => r.titleFail || r.descFail);
  const manualReview = results.filter((r) => r.needsManualReview);
  const warnings = results.filter((r) => r.titleWarn || r.descWarn);

  console.log(`SEO meta ${writeMode ? "update" : "audit"}: ${results.length} entries`);
  console.log(`  OK: ${results.length - hardFailures.length - manualReview.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  console.log(`  Hard failures: ${hardFailures.length}`);
  console.log(`  Manual review: ${manualReview.length}`);
  if (writeMode) {
    console.log(`  Changes applied: ${writeChanges.length}`);
  }
  console.log(`  Report: ${path.relative(ROOT, REPORT_PATH)}`);
}

function main() {
  if (!fs.existsSync(SEO_PAGES_PATH)) {
    console.error(`Missing ${SEO_PAGES_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(SEO_PAGES_PATH, "utf8");
  const data = JSON.parse(raw);
  let writeChanges = [];

  if (writeMode) {
    writeChanges = applyWriteTransforms(data);
    fs.writeFileSync(SEO_PAGES_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }

  const results = collectResults(data);
  markManualReview(results, writeChanges);

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, buildReport(results, writeChanges), "utf8");

  printSummary(results, writeChanges);

  const hasHardFailure = results.some((r) => r.titleFail || r.descFail);
  const hasManualReview = results.some((r) => r.needsManualReview);

  if (hasHardFailure || hasManualReview) {
    process.exit(1);
  }

  process.exit(0);
}

main();
