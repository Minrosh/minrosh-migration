import { randomUUID } from "node:crypto";
import { computeMagicLinkExpiryIso } from "@/lib/upload-magic-link";
import { normalizeUploadTokenParam } from "@/lib/upload-token";
import { hashMagicToken, verifyLegacyMagicToken, verifyMagicTokenHash } from "@/lib/admin/magic-token";
import { readCustomers, writeCustomers } from "./json-store";
import {
  readCrmInteractions,
  writeCrmInteractions,
  readCrmOpportunities,
  writeCrmOpportunities,
  readCrmTasks,
  writeCrmTasks,
  readCrmLeads,
  writeCrmLeads,
  readCrmConversationsBundle,
  writeCrmConversationsBundle,
  readCrmQuotes,
  writeCrmQuotes,
} from "./crm-store";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

function defaultCrmFields() {
  return {
    schemaVersion: 1,
    company: "",
    tags: [],
    socialProfiles: {},
    preferredChannel: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postcode: "",
    country: "",
    lastContactAt: null,
  };
}

function buildUploadFolder(name, id) {
  const idShort = String(id || "").replace(/^cust-/, "").slice(0, 8) || "customer";
  const slug = slugify(name) || "customer";
  return `${slug}-${idShort}`;
}

function migrateLegacyMagicTokenRow(id, plainToken) {
  const cur = findCustomerById(id);
  if (!cur || cur.magicTokenHash) return;
  const data = readCustomers();
  const customers = data.customers || [];
  const i = customers.findIndex((c) => c.id === id);
  if (i === -1) return;
  const next = { ...customers[i], magicTokenHash: hashMagicToken(plainToken) };
  delete next.magicToken;
  customers[i] = next;
  writeCustomers({ customers });
}

/**
 * Resolve customer by raw magic link token (URL segment). Supports hashed storage + legacy plaintext migration.
 */
export function findCustomerByMagicToken(rawToken) {
  const token = normalizeUploadTokenParam(rawToken);
  if (!token) return null;
  const { customers } = readCustomers();
  const list = Array.isArray(customers) ? customers : [];
  for (const c of list) {
    if (c.magicTokenHash) {
      if (verifyMagicTokenHash(token, c.magicTokenHash)) return findCustomerById(c.id);
      continue;
    }
    if (c.magicToken && verifyLegacyMagicToken(token, c.magicToken)) {
      migrateLegacyMagicTokenRow(c.id, token);
      return findCustomerById(c.id);
    }
  }
  return null;
}

export function materializeCustomerRow(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    ...defaultCrmFields(),
    ...raw,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    socialProfiles: raw.socialProfiles && typeof raw.socialProfiles === "object" ? raw.socialProfiles : {},
  };
}

export function findCustomerById(id) {
  const { customers } = readCustomers();
  const raw = customers.find((c) => c.id === id) || null;
  return materializeCustomerRow(raw);
}

/**
 * @returns {{ customer: object, plainToken: string }}
 */
export function addCustomer({ name, email, status, marketingConsent }) {
  const data = readCustomers();
  const customers = data.customers || [];
  const id = `cust-${randomUUID()}`;
  const issued = new Date().toISOString();
  const plainToken = randomUUID();
  const row = {
    ...defaultCrmFields(),
    id,
    magicTokenHash: hashMagicToken(plainToken),
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
    marketingConsent: Boolean(marketingConsent),
  };
  customers.unshift(row);
  writeCustomers({ customers });
  return { customer: row, plainToken: plainToken };
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
  if (Object.prototype.hasOwnProperty.call(patch, "magicToken") && patch.magicToken == null) {
    delete next.magicToken;
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

/**
 * @returns {{ customer: object, plainToken: string } | null}
 */
export function regenerateMagicLink(id) {
  const cur = findCustomerById(id);
  if (!cur) return null;
  const at = new Date().toISOString();
  const entry = { at, action: "magic_token_regenerated", detail: "Upload link rotated (new 72h window)" };
  const activityLog = [...(cur.activityLog || []), entry].slice(-200);
  const plainToken = randomUUID();
  const row = updateCustomer(id, {
    magicTokenHash: hashMagicToken(plainToken),
    magicToken: null,
    magicLinkIssuedAt: at,
    magicLinkExpiresAt: computeMagicLinkExpiryIso(),
    uploadOtpHash: null,
    uploadOtpExpiresAt: null,
    activityLog,
  });
  return row ? { customer: row, plainToken: plainToken } : null;
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

export function setCustomerDriveFolder(customerId, { driveFolderId, driveFolderUrl }) {
  const data = readCustomers();
  const customers = data.customers || [];
  const i = customers.findIndex((c) => c.id === customerId);
  if (i === -1) return null;
  customers[i] = {
    ...customers[i],
    driveFolderId: String(driveFolderId || "").trim(),
    driveFolderUrl: String(driveFolderUrl || "").trim(),
  };
  writeCustomers({ customers });
  return customers[i];
}

/**
 * @returns {{ type: string, ids: [string, string] }[]}
 */
export function findDuplicateCustomerCandidates() {
  const { customers } = readCustomers();
  const list = Array.isArray(customers) ? customers : [];
  const byEmail = new Map();
  const byMobile = new Map();
  const out = [];
  for (const c of list) {
    const e = String(c.email || "")
      .trim()
      .toLowerCase();
    const m = String(c.mobile || "").replace(/\D/g, "");
    if (e) {
      const existing = byEmail.get(e);
      if (existing) out.push({ type: "email", ids: [existing, c.id] });
      else byEmail.set(e, c.id);
    }
    if (m.length >= 8) {
      const suffix = m.slice(-8);
      const nameKey = String(c.name || "")
        .trim()
        .toLowerCase()
        .slice(0, 3);
      const key = `${nameKey}|${suffix}`;
      const ex = byMobile.get(key);
      if (ex) out.push({ type: "name_phone_suffix", ids: [ex, c.id] });
      else byMobile.set(key, c.id);
    }
  }
  return out;
}

export function mergeCustomers(winnerId, loserId) {
  const data = readCustomers();
  const customers = data.customers || [];
  const wi = customers.findIndex((c) => c.id === winnerId);
  const li = customers.findIndex((c) => c.id === loserId);
  if (wi === -1 || li === -1 || winnerId === loserId) {
    return { ok: false, error: "invalid_ids" };
  }
  const winner = customers[wi];
  const loser = customers[li];
  const mergedNotes = [winner.notes, loser.notes].filter(Boolean).join("\n---\n");
  const docsMap = new Map();
  for (const d of [...(winner.documents || []), ...(loser.documents || [])]) {
    const k = String(d.storedName || d.filename || Math.random());
    if (!docsMap.has(k)) docsMap.set(k, d);
  }
  const at = new Date().toISOString();
  const activityLog = [
    ...(winner.activityLog || []),
    ...(loser.activityLog || []),
    { at, action: "customer_merge", detail: `Merged record ${loserId} into ${winnerId}` },
  ].slice(-200);

  const int = readCrmInteractions();
  int.interactions = (int.interactions || []).map((i) =>
    i.customerId === loserId ? { ...i, customerId: winnerId } : i,
  );
  writeCrmInteractions(int);

  const opp = readCrmOpportunities();
  opp.opportunities = (opp.opportunities || []).map((o) =>
    o.customerId === loserId ? { ...o, customerId: winnerId } : o,
  );
  writeCrmOpportunities(opp);

  const tasks = readCrmTasks();
  tasks.tasks = (tasks.tasks || []).map((t) =>
    t.customerId === loserId ? { ...t, customerId: winnerId } : t,
  );
  writeCrmTasks(tasks);

  const leads = readCrmLeads();
  leads.leads = (leads.leads || []).map((l) =>
    l.customerId === loserId ? { ...l, customerId: winnerId } : l,
  );
  writeCrmLeads(leads);

  const conv = readCrmConversationsBundle();
  conv.conversations = (conv.conversations || []).map((c) =>
    c.customerId === loserId ? { ...c, customerId: winnerId } : c,
  );
  conv.messages = (conv.messages || []).map((m) =>
    m.customerId === loserId ? { ...m, customerId: winnerId } : m,
  );
  writeCrmConversationsBundle(conv);

  const quotes = readCrmQuotes();
  quotes.quotes = (quotes.quotes || []).map((q) =>
    q.customerId === loserId ? { ...q, customerId: winnerId } : q,
  );
  writeCrmQuotes(quotes);

  const nextWinner = {
    ...materializeCustomerRow(winner),
    notes: mergedNotes.slice(0, 20000),
    documents: Array.from(docsMap.values()),
    activityLog,
  };
  customers[wi] = nextWinner;
  const filtered = customers.filter((c) => c.id !== loserId);
  writeCustomers({ customers: filtered });
  return { ok: true, customer: nextWinner };
}
