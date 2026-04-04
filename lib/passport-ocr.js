/**
 * Best-effort OCR for passport-style identity images. Machine-assisted only — verify against the source document.
 * Disable with PASSPORT_OCR_DISABLED=true if workers or latency are problematic in your environment.
 */

function normalizeDobParts(day, month, yearStr) {
  const y = String(yearStr);
  const year = y.length === 2 ? (Number(y) > 30 ? `19${y}` : `20${y}`) : y;
  const dd = String(Number(day)).padStart(2, "0");
  const mm = String(Number(month)).padStart(2, "0");
  if (!/^\d{4}$/.test(year)) return null;
  const mi = Number(mm);
  const di = Number(dd);
  if (mi < 1 || mi > 12 || di < 1 || di > 31) return null;
  return `${year}-${mm}-${dd}`;
}

export function parsePassportOcrText(raw) {
  const text = String(raw || "").replace(/\r\n/g, "\n");
  let fullName = null;
  let dateOfBirth = null;

  const dobLabeled = text.match(
    /\b(?:date\s*of\s*birth|d\.?\s*o\.?\s*b\.?|born|birth\s*date)\s*[:\s]+(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/i
  );
  if (dobLabeled) {
    dateOfBirth = normalizeDobParts(dobLabeled[1], dobLabeled[2], dobLabeled[3]);
  }
  if (!dateOfBirth) {
    const iso = text.match(/\b(19|20)\d{2}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\b/);
    if (iso) dateOfBirth = iso[0].replace(/\//g, "-").slice(0, 10);
  }

  const surname = text.match(/\b(?:surname|family\s*name)\b\s*[:\s\n]+([A-Za-z][A-Za-z'\-\s]{1,42})/im);
  const given = text.match(/\bgiven\s*names?\b\s*[:\s\n]+([A-Za-z][A-Za-z'\-\s]{1,52})/im);
  if (surname && given) {
    fullName = `${given[1].trim()} ${surname[1].trim()}`.replace(/\s+/g, " ").trim();
  } else {
    const nameLine = text.match(/\bname\b\s*[:\s\n]+([A-Za-z][A-Za-z',.\-\s]{4,72})/im);
    if (nameLine) fullName = nameLine[1].trim().replace(/\s+/g, " ").replace(/[,;]+$/g, "");
  }

  return { fullName, dateOfBirth };
}

export async function extractPassportIdentityFromBuffer(buffer) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(buffer);
    return parsePassportOcrText(text);
  } finally {
    await worker.terminate();
  }
}
