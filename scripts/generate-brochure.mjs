/**
 * Builds a branded A4 landscape PDF for newsletter welcomes and contact auto-replies.
 * Run after dependency install: node scripts/generate-brochure.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFArray, PDFDocument, PDFName, PDFString, StandardFonts, rgb } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "assets");
const outFile = path.join(outDir, "minrosh-email-brochure.pdf");
const siteData = JSON.parse(fs.readFileSync(path.join(root, "data", "site.json"), "utf8"));

const SITE_URL = "https://minroshmigration.com.au";
const BOOK_URL = `${SITE_URL}/book-consultation`;
const ASSESSMENT_URL = `${SITE_URL}/assessment`;

const BRAND_PLUM = rgb(0.29, 0.11, 0.26);
const BRAND_ROSE = rgb(0.545, 0.239, 0.416);
const PASSPORT_BLUE = rgb(0.08, 0.16, 0.33);
const GOLD = rgb(0.8, 0.58, 0.2);
const INK = rgb(0.17, 0.13, 0.19);
const MUTED = rgb(0.35, 0.3, 0.34);
const SOFT_BG = rgb(0.985, 0.978, 0.965);
const SOFT_ROSE = rgb(0.985, 0.955, 0.972);
const SOFT_LINE = rgb(0.9, 0.85, 0.88);
const WHITE = rgb(1, 1, 1);

function wrapLines(text, maxWidth, font, size) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
      line = trial;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawParagraph(page, text, x, yStart, maxWidth, font, size, color, lineHeight) {
  let y = yStart;
  for (const line of wrapLines(text, maxWidth, font, size)) {
    page.drawText(line, { x, y, size, font, color });
    y -= lineHeight;
  }
  return y;
}

function drawSectionTitle(page, text, x, y, fontBold, size = 13) {
  page.drawText(text, { x, y, size, font: fontBold, color: BRAND_PLUM });
  return y - 18;
}

function drawBullet(page, text, x, y, maxWidth, font, fontBold, size = 9.8) {
  page.drawText("-", { x, y, size, font: fontBold, color: BRAND_ROSE });
  return drawParagraph(page, text, x + 13, y, maxWidth - 13, font, size, INK, 12.5) - 3;
}

function getAnnots(pdfDoc, page) {
  const existing = page.node.lookupMaybe(PDFName.of("Annots"), PDFArray);
  if (existing) return existing;
  const annots = pdfDoc.context.obj([]);
  page.node.set(PDFName.of("Annots"), annots);
  return annots;
}

function addLink(pdfDoc, page, x, y, width, height, uri) {
  const annots = getAnnots(pdfDoc, page);
  annots.push(
    pdfDoc.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [x, y, x + width, y + height],
      Border: [0, 0, 0],
      A: {
        Type: "Action",
        S: "URI",
        URI: PDFString.of(uri),
      },
    }),
  );
}

function drawButton(pdfDoc, page, { x, y, width, height, label, url, fontBold, primary = false }) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: primary ? BRAND_PLUM : WHITE,
    borderColor: primary ? BRAND_PLUM : BRAND_ROSE,
    borderWidth: 1.2,
  });
  const size = 10.5;
  const labelWidth = fontBold.widthOfTextAtSize(label, size);
  page.drawText(label, {
    x: x + (width - labelWidth) / 2,
    y: y + height / 2 - size / 3,
    size,
    font: fontBold,
    color: primary ? WHITE : BRAND_ROSE,
  });
  addLink(pdfDoc, page, x, y, width, height, url);
}

async function embedImage(pdfDoc, imagePath) {
  if (!fs.existsSync(imagePath)) return null;
  const bytes = fs.readFileSync(imagePath);
  try {
    return imagePath.toLowerCase().endsWith(".png")
      ? await pdfDoc.embedPng(bytes)
      : await pdfDoc.embedJpg(bytes);
  } catch {
    return null;
  }
}

async function drawLogo(pdfDoc, page, x, y) {
  const image =
    (await embedImage(pdfDoc, path.join(root, "public", "images", "minrosh-logo.png"))) ||
    (await embedImage(pdfDoc, path.join(root, "public", "images", "minrosh-logo.jpg")));

  if (!image) {
    page.drawRectangle({ x, y, width: 42, height: 42, color: BRAND_PLUM, opacity: 0.08 });
    page.drawText("M", { x: x + 12, y: y + 12, size: 24, font: await pdfDoc.embedFont(StandardFonts.HelveticaBold), color: BRAND_PLUM });
    return 42;
  }

  const logoW = 54;
  const logoH = image.height * (logoW / image.width);
  page.drawImage(image, { x, y, width: logoW, height: logoH });
  return logoW;
}

function drawCompass(page, x, y, fontBold) {
  page.drawCircle({ x, y, size: 34, color: rgb(0.96, 0.9, 0.76), borderColor: GOLD, borderWidth: 2 });
  page.drawCircle({ x, y, size: 24, borderColor: rgb(0.55, 0.37, 0.12), borderWidth: 0.8 });
  page.drawLine({ start: { x, y: y + 24 }, end: { x, y: y - 24 }, thickness: 0.7, color: rgb(0.45, 0.33, 0.18) });
  page.drawLine({ start: { x: x - 24, y }, end: { x: x + 24, y }, thickness: 0.7, color: rgb(0.45, 0.33, 0.18) });
  page.drawText("N", { x: x - 4, y: y + 17, size: 8, font: fontBold, color: BRAND_PLUM });
  page.drawText("S", { x: x - 4, y: y - 25, size: 8, font: fontBold, color: BRAND_PLUM });
  page.drawText("E", { x: x + 17, y: y - 3, size: 8, font: fontBold, color: BRAND_PLUM });
  page.drawText("W", { x: x - 26, y: y - 3, size: 8, font: fontBold, color: BRAND_PLUM });
  page.drawRectangle({ x: x - 3, y: y - 4, width: 6, height: 30, color: BRAND_ROSE, rotate: { type: "degrees", angle: 24 } });
  page.drawRectangle({ x: x - 3, y: y - 26, width: 6, height: 28, color: BRAND_PLUM, rotate: { type: "degrees", angle: 24 } });
}

function drawPassport(page, x, y, font, fontBold) {
  page.drawRectangle({
    x,
    y,
    width: 116,
    height: 82,
    color: PASSPORT_BLUE,
    borderColor: rgb(0.04, 0.08, 0.16),
    borderWidth: 1,
  });
  page.drawText("AUSTRALIA", { x: x + 27, y: y + 60, size: 9, font: fontBold, color: GOLD });
  page.drawText("PASSPORT", { x: x + 31, y: y + 14, size: 9, font: fontBold, color: GOLD });
  page.drawCircle({ x: x + 58, y: y + 42, size: 16, borderColor: GOLD, borderWidth: 1.2 });
  page.drawText("AUS", { x: x + 49, y: y + 39, size: 7, font, color: GOLD });
  page.drawLine({ start: { x: x + 36, y: y + 32 }, end: { x: x + 80, y: y + 32 }, thickness: 0.8, color: GOLD });
}

async function drawVisualPanel(pdfDoc, page, font, fontBold, x, y, width, height) {
  page.drawRectangle({ x, y, width, height, color: rgb(0.91, 0.87, 0.8) });
  const image =
    (await embedImage(pdfDoc, path.join(root, "public", "images", "brochure-passport-compass.png"))) ||
    (await embedImage(pdfDoc, path.join(root, "public", "images", "visual-strip-destinations.jpg")));
  if (image) {
    const scale = Math.min(width / image.width, height / image.height);
    const imageW = image.width * scale;
    const imageH = image.height * scale;
    page.drawImage(image, {
      x: x + (width - imageW) / 2,
      y: y + (height - imageH) / 2,
      width: imageW,
      height: imageH,
      opacity: 0.9,
    });
  } else {
    page.drawRectangle({ x, y, width, height, color: rgb(0.91, 0.87, 0.8) });
    page.drawRectangle({ x: x + 32, y: y + 26, width: width - 64, height: 86, color: rgb(0.7, 0.56, 0.38), opacity: 0.84 });
    page.drawRectangle({ x: x + 32, y: y + 108, width: width - 64, height: 8, color: rgb(0.42, 0.28, 0.16), opacity: 0.45 });
    drawPassport(page, x + 114, y + 128, font, fontBold);
    drawCompass(page, x + width - 96, y + 176, fontBold);
  }

  page.drawRectangle({ x: x + 24, y: y + 18, width: width - 48, height: 48, color: WHITE, opacity: 0.94 });
  page.drawText("A clear path starts with the right first step.", {
    x: x + 40,
    y: y + 46,
    size: 13,
    font: fontBold,
    color: BRAND_PLUM,
  });
  page.drawText("Use this guide to prepare, then choose consultation or assessment.", {
    x: x + 40,
    y: y + 28,
    size: 9.5,
    font,
    color: INK,
  });
}

async function main() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const brand = siteData.brand || {};

  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();
  const margin = 40;
  const leftW = 330;
  const rightX = margin + leftW + 32;
  const rightW = width - rightX - margin;

  page.drawRectangle({ x: 0, y: 0, width, height, color: SOFT_BG });
  page.drawRectangle({ x: rightX - 18, y: 0, width: rightW + 58, height, color: WHITE, opacity: 0.55 });

  const logoW = await drawLogo(pdfDoc, page, margin, height - 88);
  page.drawText("MinRosh Migration", {
    x: margin + logoW + 16,
    y: height - 58,
    size: 18,
    font: fontBold,
    color: BRAND_PLUM,
  });
  page.drawText("Migration and education guidance - Brisbane, Australia", {
    x: margin + logoW + 16,
    y: height - 76,
    size: 9.5,
    font,
    color: MUTED,
  });

  let y = height - 124;
  page.drawText("Welcome to", { x: margin, y, size: 28, font: fontBold, color: INK });
  y -= 34;
  page.drawText("MinRosh Migration", { x: margin, y, size: 30, font: fontBold, color: INK });
  y -= 28;
  y = drawParagraph(
    page,
    "Navigating Australian visa pathways can feel complex and overwhelming, but you are in the right place. We help individuals and families turn confusion into a clear, structured plan.",
    margin,
    y,
    leftW,
    font,
    10.2,
    INK,
    13,
  );
  y = drawParagraph(
    page,
    "Your journey starts with clarity, timing, and realistic preparation.",
    margin,
    y - 4,
    leftW,
    fontBold,
    10.2,
    BRAND_PLUM,
    13,
  );
  y -= 10;

  y = drawSectionTitle(page, "How we can help you", margin, y, fontBold);
  for (const item of [
    "Targeted visa planning for skilled, student, partner, visitor, and employer-sponsored pathways.",
    "Personalised strategy aligned to your background, goals, and timeline.",
    "Document coaching before formal lodgement or review.",
    "Broader destination context where it helps your planning.",
  ]) {
    y = drawBullet(page, item, margin, y, leftW, font, fontBold, 9.5);
  }

  y -= 10;
  y = drawSectionTitle(page, "Bonus: 3 things to prepare now", margin, y, fontBold);
  for (const item of [
    "Your latest resume or CV.",
    "English test scores or booking status, such as IELTS or PTE.",
    "Your current visa, previous visas, applications, refusals, and key expiry dates.",
  ]) {
    y = drawBullet(page, item, margin, y, leftW, font, fontBold, 9.5);
  }

  y -= 10;
  y = drawSectionTitle(page, "What to expect", margin, y, fontBold);
  drawParagraph(
    page,
    "Transparent, step-by-step communication: we understand your situation first, then outline sensible options, the sequence of work ahead, and clear fees and scope before paid services begin.",
    margin,
    y,
    leftW,
    font,
    9.4,
    INK,
    12,
  );

  await drawVisualPanel(pdfDoc, page, font, fontBold, rightX, height - 302, rightW, 188);

  const cardY = 92;
  page.drawRectangle({
    x: rightX + 18,
    y: cardY,
    width: rightW - 36,
    height: 144,
    color: WHITE,
    borderColor: SOFT_LINE,
    borderWidth: 1,
  });
  page.drawText("Your next step:", {
    x: rightX + 42,
    y: cardY + 105,
    size: 21,
    font: fontBold,
    color: INK,
  });
  page.drawText("Let's build your pathway", {
    x: rightX + 42,
    y: cardY + 78,
    size: 22,
    font: fontBold,
    color: BRAND_PLUM,
  });
  drawButton(pdfDoc, page, {
    x: rightX + 42,
    y: cardY + 34,
    width: 164,
    height: 30,
    label: "Book consultation",
    url: BOOK_URL,
    fontBold,
    primary: true,
  });
  drawButton(pdfDoc, page, {
    x: rightX + 216,
    y: cardY + 34,
    width: 154,
    height: 30,
    label: "Free assessment",
    url: ASSESSMENT_URL,
    fontBold,
  });
  page.drawText("Website: minroshmigration.com.au", { x: rightX + 42, y: cardY + 14, size: 8.8, font, color: MUTED });
  addLink(pdfDoc, page, rightX + 82, cardY + 10, 150, 14, SITE_URL);
  page.drawText(`Email: ${brand.email || "info@minroshmigration.com.au"}`, {
    x: rightX + 244,
    y: cardY + 14,
    size: 8.8,
    font,
    color: MUTED,
  });
  addLink(pdfDoc, page, rightX + 274, cardY + 10, 150, 14, `mailto:${brand.email || "info@minroshmigration.com.au"}`);

  const phoneText = `Phone: ${brand.phone || "0478 100 542"}`;
  page.drawText(phoneText, { x: rightX + 42, y: 62, size: 9.2, font: fontBold, color: BRAND_PLUM });
  addLink(pdfDoc, page, rightX + 42, 58, 110, 16, `tel:${String(brand.phone || "0478100542").replace(/\s+/g, "")}`);
  if (brand.phoneSecondary) {
    const altText = `Alternate: ${brand.phoneSecondary}`;
    page.drawText(altText, { x: rightX + 164, y: 62, size: 9.2, font: fontBold, color: BRAND_PLUM });
    addLink(pdfDoc, page, rightX + 164, 58, 118, 16, `tel:${String(brand.phoneSecondary).replace(/\s+/g, "")}`);
  }
  const whatsappNumber = brand.whatsapp || String(brand.phone || "0478100542").replace(/\D+/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20MinRosh%20Migration,%20I%20would%20like%20help%20with%20my%20visa%20pathway.`;
  page.drawText("WhatsApp: message us", { x: rightX + 294, y: 62, size: 9.2, font: fontBold, color: BRAND_PLUM });
  addLink(pdfDoc, page, rightX + 294, 58, 112, 16, whatsappUrl);

  page.drawText("General information only. This brochure does not constitute legal or migration advice.", {
    x: margin,
    y: 34,
    size: 8,
    font: fontBold,
    color: MUTED,
  });
  drawParagraph(
    page,
    "Immigration rules, visa charges, and processing settings change over time. Always verify requirements on official government sources or seek professional advice before relying on information for a decision.",
    margin,
    22,
    width - margin * 2,
    font,
    7.4,
    MUTED,
    9,
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
