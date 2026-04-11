import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isOfficialSourceHostAllowed } from "../lib/official-source-hosts.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DESTINATION_SECTIONS_DIR = path.join(ROOT, "data", "destination-sections");

const SECTION_KEYS = [
  "metaTitle",
  "metaDescription",
  "eyebrow",
  "headline",
  "intro",
  "officialResources",
  "sections",
  "faq",
  "related",
];

function isHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateLinkObject(link, ctx, errors) {
  if (!link || typeof link !== "object") {
    errors.push(`${ctx}: link must be an object`);
    return;
  }
  if (!link.label || typeof link.label !== "string") {
    errors.push(`${ctx}: missing string label`);
  }
  if (!link.href || typeof link.href !== "string" || !isHttpsUrl(link.href)) {
    errors.push(`${ctx}: href must be a valid https URL`);
  }
}

function validateSectionCard(section, destinationSlug, ctx, errors) {
  if (!section || typeof section !== "object") {
    errors.push(`${ctx}: section must be an object`);
    return;
  }
  if (!section.title || typeof section.title !== "string") {
    errors.push(`${ctx}: missing string title`);
  }
  if (!section.body || typeof section.body !== "string") {
    errors.push(`${ctx}: missing string body`);
  }

  if (section.details !== undefined && !Array.isArray(section.details)) {
    errors.push(`${ctx}: details must be an array when provided`);
  }

  if (section.bullets !== undefined && !Array.isArray(section.bullets)) {
    errors.push(`${ctx}: bullets must be an array when provided`);
  }

  if (section.officialResources !== undefined) {
    if (!Array.isArray(section.officialResources)) {
      errors.push(`${ctx}: officialResources must be an array when provided`);
    } else {
      section.officialResources.forEach((item, index) => {
        const linkCtx = `${ctx}.officialResources[${index}]`;
        validateLinkObject(item, linkCtx, errors);
        if (item?.href && !isOfficialSourceHostAllowed(destinationSlug, item.href)) {
          errors.push(`${linkCtx}: host is not in the allowed official-source list for ${destinationSlug}`);
        }
      });
    }
  }
}

function validateDestinationData(destinationSlug, payload, errors) {
  if (!payload || typeof payload !== "object") {
    errors.push(`${destinationSlug}: file must contain an object`);
    return;
  }

  Object.entries(payload).forEach(([sectionId, sectionPayload]) => {
    const baseCtx = `${destinationSlug}.${sectionId}`;

    SECTION_KEYS.forEach((key) => {
      if (!(key in sectionPayload)) {
        errors.push(`${baseCtx}: missing required key "${key}"`);
      }
    });

    if (Array.isArray(sectionPayload.officialResources)) {
      sectionPayload.officialResources.forEach((item, index) => {
        const linkCtx = `${baseCtx}.officialResources[${index}]`;
        validateLinkObject(item, linkCtx, errors);
        if (item?.href && !isOfficialSourceHostAllowed(destinationSlug, item.href)) {
          errors.push(`${linkCtx}: host is not in the allowed official-source list for ${destinationSlug}`);
        }
      });
    }

    if (!Array.isArray(sectionPayload.sections)) {
      errors.push(`${baseCtx}.sections must be an array`);
    } else {
      sectionPayload.sections.forEach((section, index) => {
        validateSectionCard(section, destinationSlug, `${baseCtx}.sections[${index}]`, errors);
      });
    }

    if (!Array.isArray(sectionPayload.faq)) {
      errors.push(`${baseCtx}.faq must be an array`);
    }

    if (!Array.isArray(sectionPayload.related)) {
      errors.push(`${baseCtx}.related must be an array`);
    }
  });
}

function main() {
  const files = readdirSync(DESTINATION_SECTIONS_DIR).filter((name) => name.endsWith(".json"));
  const errors = [];

  files.forEach((filename) => {
    const destinationSlug = filename.replace(".json", "");
    const absolutePath = path.join(DESTINATION_SECTIONS_DIR, filename);
    const raw = readFileSync(absolutePath, "utf8");
    const payload = JSON.parse(raw);
    validateDestinationData(destinationSlug, payload, errors);
  });

  if (errors.length) {
    console.error("Destination content validation failed:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log(`Destination content validation passed for ${files.length} file(s).`);
}

main();
