import { randomUUID } from "node:crypto";
import { computeMagicLinkExpiryIso } from "@/lib/upload-magic-link";
import { readCustomers, writeCustomers } from "./json-store";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

function buildUploadFolder(name, id) {
  const idShort = String(id || "").replace(/^cust-/, "").slice(0, 8) || "customer";
  const slug = slugify(name) || "customer";
  return `${slug}-${idShort}`;
}

export function findCustomerByMagicToken(token) {
  const { customers } = readCustomers();
  return customers.find((c) => c.magicToken === token) || null;
}

export function findCustomerById(id) {
  const { customers } = readCustomers();
  return customers.find((c) => c.id === id) || null;
}

export function addCustomer({ name, email, status }) {
  const data = readCustomers();
  const customers = data.customers || [];
  const id = `cust-${randomUUID()}`;
  const issued = new Date().toISOString();
  const row = {
    id,
    magicToken: randomUUID(),
    magicLinkIssuedAt: issued,
    magicLinkExpiresAt: computeMagicLinkExpiryIso(),
    name: String(name || "").trim(),
    email: String(email || "").trim(),
    mobile: "",
    status: ["current", "past", "prospective"].includes(status) ? status : "prospective",
    createdAt: issued,
    uploadFolder: buildUploadFolder(name, id),
    notes: "",
    documents: [],
    activityLog: [{ at: issued, action: "customer_created", detail: "Record created" }],
  };
  customers.unshift(row);
  writeCustomers({ customers });
  return row;
}

export function updateCustomer(id, patch) {
  const data = readCustomers();
  const customers = data.customers || [];
  const i = customers.findIndex((c) => c.id === id);
  if (i === -1) return null;
  const next = { ...customers[i], ...patch };
  if (patch.status && !["current", "past", "prospective"].includes(patch.status)) {
    delete next.status;
  }
  customers[i] = next;
  writeCustomers({ customers });
  return customers[i];
}

export function deleteCustomer(id) {
  const data = readCustomers();
  const customers = (data.customers || []).filter((c) => c.id !== id);
  writeCustomers({ customers });
}

export function regenerateMagicLink(id) {
  const cur = findCustomerById(id);
  if (!cur) return null;
  const at = new Date().toISOString();
  const entry = { at, action: "magic_token_regenerated", detail: "Upload link rotated (new 72h window)" };
  const activityLog = [...(cur.activityLog || []), entry].slice(-200);
  return updateCustomer(id, {
    magicToken: randomUUID(),
    magicLinkIssuedAt: at,
    magicLinkExpiresAt: computeMagicLinkExpiryIso(),
    uploadOtpHash: null,
    uploadOtpExpiresAt: null,
    activityLog,
  });
}

export function mergePassportOcrHints(customerId, { fullName, dateOfBirth, sourceStoredName }) {
  const cur = findCustomerById(customerId);
  if (!cur) return null;
  const at = new Date().toISOString();
  const passportOcrLatest = {
    extractedAt: at,
    fullName: fullName ? String(fullName).trim().slice(0, 200) : null,
    dateOfBirth: dateOfBirth ? String(dateOfBirth).trim().slice(0, 32) : null,
    sourceStoredName: sourceStoredName ? String(sourceStoredName).slice(0, 200) : null,
    note: "Machine-assisted OCR — verify against the original document before use.",
  };
  const detailParts = [passportOcrLatest.fullName, passportOcrLatest.dateOfBirth].filter(Boolean);
  const logEntry = {
    at,
    action: "passport_ocr_hint",
    detail: detailParts.length ? detailParts.join(" · ") : "No confident fields extracted",
  };
  const activityLog = [...(cur.activityLog || []), logEntry].slice(-200);
  return updateCustomer(customerId, { passportOcrLatest, activityLog });
}

export function addDocumentToCustomer(customerId, doc) {
  const data = readCustomers();
  const customers = data.customers || [];
  const i = customers.findIndex((c) => c.id === customerId);
  if (i === -1) return null;
  const docs = [...(customers[i].documents || []), doc];
  const uploadFolder = customers[i].uploadFolder || buildUploadFolder(customers[i].name, customers[i].id);
  const logEntry = {
    at: new Date().toISOString(),
    action: "document_upload",
    detail: String(doc.filename || doc.storedName || "file"),
  };
  const activityLog = [...(customers[i].activityLog || []), logEntry].slice(-200);
  customers[i] = { ...customers[i], uploadFolder, documents: docs, activityLog };
  writeCustomers({ customers });
  return customers[i];
}
