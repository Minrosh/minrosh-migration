import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DESTINATION_SECTIONS_DIR = path.join(ROOT, "data", "destination-sections");
const REPORT_PATH = path.join(ROOT, "data", "destination-sections", "official-sources-report.md");

function collectLinks(payload) {
  const links = [];
  Object.entries(payload).forEach(([sectionKey, sectionPage]) => {
    const pageLinks = sectionPage.officialResources ?? [];
    pageLinks.forEach((link) => links.push({ level: "page", sectionKey, ...link }));
    const contentSections = sectionPage.sections ?? [];
    contentSections.forEach((contentSection) => {
      (contentSection.officialResources ?? []).forEach((link) =>
        links.push({ level: "section", sectionKey, sectionTitle: contentSection.title, ...link })
      );
    });
  });
  return links;
}

function main() {
  const files = readdirSync(DESTINATION_SECTIONS_DIR).filter((name) => name.endsWith(".json"));
  const lines = [];

  lines.push("# Destination Official Sources Report");
  lines.push("");

  files.forEach((filename) => {
    const slug = filename.replace(".json", "");
    const raw = readFileSync(path.join(DESTINATION_SECTIONS_DIR, filename), "utf8");
    const payload = JSON.parse(raw);
    const links = collectLinks(payload);
    const uniqueHrefs = [...new Set(links.map((link) => link.href))];

    lines.push(`## ${slug}`);
    lines.push(`- Total references: ${links.length}`);
    lines.push(`- Unique URLs: ${uniqueHrefs.length}`);
    lines.push("");
    lines.push("| Scope | Section Page | Content Section | Label | URL |");
    lines.push("|---|---|---|---|---|");
    links.forEach((link) => {
      lines.push(
        `| ${link.level} | ${link.sectionKey} | ${link.sectionTitle ?? "-"} | ${link.label} | ${link.href} |`
      );
    });
    lines.push("");
  });

  writeFileSync(REPORT_PATH, `${lines.join("\n")}\n`, "utf8");
  console.log(`Wrote ${REPORT_PATH}`);
}

main();
