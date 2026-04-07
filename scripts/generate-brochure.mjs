/**
 * Builds a simple branded A4 PDF for email auto-replies (no MARN copy, no agent photos).
 * Run after dependency install: node scripts/generate-brochure.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "assets");
const outFile = path.join(outDir, "minrosh-email-brochure.pdf");

const BRAND_PLUM = rgb(0.29, 0.11, 0.26);
const BRAND_ROSE = rgb(0.545, 0.239, 0.416);
const INK = rgb(0.17, 0.13, 0.19);
const MUTED = rgb(0.35, 0.3, 0.34);

function wrapLines(text, maxWidth, font, size) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const trial = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
      line = trial;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawParagraph(page, text, x, yStart, maxWidth, font, size, color, lineHeight) {
  const lines = wrapLines(text, maxWidth, font, size);
  let y = yStart;
  for (const line of lines) {
    page.drawText(line, { x, y, size, font, color });
    y -= lineHeight;
  }
  return y;
}

async function main() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const margin = 48;
  const contentW = width - margin * 2;

  const headerH = 108;
  page.drawRectangle({
    x: 0,
    y: height - headerH,
    width,
    height: headerH,
    color: BRAND_PLUM,
  });

  const logoPngPath = path.join(root, "public", "images", "minrosh-logo.png");
  let titleBlockX = margin + 58;
  if (fs.existsSync(logoPngPath)) {
    const logoBytes = fs.readFileSync(logoPngPath);
    let logoImage = null;
    try {
      logoImage = await pdfDoc.embedPng(logoBytes);
    } catch {
      try {
        logoImage = await pdfDoc.embedJpg(logoBytes);
      } catch {
        /* misnamed or unsupported asset — fall through to “M” mark */
      }
    }
    if (logoImage) {
      const logoW = 96;
      const scale = logoW / logoImage.width;
      const logoH = logoImage.height * scale;
      page.drawImage(logoImage, {
        x: margin,
        y: height - headerH + 20,
        width: logoW,
        height: logoH,
      });
      titleBlockX = margin + logoW + 18;
    }
  }
  if (titleBlockX === margin + 58) {
    page.drawRectangle({
      x: margin,
      y: height - headerH + 22,
      width: 44,
      height: 44,
      color: rgb(1, 1, 1),
      opacity: 0.12,
    });
    page.drawText("M", {
      x: margin + 12,
      y: height - headerH + 36,
      size: 28,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  }

  page.drawText("MinRosh Migration", {
    x: titleBlockX,
    y: height - headerH + 48,
    size: 22,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Migration & education guidance • Brisbane, Australia", {
    x: titleBlockX,
    y: height - headerH + 24,
    size: 10.5,
    font,
    color: rgb(0.98, 0.98, 0.97),
  });

  let y = height - headerH - 36;

  page.drawText("About us", { x: margin, y, size: 13, font: fontBold, color: BRAND_ROSE });
  y -= 22;
  y = drawParagraph(
    page,
    "MinRosh Migration helps individuals and families plan Australian visa and education pathways with structured guidance and practical next steps. We focus on clarity, timing, and realistic preparation before formal lodgement.",
    margin,
    y,
    contentW,
    font,
    11,
    INK,
    15,
  );
  y -= 10;

  page.drawText("How we can help", { x: margin, y, size: 13, font: fontBold, color: BRAND_ROSE });
  y -= 20;
  const bullets = [
    "Skilled migration, student, partner, and employer-sponsored pathway planning",
    "Personalised strategy aligned to your background, goals, and timeline",
    "Document and evidence preparation guidance ahead of formal review",
    "Support for Australia plus wider destination context where relevant",
  ];
  for (const b of bullets) {
    page.drawText("•", { x: margin, y, size: 11, font, color: BRAND_ROSE });
    y = drawParagraph(page, b, margin + 14, y, contentW - 14, font, 11, INK, 15);
    y -= 4;
  }
  y -= 8;

  page.drawText("What to expect", { x: margin, y, size: 13, font: fontBold, color: BRAND_ROSE });
  y -= 20;
  y = drawParagraph(
    page,
    "We aim for transparent, step-by-step communication: understanding your situation first, then outlining sensible options and the sequence of work ahead. Fees and scope are discussed clearly before you commit to paid services.",
    margin,
    y,
    contentW,
    font,
    11,
    INK,
    15,
  );
  y -= 14;

  page.drawRectangle({
    x: margin,
    y: y - 8,
    width: contentW,
    height: 1,
    color: rgb(0.9, 0.85, 0.88),
  });
  y -= 28;

  page.drawText("Contact", { x: margin, y, size: 13, font: fontBold, color: BRAND_ROSE });
  y -= 20;
  page.drawText("Website:  minroshmigration.com.au", { x: margin, y, size: 11, font, color: INK });
  y -= 16;
  page.drawText("Email:    info@minroshmigration.com.au", { x: margin, y, size: 11, font, color: INK });
  y -= 16;
  page.drawText("Phone:    +61 478 100 542", { x: margin, y, size: 11, font, color: INK });
  y -= 28;

  y = drawParagraph(
    page,
    "This brochure is for general information only and does not constitute legal advice. Immigration rules change; always confirm requirements against official sources or seek professional advice for your situation.",
    margin,
    y,
    contentW,
    font,
    9.5,
    MUTED,
    13,
  );

  fs.mkdirSync(outDir, { recursive: true });
  const bytes = await pdfDoc.save();
  fs.writeFileSync(outFile, bytes);
  console.log("Wrote", outFile);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
