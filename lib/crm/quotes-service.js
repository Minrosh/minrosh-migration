import { randomUUID } from "node:crypto";
import path from "node:path";
import { withMutationLock } from "@/lib/json-mutation-lock";
import { readCrmQuotes, writeCrmQuotes } from "@/lib/admin/crm-store";
import { crmQuotesFile } from "@/lib/admin/paths";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function lockPath() {
  return path.join(path.dirname(crmQuotesFile), ".crm-quotes.lock");
}

export function listQuotes() {
  const { quotes } = readCrmQuotes();
  return Array.isArray(quotes) ? [...quotes] : [];
}

export function findQuote(id) {
  return listQuotes().find((q) => q.id === id) || null;
}

export async function createQuote({ customerId, customerName, lines, validUntil, notes }) {
  const at = new Date().toISOString();
  const quoteNumber = `Q-${at.slice(0, 10).replace(/-/g, "")}-${randomUUID().slice(0, 6).toUpperCase()}`;
  const row = {
    id: `quote-${randomUUID()}`,
    schemaVersion: 1,
    createdAt: at,
    quoteNumber,
    customerId: String(customerId || "").trim(),
    customerName: String(customerName || "").trim().slice(0, 200),
    lines: Array.isArray(lines) ? lines : [],
    validUntil: String(validUntil || "").slice(0, 16),
    notes: String(notes || "").slice(0, 2000),
  };
  withMutationLock(lockPath(), () => {
    const { quotes } = readCrmQuotes();
    const list = Array.isArray(quotes) ? quotes : [];
    list.unshift(row);
    writeCrmQuotes({ quotes: list.slice(0, 2000) });
  });
  return row;
}

export async function renderQuotePdf(quote) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let y = 750;
  page.drawText("MinRosh Migration — Quote", { x: 50, y, size: 16, font: bold, color: rgb(0.15, 0.1, 0.2) });
  y -= 28;
  page.drawText(`Quote: ${quote.quoteNumber}`, { x: 50, y, size: 11, font });
  y -= 16;
  page.drawText(`Client: ${quote.customerName}`, { x: 50, y, size: 11, font });
  y -= 16;
  if (quote.validUntil) {
    page.drawText(`Valid until: ${quote.validUntil}`, { x: 50, y, size: 10, font });
    y -= 20;
  }
  y -= 10;
  for (const line of quote.lines || []) {
    const desc = String(line.description || line.label || "Item").slice(0, 120);
    const amt = Number(line.amount) || 0;
    page.drawText(`• ${desc} — $${amt.toFixed(2)} AUD`, { x: 50, y, size: 10, font });
    y -= 14;
    if (y < 80) break;
  }
  if (quote.notes) {
    y -= 10;
    page.drawText("Notes:", { x: 50, y, size: 10, font: bold });
    y -= 12;
    for (const line of String(quote.notes).slice(0, 500).split("\n")) {
      page.drawText(line.slice(0, 90), { x: 50, y, size: 9, font });
      y -= 12;
      if (y < 60) break;
    }
  }
  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
